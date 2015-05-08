function ChatService() {
    this.rooms = [];//for keeping track of rooms entered before
    var self = this;
    this.socket = io();
    this.socket.on("chatMessage",function(chatMessage){
        self.receiveMessage(chatMessage);
    });
}

ChatService.prototype.receiveMessage = function(chatMessage) {
    this.openChat(chatMessage.markerName, chatMessage.roomCode);
    var roomCode = chatMessage.roomCode;
    $('#'+ roomCode + ' .chatArea').append(
    '<p><img id = "chatProfilePic" src="//graph.facebook.com/' + chatMessage.fromId + '/picture">'+
    " " + chatMessage.content + "</p>");
    scrollChatAreaToLatest(roomCode);
};

ChatService.prototype.sendMessage = function(chat) {
    console.log(this);
    var name = controller.userAuth.userName;
    var id = controller.userAuth.userID;
    var roomCode = this.roomCode;
    if (chat != ""){
        $('#'+ roomCode + ' .chatField').val('');
        $('#'+ roomCode + ' .chatArea').append(
            '<p><img id = "chatProfilePic" src="//graph.facebook.com/' + id + '/picture">'+
            " " + chat + "</p>");
    }
    var chatMessage = new ChatMessage(this.markerName, this.roomCode, chat);
    this.socket.emit("chatMessage",chatMessage.toDictionary());
    scrollChatAreaToLatest(roomCode);
};

ChatService.prototype.openChat = function(markerName, roomCode) {

    //checks if user has entered room before (via roomCode)
    //if not in room before, append chatbox html with id = roomcCode
    var found = false;
    for (var i = 0; i < this.rooms.length; i++){
        if (this.rooms[i] === roomCode){
            console.log("room visited before");
            found = true;
        }
    }

    if (found === false){
        console.log("room not visited before, pushing room to records");
        this.rooms.push(roomCode);
        this.appendNewRoomHTML(markerName, roomCode);       
    }

    console.log("openChat: " + roomCode);
    $('#'+roomCode).fadeIn({queue: false, duration: 'slow'});
    $('#'+roomCode).animate({
            height: "500px"
        }, 800, function(){
    });
    $('#promptBackground').fadeIn(600);
    this.markerName = markerName;
    this.roomCode = roomCode;

    var self = this;
    //sending message
    $('#'+ roomCode + ' .chatField').keydown(function(event){
        if (event.keyCode === 13){
            var chat = $('#'+ roomCode + ' .chatField').val();
            self.sendMessage(chat);

        }
    });

    //press going button
    var index;
    var self = this;
    $('#'+ roomCode + ' .goStatus').click(function(){
        console.log("status CLICKED");
    });
};

ChatService.prototype.appendNewRoomHTML = function(markerName, roomCode) {
    $("#chatSection").append(
        '<div class = "chatBox" id = ' + roomCode + '>'+
            '<div class = "container-fluid">'+
                '<div class = "row" id = "chatTitle">'+
                    '<h2 class = "col-sm-12 col-md-12">' +
                    markerName + ' is hungry!</h2>'+
                '</div>'+
                '<div class = "row">'+
                    '<div class = "container-fluid">'+
                        '<div class = "row">'+
                            '<div class = "col-sm-9 col-md-9">'+
                                '<div class = "row">'+
                                    '<div class = "chatArea" class = "col-md-12 col-sm-12"></div>'+
                                '</div>'+
                                '<div class = "row">'+
                                    '<div class = "col-md-12 col-sm-12">'+
                                        '<form>'+
                                            'Chat: <input class = "chatField" type = "text" name = "chat">'+
                                        '</form>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                            '<div class = "col-sm-3 col-md-3">'+
                                '<p>Going:</p>'+
                                '<div id = "goingList"></div>' +
                                '<div class = "goStatus">I am going!</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>');
};

ChatService.prototype.hideChat = function() {
    $('.chatBox').animate({
            height: "0px"
    }, 600, function() { });
    $('.chatBox').fadeOut({queue: false, duration: 'slow'});
    $('#promptBackground').fadeOut(600);
};

ChatService.prototype.joinChatRoomForOwnMarkers = function(markers) {
    var ownMarkers = markers.filter(function(marker) {
        return marker.userID == controller.userAuth.userID;
    });
    for(var i = 0; i < ownMarkers.length; i++) {
        this.joinRoom(ownMarkers[i].getRoomCode());
    }
};

ChatService.prototype.joinRoom = function(roomCode) {
    this.socket.emit('joinroom', roomCode);
};

function ChatMessage(markerName, roomCode, content) {
    this.markerName = markerName;
    this.fromId = controller.userAuth.userID;
    this.fromName = controller.userAuth.userName;
    this.content = content;
    this.roomCode = roomCode;
}

ChatMessage.prototype.toDictionary = function() {
    return {
        markerName: this.markerName,
        fromId: this.fromId,
        fromName: this.fromName,
        roomCode: this.roomCode,
        content: this.content
    };
};

ChatMessage.prototype.updateWithDictionary = function(dict) {
    if (dict.markerName) this.markerName = dict.markerName;
    if (dict.fromId) this.fromId = dict.fromId;
    if (dict.fromName) this.fromName = dict.fromName;
    if (dict.roomCode) this.roomCode = dict.roomCode;
    if (dict.content) this.content = dict.content;
};
