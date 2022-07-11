function makerandom(length){

	var result="";
	var characters='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength=characters.length;

	for (var i =0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random()*charactersLength));
	}
	return result;
}

//DOM manipulation

function shutx(element){
$(element).fadeOut('fast');
}

function openx(element){
$(element).fadeIn('fast');
}


function startbigloader(){
 openx('#loader');
}

function closebigloader(){
  shutx('#loader');
}





function shutnearest(thiselement,element){
$(thiselement).closest(element).hide();
}


function togview(){
  var passwrzz=document.getElementById('passwrzz').type;

  if(passwrzz=="password"){
document.getElementById('passwrzz').type="text";
$('.forgpass').html("Hide password");
  }else{
document.getElementById('passwrzz').type="password";
$('.forgpass').html("Show password");
  };

}

function opensidenav(){
var sidenav=document.getElementById('sidenav');
sidenav.style.width="80%";


}

function closesidenav(){
var sidenav=document.getElementById('sidenav');
sidenav.style.width="0px";
}

function goelement(element){
 $('html, body').animate({
    scrollTop: $(element).offset().top - 80
 }, 500);
 closemenu();
}


function cprog(cprogid,cprogvalue,cprogtextid){

 var circle = document.getElementById(cprogid);
 var radius = circle.r.baseVal.value;
var circumference = radius * 2 * Math.PI;
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = `${circumference}`;

 const offset = circumference - cprogvalue / 100 * circumference;
  circle.style.strokeDashoffset = offset;
$("#"+cprogtextid).text(cprogvalue+"%");

 }


 function copyfunc(id){
  var copied=$(id);

  alert(id);

  copied.select();
  document.execCommand("copy");
  notify("Text copied!");
}


//End of DOM manipulation



//notifications


function notify(details,type){
$('.nothdetails').html(details);
openx('.noth');

if(type=="" || type=="success" || !type){

$(".noth").addClass('greennoth');
$(".noth").removeClass('rednoth');

}else{
$(".noth").removeClass('greennoth');
$(".noth").addClass('rednoth');

};

$('.noth').animate({opacity:'1'},'500');

setTimeout(closenotify,10000);
}


function closenotify(){
$('.noth').animate({opacity:'0'},'500');
shutx('.noth');
}

function confirmnotify(details,callback,dta1,dta2,dta3){
  openx('#confirmbox');
  $('.confdetails').html(details);

  if(!dta1 && !dta2){
var html='<button class="rtd lft" onclick="shutx(`#confirmbox`)">Cancel</button><button class="rtd rgt" onclick="'+callback+'();shutx(`#confirmbox`)">Ok</button>';
  }else if(dta1 && !dta2){
var html='<button class="rtd lft" onclick="shutx(`#confirmbox`)">Cancel</button><button class="rtd rgt" onclick="'+callback+'(`'+dta1+'`);shutx(`#confirmbox`)">Ok</button>';
  }else if(dta1 && dta2 && !dta3){
var html='<button class="rtd lft" onclick="shutx(`#confirmbox`)">Cancel</button><button class="rtd rgt" onclick="'+callback+'(`'+dta1+'`,`'+dta2+'`);shutx(`#confirmbox`)">Ok</button>';  
alert(dta3);
  }else if(dta1 && dta2 && dta3){
var html='<button class="rtd lft" onclick="shutx(`#confirmbox`)">Cancel</button><button class="rtd rgt" onclick="'+callback+'(`'+dta1+'`,`'+dta2+'`,`'+dta3+'`);shutx(`#confirmbox`)">Ok</button>';
  }

  $('.nbc').html(html);
}


//End of notificatons




// Validations

function checkinput(element,btn,max){

  var elementdata=$(element).val();

  if(isNaN(elementdata)){
notify("Please input numbers only!","error");
shutx(btn);
  }else{
closenotify();
openx(btn);
  };


}



//End of validations






//Communicating with server


function sendform(surl,form,servicetype,dataone){
closenotify();
var counter=0;
var fgfg=form+" "+"input";

$(fgfg).each(function(){

var inputval=$(this).val();

if(inputval==""){
  counter=counter+0;
}else{
  counter=counter+0;
}


});

var sgsg=form+" "+"select";


$(sgsg).each(function(){

var inputval=$(this).val();

if(inputval=="Please choose one"){
  counter=counter+0;
}else{
  counter=counter+0;
}

});


if(counter >= 1){
var errbox=form+" "+".error";
notify("Please fill in all details!","error");

}else{
var datatosend=JSON.stringify($(form).formToJson());;

startloader();

$.ajax({
url: surl,
type: 'POST',
data: datatosend,
cache: false,
contentType:'application/json; charset=utf-8',
dataType: 'json',
success:function(resp){
closeloader();
parser(resp,servicetype,dataone)
},
error: function(data){
closeloader();
notify("An error happened,couldn't connect!","error");
}
});



}

};



