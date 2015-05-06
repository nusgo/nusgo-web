//

// WRITE FUNCTION DEFINITIONS HERE

var heightMap;
var heightMapString;

// Call this function everytime chatArea is updated.
// 1. Each time user sends a chat message
// 2. Each time a new message gets received

function scrollChatAreaToLatest(){
    var element = document.getElementById("chatArea");
    element.scrollTop = element.scrollHeight;
}



function setMapSize() {
	heightMap = $(window).height() - 100;

	heightMapString = "height:"+heightMap+"px";

	//document.getElementById("googleMap").setAttribute("style",heightMapString);
	document.getElementById("googleMap").setAttribute("style","height:200px");



}

function resize()
{
 //alert("resize: setting map size...");
 //setMapSize();
}



window.setInterval(function(){
  resize();
}, 5000);

//setMapSize();

//while(1) {
	
//}
//window.setInterval(resize(),2000);

//Call Funtions Here
//setMapSize();

//window.onresize = resize;