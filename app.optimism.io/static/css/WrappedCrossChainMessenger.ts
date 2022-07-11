import { AddressLike, CrossChainMessenger } from "@eth-optimism/sdk";
import { Web3Provider } from "@ethersproject/providers";
import * as snx from "@synthetixio/contracts-interface";
import { Kovan, Mainnet, Optimism } from "@usedapp/core";
import { BigNumber, BigNumberish } from "ethers";
import React, { useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import "./App.scss";
import { TokenListItem } from "./types";

// TODO move this logic to sdk
export const useTemporarySnx = (chainId?: number, library?: Web3Provider) => {
  const signer = React.useMemo(() => library?.getSigner(), [library]);
  // and then instantiate synthetix with the signer
  const network =
    chainId === Mainnet.chainId
      ? ("mainnet" as const)
      : chainId === Kovan.chainId
      ? ("kovan" as const)
      : chainId === Optimism.chainId
      ? ("mainnet-ovm" as const)
      : ("kovan-ovm" as const);

  const snxjs = useMemo(
    () =>
      (signer &&
        chainId &&
        snx.synthetix({
          network,
          signer,
        })) ||
      undefined,
    [signer, chainId, network],
  );

  // to deposit
  // https://github.com/Synthetixio/synthetix-mintr/blob/b57368e0c6038c266bb6fe8badc6328021cb37f7/src/pages/L2Onboarding/Deposit.tsx
  const doSnxDeposit = React.useCallback(
    async (amount: BigNumberish, opts: any) => {
      if (!snxjs) {
        throw new Error("snx never initialized");
      }
      const response = await snxjs.contracts.SynthetixBridgeToOptimism.deposit(
        BigNumber.from(amount),
      );
      return response;
    },
    [snxjs],
  );

  // TO withdraw
  // https://github.com/Synthetixio/synthetix-mintr/blob/b57368e0c6038c266bb6fe8badc6328021cb37f7/src/screens/DepotActions/Withdraw/index.js
  const doSnxWithdraw = React.useCallback(
    async (amount: BigNumberish, opts: any) => {
      if (!snxjs) {
        throw new Error("snx never initialized");
      }
      const response = snxjs.contracts.SynthetixBridgeToBase.withdraw(
        BigNumber.from(amount),
      );
      return response;
    },
    [snxjs],
  );

  // To approve
  // https://github.com/Synthetixio/synthetix-mintr/blob/b57368e0c6038c266bb6fe8badc6328021cb37f7/src/pages/L2Onboarding/Deposit.tsx#L69
  const doSnxApprove = React.useCallback(
    async (allowance: BigNumberish, opts: any) => {
      const response = await snxjs?.contracts.Synthetix.approve(
        snxjs.contracts.SynthetixBridgeToOptimism?.address,
        BigNumber.from(allowance),
      );
      await response.wait();
      return response;
    },
    [snxjs],
  );

  const doSnxApproveWithdraw = React.useCallback(
    async (allowance: BigNumberish, opts: any) => {
      const response = await snxjs?.contracts.Synthetix.approve(
        snxjs.contracts.SynthetixBridgeToBase?.address,
        BigNumber.from(allowance),
      );
      await response.wait();
      return response;
    },
    [snxjs],
  );

  // TO estimate gas
  // https://github.com/Synthetixio/synthetix-mintr/blob/b57368e0c6038c266bb6fe8badc6328021cb37f7/src/pages/L2Onboarding/Deposit.tsx#L136
  const estimateGasDeposit = React.useCallback(
    async (amount: BigNumberish, opts: any) => {
      if (!snxjs) {
        throw new Error("snx never initialized");
      }
      return snxjs.contracts.SynthetixBridgeToOptimism.estimateGas.deposit(
        BigNumber.from(amount),
      );
    },
    [snxjs],
  );
  const estimateGasWithdraw = React.useCallback(
    async (amount: BigNumberish, opts: any) => {
      if (!snxjs) {
        throw new Error("snx never initialized");
      }
      return snxjs.contracts.SynthetixBridgeToBase.estimateGas.withdraw(
        BigNumber.from(amount),
      );
    },
    [snxjs],
  );

  const Messenger = React.useMemo(
    () =>
      class WrappedCrossChainMessenger extends CrossChainMessenger {
        static readonly SNX_ERC20_ADDRESS = snxjs?.contracts.Synthetix?.address.toLowerCase();
        static readonly isSnx: (address: AddressLike) => boolean = address => {
          return typeof address === "string"
            ? address.toLowerCase() ===
                WrappedCrossChainMessenger.SNX_ERC20_ADDRESS
            : address.address.toLowerCase() ===
                WrappedCrossChainMessenger.SNX_ERC20_ADDRESS;
        };

        constructor(
          public readonly selectedAsset: TokenListItem,
          ...args: ConstructorParameters<typeof CrossChainMessenger>
        ) {
          super(...args);
          this.bridges =
            selectedAsset.symbol === "DAI"
              ? { DAI: this.bridges.DAI }
              : this.bridges;
          this.depositERC20 = (l1Token, l2Token, amount, opts) => {
            if (WrappedCrossChainMessenger.isSnx(l1Token)) {
              return doSnxDeposit(amount, opts);
            }
            return super.depositERC20(l1Token, l2Token, amount, opts);
          };
          this.withdrawERC20 = (l1Token, l2Token, amount, opts) => {
            if (
              WrappedCrossChainMessenger.isSnx(l1Token) ||
              WrappedCrossChainMessenger.isSnx(l2Token)
            ) {
              return doSnxWithdraw(amount, opts);
            }
            return super.withdrawERC20(l1Token, l2Token, amount, opts);
          };
          this.getBridgeForTokenPair = async (l1Token, l2Token) => {
            if (WrappedCrossChainMessenger.isSnx(l1Token)) {
              return {
                l1Bridge: snxjs?.contracts.SynthetixBridgeToOptimism?.address,
              } as any;
            }
            return super.getBridgeForTokenPair(l1Token, l2Token);
          };
          this.approveERC20 = (l1Address, l2Address, amount, opts) => {
            if (WrappedCrossChainMessenger.isSnx(l1Address)) {
              try {
                return doSnxApprove(amount, opts);
              } catch (e) {
                console.log(e);
                throw e;
              }
            }
            return super.approveERC20(l1Address, l2Address, amount);
          };
          const originalEstimateGas = this.estimateGas;
          this.estimateGas = {
            ...this.estimateGas,
            depositERC20: (l1Token, l2Token, amount, opts) => {
              if (WrappedCrossChainMessenger.isSnx(l1Token)) {
                return estimateGasDeposit(amount, opts).catch(e => {
                  console.log(e);
                  throw e;
                });
              }
              return originalEstimateGas.depositERC20.call(
                this,
                l1Token,
                l2Token,
                amount,
                opts,
              );
            },
            withdrawERC20: (l1Token, l2Token, amount, opts) => {
              if (
                WrappedCrossChainMessenger.isSnx(l1Token) ||
                WrappedCrossChainMessenger.isSnx(l2Token)
              ) {
                return estimateGasWithdraw(amount, opts);
              }
              return originalEstimateGas.withdrawERC20.call(
                this,
                l1Token,
                l2Token,
                amount,
                opts,
              );
            },
          };
        }
      },
    [
      doSnxApprove,
      doSnxDeposit,
      doSnxWithdraw,
      estimateGasDeposit,
      estimateGasWithdraw,
      snxjs?.contracts.Synthetix?.address,
      snxjs?.contracts.SynthetixBridgeToOptimism?.address,
    ],
  );

  return React.useMemo(
    () => ({
      snxjs,
      doSnxDeposit,
      doSnxWithdraw,
      estimateGasDeposit,
      estimateGasWithdraw,
      doSnxApprove,
      doSnxApproveWithdraw,
      WrappedCrossChainMessenger: Messenger,
    }),
    [
      Messenger,
      doSnxApprove,
      doSnxApproveWithdraw,
      doSnxDeposit,
      doSnxWithdraw,
      estimateGasDeposit,
      estimateGasWithdraw,
      snxjs,
    ],
  );
};
