function ChatService() {
    var self = this;

    $('#chatField').keydown(function(event){
        if (event.keyCode == 13){
            var chat = $('#chatField').val();
            self.sendMessage(chat);
        }
    });
}

ChatService.prototype.sendMessage = function(chatMessage) {
    var name = controller.userAuth.userName;
    var id = controller.userAuth.userID;
    if (chat != ""){
        $('#chatField').val('');
        $('#chatArea').append(
            '<p><img id = "chatProfilePic" src="//graph.facebook.com/' + id + '/picture">'+
            " " + chat + "</p>");
    }

};

ChatService.prototype.openChat = function(markerName, markerID) {
    $('#notificationsBox').fadeIn({queue: false, duration: 'slow'});
    $('#notificationsBox').animate({
            height: "400px"
        }, 800, function(){
    });
    $('#promptBackground').fadeIn(600);
    $('#chatTitle').html('Jioing ' + markerName + "...");
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
    this.toId = toId;
    this.content = content;
}

ChatMessage.prototype.toDictionary = function() {
    return {
        fromId: this.fromId,
        toId: this.toId,
        content: this.content
    };
};

ChatMessage.prototype.updateWithDictionary = function(dict) {
    if (dict.fromId) this.fromId = dict.fromId;
    if (dict.toId) this.toId = dict.toId;
    if (dict.content) this.content = dict.content;
};
