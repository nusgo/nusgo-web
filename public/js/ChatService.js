function ChatService() {
    this.rooms = [];//for keeping track of rooms entered before
    this.emojiShow = false;
    var self = this;
    this.socket = io();
    this.socket.on("chatMessage",function(chatMessage) {
        self.openChat(chatMessage.markerName, chatMessage.roomCode, chatMessage.mealType);
        self.receiveMessage(chatMessage);
    });
    this.roomCode = null;
    this.mealType = null;

}

ChatService.prototype.receiveMessage = function(chatMessage) {
    this.openChat(chatMessage.markerName, chatMessage.roomCode, chatMessage.mealType);
    var roomCode = chatMessage.roomCode;
    var chat = chatMessage.content;
    var isEmoji = true;
    if (chat.indexOf("img/") === -1){
            isEmoji = false;
        }
    if (isEmoji === true){
        $('#'+ roomCode + ' .chatArea').append(
            '<p><img id = "chatProfilePic" src="//graph.facebook.com/' + chatMessage.fromId + '/picture">'+
            " <img src ='" + chat + "'></img></p>");
    }else{
        $('#'+ roomCode + ' .chatArea').append(
        '<p><img id = "chatProfilePic" src="//graph.facebook.com/' + chatMessage.fromId + '/picture">'+
        " " + chatMessage.content + "</p>");
    }
    scrollChatAreaToLatest(roomCode);
};

ChatService.prototype.sendMessage = function(chat) {
    var name = controller.userAuth.userName;
    var id = controller.userAuth.userID;
    var roomCode = this.roomCode;
    var isEmoji = true;
    if (chat.indexOf("img/") === -1){
        isEmoji = false;
    }
    if (isEmoji === true){
        $('#'+ roomCode + ' .chatArea').append(
            '<p><img id = "chatProfilePic" src="//graph.facebook.com/' + id + '/picture">'+
            " <img src ='" + chat + "'></img></p>");
    }else{
        if (chat != ""){
            $('#'+ roomCode + ' .chatField').val('');
            $('#'+ roomCode + ' .chatArea').append(
                '<p><img id = "chatProfilePic" src="//graph.facebook.com/' + id + '/picture">'+
                " " + chat + "</p>");
        }
    }
    var chatMessage = new ChatMessage(this.markerName, this.roomCode, chat, this.mealType);
    console.log(chatMessage);
    this.socket.emit("chatMessage",chatMessage.toDictionary());
    scrollChatAreaToLatest(roomCode);
};

ChatService.prototype.openChat = function(markerName, roomCode, mealType) {
    this.markerName = markerName;
    this.roomCode = roomCode;
    this.mealType = mealType;
    console.log("Open Chat!");
    console.log(mealType);
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
        this.appendNewRoomHTML(markerName, roomCode, mealType);       
    }

    console.log("openChat: " + roomCode);
    $('#'+roomCode).fadeIn({queue: false, duration: 'slow'});
    $('#'+roomCode).animate({
            height: "500px"
        }, 800, function(){
    });
    $('#promptBackground').fadeIn(600);

    var self = this;
    //sending message
    $('#'+ roomCode + ' .chatField').keydown(function(event){
        if (event.keyCode === 13){
            var chat = $('#'+ roomCode + ' .chatField').val();
            if (chat !== '') {
                self.sendMessage(chat);
            }
        }
    });

    //press going button
    var index;
    var self = this;
    $('#'+ roomCode + ' .goStatus').click(function(){
        console.log("status CLICKED");
    });

    //open and close emoji menu
    $('#'+ roomCode + ' .emojiButton').click(function(event){
        event.stopImmediatePropagation();
        if(self.emojiShow === false){
            $('#'+ roomCode + ' .emojiSelect').show();
            self.emojiShow = true;
        }else{
            $('#'+ roomCode + ' .emojiSelect').hide();
            self.emojiShow = false;
        }
    });
    $('#'+ roomCode + ' .chatArea').click(function(){
        $('#'+ roomCode + ' .emojiSelect').hide();
        self.emojiShow = false;
    });
    $('#'+ roomCode + ' .goingList').click(function(){
        $('#'+ roomCode + ' .emojiSelect').hide();
        self.emojiShow = false;
    });


    //select emoji
    $('#'+ roomCode + ' .emojiOption').click(function(event){
        event.stopImmediatePropagation();
        var imgSrc = $(this).attr('src');
        console.log("SEND EMOJI");
        self.sendMessage(imgSrc);
    });


    //check if a room is open, if yes, do something

};

