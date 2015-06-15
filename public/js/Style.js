//

// WRITE FUNCTION DEFINITIONS HERE

var heightMap;
var heightMapString;

// Call this function everytime chatArea is updated.
// 1. Each time user sends a chat message
// 2. Each time a new message gets received

function scrollChatAreaToLatest(roomCode){
    var elements = $('#'+ roomCode + ' .chatArea');
    if (elements.length === 0) return;
    var element = elements[0];
    element.scrollTop = element.scrollHeight;
}



// CHECK IF BROWSER IS MOBILE
function checkIfMobile() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}
// End check mobile



var checkIfMobileResult = checkIfMobile(); // Global variable to keep track of mobile status

if (checkIfMobileResult === true) {
	//alert("mobile");
	setElementsMobileMode();
}

function setElementsMobileMode() {
  // Make home info box fill the screen, larger font
  var homeInfoBoxID = document.getElementById("homeInfoBox");
  homeInfoBoxID.style.width = "100%";
  homeInfoBoxID.style.fontSize = "35px";
  console.log("setHomeInfoBoxMobileMode");


  // Make hungry people count circle BIG
  var hungryPeopleCountCircle = document.getElementById("circle-HungryPeopleCount");
  hungryPeopleCountCircle.style.fontSize = "35px";
  hungryPeopleCountCircle.style.width = "200px";
  hungryPeopleCountCircle.style.height = "200px";
  hungryPeopleCountCircle.style.bottom = "100px";

  var expandButton = document.getElementById("expand");
  var collapseButton = document.getElementById("collapse");
  var closeForeverButton = document.getElementById("closeForever");
  expandButton.style.width = "100px";
  expandButton.style.height = "100px";
  expandButton.style.fontSize = "60px";

  collapseButton.style.width = "100px";
  collapseButton.style.height = "100px";
  collapseButton.style.fontSize = "60px";


  closeForeverButton.style.width = "100px";
  closeForeverButton.style.height = "100px";
  closeForeverButton.style.fontSize = "60px";

}


// DETECT NARROW MODE BEGIN
var windowWidth;
var documentWidth;
var flag_narrowWidth = 0;

windowWidth = $(window).width(); 
documentWidth = $(document).width(); 

console.log(windowWidth);
console.log(documentWidth);
if (windowWidth < 900 || documentWidth < 900) {
  flag_narrowWidth = 1;
}
console.log(flag_narrowWidth);


if (flag_narrowWidth) {
  //alert("narrow");
  removeExtraElementsFromNavigationBar();
}


function removeExtraElementsFromNavigationBar() {
	// EXISTING BUG: SEARCH BOX IS NOT CLICKABLE IN NARROW MODE


	var threeButtonsID = document.getElementById("three-buttons");
	threeButtonsID.style.visibility = "hidden";
	threeButtonsID.style.zIndex = "-100";

	console.log("removeExtraElementsFromNavigationBar");
	var homeInfoBoxID = document.getElementById("homeInfoBox");
	homeInfoBoxID.style.top = "60px";

}
// DETECT NARROW MODE END




// HOME INFO BOX ADVANCED HIDE AND SHOW BEGIN
$("#homeInfoBox-more").hide(); // run this line on load
$("#closeForever").hide(); // run this line on load

var expansionStatus = 1; // Global Variable: Keep track of expansion status 

$(document).ready(function(){
    $("#collapse").click(function(){
        if (expansionStatus === 1) {
        	$("#homeInfoBox-basic").slideUp();
        	$('#collapse').hide();
        	$('#expand').show();
        	$("#closeForever").show();
        	expansionStatus--;
        	console.log(expansionStatus);
    	}
    	else if (expansionStatus === 2) {
    		$("#homeInfoBox-more").slideUp();
    		$('#expand').show();
    		expansionStatus--;
    		console.log(expansionStatus);
    	}
    });

    $("#expand").click(function(){
    	if (expansionStatus === 0) {
        	$("#homeInfoBox-basic").slideDown();
        	$('#collapse').show();
        	$('#expand').show();
        	expansionStatus++;
        	$("#closeForever").hide();
        	console.log(expansionStatus);

    	}

    	else if (expansionStatus === 1) {
    		$("#homeInfoBox-more").slideDown();
			$('#expand').hide();
    		expansionStatus++;
    		console.log(expansionStatus);
    	}
    });


	$("#closeForever").click(function(){
		$("#homeInfoBox").slideUp();
	})

});
// HOME INFO BOX ADVANCED HIDE AND SHOW END
