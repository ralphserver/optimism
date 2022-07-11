import { Kovan, Mainnet, useEthers } from "@usedapp/core";
import { lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffectOnce } from "react-use";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { transactionTypes } from "./constants";
import { airdropRoutes, routes } from "./constants/routes";
import { featureFlags } from "./featureFlags";
import { useConnectToWeb3MobileAutomatically } from "./hooks/useConnectToMetamaskMobileAutomatically";
import { AddDelegates } from "./pages/Airdrop/components/delegateCreator/AddDelegates";
import { GlobalAppProviders } from "./providers/GlobalAppProviders";
import {
  assetState,
  crossChainMessengerState,
  showConnectModalState,
} from "./state";
import { getSignersOrProviders, isTestNetwork } from "./utils/helpers";
import { useTemporarySnx } from "./WrappedCrossChainMessenger";

const LazyAccount = lazy(() => import("./components/Account"));
const LazyTransactionFlow = lazy(() => import("./components/TransactionFlow"));
const loadWalletConnector = () => import("./components/WalletConnector");
const LazyWalletConnector = lazy(loadWalletConnector);
const LazyTermsConditions = lazy(() => import("./components/TermsConditions"));
const LazyPrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

const LazyAnnouncement = lazy(() => import("./components/Announcement"));

const LazyAirdrop = lazy(async () => {
  const { Airdrop } = await import("./pages/Airdrop");
  return { default: Airdrop };
});
const LazyGettingStarted = lazy(async () => {
  const { GettingStarted } = await import("./pages/GettingStarted");
  return { default: GettingStarted };
});

const LazyPublicDelegates = lazy(() => import("./pages/PublicDelegates"));

export const AppRoutes: React.FC<{}> = () => {
  const showConnectModal = useRecoilValue(showConnectModalState);
  // Preload the connect modal
  useEffectOnce(() => {
    loadWalletConnector();
  });

  // when a user is on metamask mobile we want to prompt them to connect right away
  useConnectToWeb3MobileAutomatically();

  const { library, account, chainId } = useEthers();
  const selectedAsset = useRecoilValue(assetState);
  const setCrossChainMessenger = useSetRecoilState(crossChainMessengerState);

  const temporarySnx = useTemporarySnx(chainId, library);

  useEffect(() => {
    if (account && library && chainId) {
      const { l1SignerOrProvider, l2SignerOrProvider } = getSignersOrProviders(
        chainId,
        library,
      );

      // TODO this should be in sdk not here
      // we wrap crossChainMessenger to add snx support
      const messenger = new temporarySnx.WrappedCrossChainMessenger(
        selectedAsset,
        {
          l1SignerOrProvider: l1SignerOrProvider,
          l2SignerOrProvider: l2SignerOrProvider,
          l1ChainId: isTestNetwork(chainId) ? Kovan.chainId : Mainnet.chainId,
        },
      );
      setCrossChainMessenger(messenger);
    }
  }, [
    account,
    chainId,
    library,
    temporarySnx,
    setCrossChainMessenger,
    selectedAsset,
  ]);

  return (
    <GlobalAppProviders>
      <Routes>
        <Route
          path={routes.GOVERNANCE_LEGACY.template()}
          element={<Navigate replace to={routes.ANNOUNCEMENT.create({})} />}
        />
        <Route
          path={routes.AIRDROP.create({ step: "" })}
          element={
            <Navigate
              replace
              to={routes.AIRDROP.create({
                step: airdropRoutes.CHECK_ELIGIBILITY,
              })}
            />
          }
        />
        <Route
          path="/"
          element={<Navigate replace to={routes.HOME.create({})} />}
        />
        <Route
          path={routes.HOME.template()}
          element={
            <LazyTransactionFlow
              snx={temporarySnx}
              type={transactionTypes.DEPOSIT}
            />
          }
        />
        <Route
          path={routes.WITHDRAW.template()}
          element={
            <LazyTransactionFlow
              snx={temporarySnx}
              type={transactionTypes.WITHDRAW}
            />
          }
        />
        <Route path={routes.ACCOUNT.template()} element={<LazyAccount />} />
        <Route
          path={routes.TERMS.template()}
          element={<LazyTermsConditions />}
        />

        <Route
          path={routes.PRIVACY_POLICY.template()}
          element={<LazyPrivacyPolicy />}
        />

        <Route
          path={routes.ANNOUNCEMENT.template()}
          element={<LazyAnnouncement />}
        />
        <Route path={routes.AIRDROP.template()} element={<LazyAirdrop />} />
        <Route
          path={routes.DELEGATES.template()}
          element={<LazyPublicDelegates />}
        />
        {featureFlags.ENABLE_GETTING_STARTED && (
          <Route
            path={routes.GETTING_STARTED.template()}
            element={<LazyGettingStarted />}
          />
        )}
        {featureFlags.ENABLE_DELEGATE_ADDER && (
          <Route path={"/adder"} element={<AddDelegates />} />
        )}
      </Routes>
      {showConnectModal && <LazyWalletConnector />}
    </GlobalAppProviders>
  );
};
