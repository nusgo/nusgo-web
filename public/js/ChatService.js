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
    this.openChat(chatMessage.fromName, chatMessage.fromId);
    console.log("Message Received:");
    console.log(chatMessage);
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
    var chatMessage = new ChatMessage(this.markerID, chat);
    this.socket.emit("chatMessage",chatMessage.toDictionary());
    console.log("Sent Message:");
    console.log(chatMessage.toDictionary());
    scrollChatAreaToLatest();
};

ChatService.prototype.openChat = function(markerName, markerID) {
    $('#notificationsBox').fadeIn({queue: false, duration: 'slow'});
    $('#notificationsBox').animate({
            height: "400px"
        }, 800, function(){
    });
    $('#promptBackground').fadeIn(600);
    $('#chatTitle').html('Jioing ' + markerName + "...");
    this.markerName = markerName;
    this.markerID = markerID;
};

ChatService.prototype.hideChat = function() {
    $('#notificationsBox').animate({
            height: "0px"
    }, 600, function() { });
    $('#notificationsBox').fadeOut({queue: false, duration: 'slow'});
    $('#promptBackground').fadeOut(600);
};

function ChatMessage(toId, content) {
    this.fromId = controller.userAuth.userID;
    this.fromName = controller.userAuth.userName;
    this.toId = toId;
    this.content = content;
}

ChatMessage.prototype.toDictionary = function() {
    return {
        fromId: this.fromId,
        fromName: this.fromName,
        toId: this.toId,
        content: this.content
    };
};

ChatMessage.prototype.updateWithDictionary = function(dict) {
    if (dict.fromId) this.fromId = dict.fromId;
    if (dict.fromName) this.fromName = dict.fromName;
    if (dict.toId) this.toId = dict.toId;
    if (dict.content) this.content = dict.content;
};