ChatService.prototype.appendNewRoomHTML = function(markerName, roomCode, mealType) {
    $("#chatSection").append(
        '<div class = "chatBox" id = ' + roomCode + '>'+
            '<div class = "emojiSelect">' +
                '<img class = "emojiOption" src = "img/emoji1.png"></img>'+
                '<img class = "emojiOption" src = "img/emoji2.png"></img>'+
                '<img class = "emojiOption" src = "img/emoji3.png"></img>'+
                '<img class = "emojiOption" src = "img/emoji4.png"></img>'+
                '<img class = "emojiOption" src = "img/emoji5.png"></img>'+
                '<img class = "emojiOption" src = "img/emoji6.png"></img>'+
                '<img class = "emojiOption" src = "img/emoji7.png"></img>'+
                '<img class = "emojiOption" src = "img/emoji8.png"></img>'+
                '<img class = "emojiOption" src = "img/emoji9.png"></img>'+
                '<img class = "emojiOption" src = "img/emoji10.png"></img>'+
                '<img class = "emojiOption" src = "img/emoji11.png"></img>'+
                '<img class = "emojiOption" src = "img/emoji12.png"></img>'+
            '</div>'+
            '<div class = "container-fluid">'+
                '<div class = "row" id = "chatTitle">'+
                    '<h2 class = "col-sm-12 col-md-12">Hungry for ' +
                    mealType + '?</h2>'+
                '</div>'+
                '<div class = "row">'+
                    '<div class = "container-fluid">'+
                        '<div class = "row">'+
                            '<div class = "col-sm-9 col-md-9">'+
                                '<div class = "row">'+
                                    '<div class = "chatArea" class = "col-md-12 col-sm-12"></div>'+
                                '</div>'+
                                '<div class = "row">'+
                                    '<form>'+
                                        'Chat: <input class = "chatField" type = "text" name = "chat">'+
                                        '<img class = "emojiButton" src = "img/emoji1.png"></img>'+
                                    '</form>'+
                                '</div>'+
                            '</div>'+
                            '<div class = "col-sm-3 col-md-3">'+
                                '<p>Going:</p>'+
                                '<div class = "goingList"></div>' +
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

ChatService.prototype.joinRoom = function(roomCode) {
    this.socket.emit('joinroom', roomCode);
};

function ChatMessage(markerName, roomCode, content, mealType) {
    this.markerName = markerName;
    this.fromId = controller.userAuth.userID;
    this.fromName = controller.userAuth.userName;
    this.content = content;
    this.roomCode = roomCode;
    this.mealType = mealType;
}

ChatMessage.prototype.toDictionary = function() {
    return {
        markerName: this.markerName,
        fromId: this.fromId,
        fromName: this.fromName,
        roomCode: this.roomCode,
        content: this.content,
        mealType: this.mealType
    };
};

ChatMessage.prototype.updateWithDictionary = function(dict) {
    if (dict.markerName) this.markerName = dict.markerName;
    if (dict.fromId) this.fromId = dict.fromId;
    if (dict.fromName) this.fromName = dict.fromName;
    if (dict.roomCode) this.roomCode = dict.roomCode;
    if (dict.content) this.content = dict.content;
    if (dict.mealType) this.mealType = dict.mealType;
};
