function ChatService() {
    this.rooms = [];//for keeping track of rooms entered before
    this.emojiShow = false;
    var self = this;
    this.socket = io();
    this.socket.on("chatMessage",function(chatMessage) {
        self.receiveMessage(chatMessage);
    });
    this.goingUsers = [];
}

ChatService.prototype.receiveMessage = function(chatMessage) {
    var found = this.openChat(chatMessage.markerName, chatMessage.roomCode, chatMessage.mealType);
    if (found) this.appendMessageToChatBox(chatMessage);
};

ChatService.prototype.appendMessageToChatBox = function(chatMessage) {
    console.log("APPENDING MESSAGE");
    var roomCode = chatMessage.roomCode;
    var isEmoji = true;
    if (chatMessage.content.indexOf("img/") === -1){
            isEmoji = false;
        }
    if (isEmoji === true){
        $('#'+ roomCode + ' .chatArea').append(
            '<p><img id = "chatProfilePic" src="//graph.facebook.com/' + chatMessage.fromId + '/picture">'+
            " <img src ='" + chatMessage.content + "'></img></p>");
    } else {
        var chat = safeConverter.makeHtml(chatMessage.content);
        $('#'+ roomCode + ' .chatArea').append(
        '<p><img id = "chatProfilePic" src="//graph.facebook.com/' + chatMessage.fromId + '/picture">'+
        " " + chat + "</p>");
    }
    scrollChatAreaToLatest(roomCode);
};

ChatService.prototype.sendMessage = function(chat, markerName, roomCode, mealType) {
    if (chat === '') return;
    var chatMessage = new ChatMessage(markerName, roomCode, chat, mealType);
    this.socket.emit('chatMessage', chatMessage.toDictionary());
    this.appendMessageToChatBox(chatMessage);
    $('#' + roomCode + ' .chatField').val('');
};

ChatService.prototype.openChat = function(markerName, roomCode, mealType) {
    var minimise = false;
    this.goingUsers[roomCode] = [];
    //checks if user has entered room before (via roomCode)
    //if not in room before, append chatbox html with id = roomCode
    var found = false;
    for (var i = 0; i < this.rooms.length; i++){
        if (this.rooms[i] === roomCode){
            console.log("room visited before");
            found = true;
            break;
        }
    }
    var self = this;
    if (found === false){
        console.log("room not visited before, pushing room to records");
        this.rooms.push(roomCode);
        this.appendNewRoomHTML(markerName, roomCode, mealType);
        $.ajax({
            url: '/rooms/' + roomCode + '/messages',
            context: this
        }).done(function(messages) {
            for (var i = 0; i < messages.length; i++) {
                this.appendMessageToChatBox(messages[i]);
            }
             setTimeout(function() {
                scrollChatAreaToLatest(roomCode);
            }, 600);
        });
        $.ajax({
            url: '/rooms/' + roomCode + '/going',
            context: this
        }).done(function(users) {
            var goingAlready = false;
            for (var i = 0; i < users.length; i++) {
                self.addUserToGoingList(users[i], roomCode);
                if (controller.userAuth.userName === users[i].name){
                    goingAlready = true;
                }
            }
            if (goingAlready === true){
                $('#'+ roomCode + ' .goStatus').html("Jio-ed!");
            }
        });
        this.socket.on('going-' + roomCode, function onUserJoinRoom(joiningUser) {
            self.addUserToGoingList(joiningUser, roomCode);
        });

        //update z-index on click
        var self = this;
        $('#'+ roomCode).mousedown(function(){
            $('#' + roomCode).css("z-index", ++controller.maxZIndex);
        });

        //draggable
        self.draggable(roomCode);

        var self = this;
        //sending message
        $('#'+ roomCode + ' .chatField').keydown(function(event){
            if (event.keyCode === 13){
                var chat = $('#'+ roomCode + ' .chatField').val();
                if (chat !== '') {
                    self.sendMessage(chat, markerName, roomCode, mealType);
                }
            }
        });

        //press going button
        var index;
        var self = this;
        $('#'+ roomCode + ' .goStatus').click(function(){
            var alreadyGoing = false;
            for(var i = 0; i < self.goingUsers[roomCode].length; i++){
                if(controller.userAuth.userName === self.goingUsers[roomCode][i]){
                    var alreadyGoing = true;
                }
            }
            if (alreadyGoing === false){
                self.socket.emit('going', roomCode);
                $('#'+ roomCode + ' .goStatus').click(false);
                self.addUserToGoingList(controller.userAuth.user, roomCode);
                self.sendMessage("I'll like to join you!", markerName, roomCode, mealType);
            }
            $('#'+ roomCode + ' .goStatus').html("Jio-ed!");
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
            self.sendMessage(imgSrc, markerName, roomCode, mealType);
        });

        //close chatbox
        $('#' + roomCode + ' .closeChatButton').click(function(){
            self.hideChat(roomCode);
        });

        //minimise chat window
        $('#' + roomCode + ' .minimiseChatButton').click(function(){
            var sign = $('#' + roomCode + " .minimiseChatButton").html();
            var minimise = (sign === '+');
            if (minimise === false){
                $('#' + roomCode).animate({
                    "top": "-=180px",
                    height: "60px"
                }, 600, function() { });
                $('#' + roomCode + " .chatNonTitle").hide();
                $('#' + roomCode + " .minimiseChatButton").html("+");
            } else {
                $('#'+roomCode).fadeIn({queue: false, duration: 'slow'});
                $('#'+roomCode).animate({
                        "top": "+=180px",
                        height: "350px"
                    }, 800, function(){
                });
                $('#' + roomCode + " .chatNonTitle").show();
                $('#' + roomCode + " .minimiseChatButton").html("-");
            }
        });    
    }

    //opening/display chat
    self.displayChat(roomCode);

    //check if a room is open, if yes, do something
    return found;
};