function sendformtwo(surl,form,servicetype){

closenotify();
var counter=0;
var fgfg=form+" "+"input";

$(fgfg).each(function(){

var inputval=$(this).val();

if(inputval==""){
  counter=counter+1;
}else{
  counter=counter+0;
}


});

var sgsg=form+" "+"select";


$(sgsg).each(function(){

var inputval=$(this).val();

if(inputval=="Please choose one"){
  counter=counter+1;
}else{
  counter=counter+0;
}

});


if(counter >= 1){
var errbox=form+" "+".error";
notify("Please fill in all details!","error");

}else{

var xform=$(form).serialize();

startbigloader();

$.ajax({
url: surl,
type: 'POST',
data: xform,
cache: false,
dataType: 'json',

success:function(resp){
closebigloader();
parser(resp,servicetype);
},
error: function(data){
closebigloader();
notify("An error happened!","error");
}

});



}
};






function sendjson(datatosend,url,servicetype){

startbigloader();

$.ajax({
url: url,
type: 'POST',
data: datatosend,
cache: false,
contentType:'application/json; charset=utf-8',
dataType: 'json',
success:function(resp){
closebigloader();
parser(resp,servicetype)
},
error: function(data){
closebigloader();
notify("An error happened!","error");
}
});


var sgsg=form+" "+"select";


$(sgsg).each(function(){

var inputval=$(this).val();

if(inputval=="Please choose one"){
  counter=counter+1;
}else{
  counter=counter+0;
}

});


if(counter >= 1){
var errbox=form+" "+".error";
notify("Please fill in all details!","error");

}else{
var datatosend=JSON.stringify($(form).formToJson());


startbigloader();

$.ajax({
url: surl,
type: 'POST',
data: datatosend,
cache: false,
contentType:'application/json; charset=utf-8',
dataType: 'json',
success:function(resp){
closebigloader();
parser(resp,servicetype);
},
error: function(data){
closebigloader();
notify("An error happened!","error");
}
});



}
};


function sendjson(data,url,servicetype){
startloader();
$.ajax({
url: surl,
type: 'POST',
data: datatosend,
cache: false,
contentType:'application/json; charset=utf-8',
dataType: 'json',
success:function(resp){
closeloader();
parser(resp,servicetype);
},
error: function(data){
closeloader();
notify("An error happened!","error");
}
});

}



function getpage(link,container){

$(container).html("");
shutx("#pageerror");
startloader("contain");

$.ajax({
url: link,
type: 'GET',
cache: false,

success:function(resp){
closeloader();
$(container).html(resp);
},

error: function(data){
closeloader();
notify("An error happened!","error");
openx('#pageerror');
}

});



}


function getresponse(link,servicetype){

startbigloader();

$.ajax({
url: link,
type: 'GET',
cache: false,
async:false,
success:function(resp){

closebigloader();
$('#responsebox').html(resp);
checkresponse(servicetype);
},

error: function(data){
closebigloader();
notify("An error happened!","error");
}

});

}


function getjsonresponse(link,servicetype,dataspace){
  
startloader();
alert(dataspace);

$.ajax({
url: link,
type: 'GET',
cache: false,
dataType: 'json',
async:false,

success:function(resp){
closeloader();
parser(resp,servicetype,dataspace);
},

error: function(data){
closeloader();
notify("An error happened!","error");
}

});
};



//End of server communication


function passto(elem1,elem2){
var content=$(elem1).val();
$(elem2).val(content);

}


function formatbytes(bytes,decimals=2){
  if(bytes===0) return '0B';
  const k=1024;
  const dm= decimals < 0 ? 0: decimals;
  const sizes=['B','KB','MB','GB','TB','PB','EB','ZB','YB'];
  const i=Math.floor(Math.log(bytes)/Math.log(k));

  return parseFloat((bytes/Math.pow(k,i)).toFixed(dm))+' '+sizes[i];

}

function autoresize(elem){
  elem.style.height='auto';
  elem.style.height=elem.scrollHeight+'px';
}

function subscribe(elem,courseid){

var link="./process/subcribecourse.php?courseid="+courseid;


getresponse(link,"subscribe");


}


function getnotipage(link,container){

$.ajax({
url: link,
type: 'GET',
cache: false,

success:function(resp){
$(container).html(resp);
},

});



}

function onlhandler(){
getnotipage('./process/notifications.php','.znoti');

}

function deletenotifi(id){
  var link="./process/deletenoti.php?id="+id;

startbigloader();

  $.ajax({
url: link,
type: 'GET',
cache: false,

success:function(resp){
$('#responsebox').html(resp);
closebigloader();
},
error: function(data){
closebigloader();
notify("An error happened!","error");
}
});

}


function deletenotifi2(id){
  var link="./process/deletenoti2.php?id="+id;

startbigloader();

  $.ajax({
url: link,
type: 'GET',
cache: false,

success:function(resp){
$('#responsebox').html(resp);
closebigloader();
},
error: function(data){
closebigloader();
notify("An error happened!","error");
}
});

}

