function ChatService() {
    var self = this;
    this.socket = io();
    $('#chatField').keydown(function(event){
        if (event.keyCode == 13){
            var chat = $('#chatField').val();
            self.sendMessage(chat);

        }
    });
    this.socket.on("chatMessage",function(chatMessage){
        self.receiveMessage(chatMessage);
    });
}

ChatService.prototype.receiveMessage = function(chatMessage) {
    this.openChat(chatMessage.markerName, chatMessage.roomCode);
    $('#chatArea').append(
    '<p><img id = "chatProfilePic" src="//graph.facebook.com/' + chatMessage.fromId + '/picture">'+
    " " + chatMessage.content + "</p>");
    scrollChatAreaToLatest();
};

ChatService.prototype.sendMessage = function(chat) {
    var name = controller.userAuth.userName;
    var id = controller.userAuth.userID;
    if (chat != ""){
        $('#chatField').val('');
        $('#chatArea').append(
            '<p><img id = "chatProfilePic" src="//graph.facebook.com/' + id + '/picture">'+
            " " + chat + "</p>");
    }
    var chatMessage = new ChatMessage(this.markerName, this.roomCode, chat);
    this.socket.emit("chatMessage",chatMessage.toDictionary());
    scrollChatAreaToLatest();
};

ChatService.prototype.openChat = function(markerName, roomCode) {
    $('#notificationsBox').fadeIn({queue: false, duration: 'slow'});
    $('#notificationsBox').animate({
            height: "400px"
        }, 800, function(){
    });
    $('#promptBackground').fadeIn(600);
    $('#chatTitle').html('Jioing ' + markerName + "...");
    this.markerName = markerName;
    this.roomCode = roomCode;
};

ChatService.prototype.hideChat = function() {
    $('#notificationsBox').animate({
            height: "0px"
    }, 600, function() { });
    $('#notificationsBox').fadeOut({queue: false, duration: 'slow'});
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
