// WRITE FUNCTION DEFINITIONS HERE


// Call this function everytime chatArea is updated.
// 1. Each time user sends a chat message
// 2. Each time a new message gets received

function scrollChatAreaToLatest(){
    var element = document.getElementById("chatArea");
    element.scrollTop = element.scrollHeight;
}




//Call Funtions Here
//setInterval(scrollChatAreaToLatest,1000);