ChatService.prototype.draggable = function(roomCode) {
    var $dragging = null;
    $(document.body).on("mousemove",function(e){
        if($dragging){
            var deltaY = e.pageY - $dragging.mouseY;
            var deltaX = e.pageX - $dragging.mouseX;
            var pos = $dragging.position();
            $dragging.offset({
                top: pos.top + deltaY,
                left: pos.left + deltaX
            });
            $dragging.mouseX = e.pageX;
            $dragging.mouseY = e.pageY;
        }
    });
    $(document.body).on("mousedown", "#" + roomCode + " #chatTitle", function(e){
        $dragging = $('#' + roomCode);
        $dragging.mouseX = e.pageX;
        $dragging.mouseY = e.pageY;
    });
    $(document.body).on("mouseup", function(e){
        $dragging = null;
    });
};

ChatService.prototype.addUserToGoingList = function(user, roomCode) {
    // you can use user.id and user.name
    console.log("%s is going to event %d!", user.name, roomCode);
    $('#' + roomCode + ' .goingList').append('<p><img id = "goingListPhoto" src="//graph.facebook.com/' + user.id + '/picture"></img>'+user.name+'</p>');
    this.goingUsers[roomCode].push(user.name);
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
                '<div class = "dragSelect">'+
                    '<div class = "row" id = "chatTitle">'+
                        '<div class = "col-sm-10 col-md-10">'+
                            '<h2 class = "hungryFor">Hungry for ' + mealType + '?</h2>'+
                        '</div>'+
                        '<div class = "col-md-2 col-sm-2">'+
                            '<p class = "closeChatButton">x</p>'+
                            '<p class = "minimiseChatButton">-</p>'+
                        '</div>'+
                    '</div>'+
                '<div>'+
                '<div class = "chatNonTitle">'+
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
            '</div>'+
        '</div>'
    );
};

ChatService.prototype.displayChat = function(roomCode) {
    console.log("openChat: " + roomCode);
    $('#'+roomCode).fadeIn({queue: false, duration: 'slow'});
    $('#'+roomCode).animate({
            "top": "50%",
            height: "350px"
        }, 800, function(){
    });
    $('#' + roomCode + " .chatNonTitle").show();
    $('#' + roomCode + " .minimiseChatButton").html("-");
    $('#'+ roomCode).css("z-index", controller.maxZIndex++); //move to frontmost
};

ChatService.prototype.hideChat = function(roomCode) {
    $('#' + roomCode).animate({
            height: "0px"
    }, 600, function() { });
    $('#' + roomCode).fadeOut({queue: false, duration: 'slow'});
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
