function ChatService() {

}

ChatService.prototype.sendMessage = function(chatMessage) {
        
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
