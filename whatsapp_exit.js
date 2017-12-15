// Generating fitting event
function generateEvent(type){
	return new MouseEvent(type, {
		'view': window,
		'bubbles': true,
		'cancelable': false
	})
}

var upEvent = generateEvent("mouseup");
var downEvent = generateEvent("mousedown");
var allChats = Array.from(document.querySelectorAll(".chat"));

// Open chat menu after selecting the chat
function clickChatMenu(){ document.querySelector("div.pane-chat-controls div[title='Menu']").dispatchEvent(downEvent); };

// Click the target chat
function clickTargetChat(targetChatTitle){
	console.log("Targeting chat title '" + targetChatTitle +"'");
	
	// Will take the first one that has a title match
	targetChat = allChats.filter(function(el){
		return el.querySelector(".chat-body>.chat-main>.chat-title>.emojitext").innerText.match(targetChatTitle);
	})[0];

	if(!targetChat){	// Didn't find a matching chat
		console.log("Couldn't locate chat '" + targetChatTitle + "'");
		return false;
	}
	else {
		console.log("Located the chat: ", targetChat);
		targetChat.dispatchEvent(downEvent);
		return true;
	}
}

function getAllMessages(){
	paneChatMessagesNodes = Array.from(document.querySelectorAll(".pane-chat-msgs .msg:not(.msg-system)"));	// These are all the available messages in the chat
	paneChatMessages = paneChatMessagesNodes.map(function(el){	// Map each message so there's only the text, author and date
		
		var author;	// Checking if the message has author and date
		var date;
		if(!el.querySelector(".has-author .emojitext.emoji-text-clickable")){
			author = null;	// We will populate the nulls later
			date = null;
		}
		else{
			author = el.querySelector(".emojitext.emoji-text-clickable").innerText;	// Author is conveniently placed
			dateAuthor = el.querySelector(".has-author").getAttribute("data-pre-plain-text");	// Here, date and author are together, will separate
			regexMatch = /\[(.*?)\]/.exec(dateAuthor);	// Trying to match the regex. If we fail, it's a deleted message and we will populate the date from previous message
			if(regexMatch === null)
				date = null;
			else				
				date = Date(regexMatch[0]);
		}

		var message;	// In case of a picture, message body could be null
		if(!el.querySelector(".emojitext.selectable-text.copyable-text")){
			body = null;
		}
		else {
			body = el.querySelector(".emojitext.selectable-text.copyable-text").innerText;
		}

		var message = {
			author: author,
			date: date,
			body: body,
		};
		return message;
	});

	// Need to populate the nulls. Each null means it's a continuation message, so the previous message's data is good for this one.
	var prevAuthor = paneChatMessages[0].author;	// Take the first one
	var prevDate = paneChatMessages[0].Date;	// Take the first one
	paneChatMessages.forEach(function(message){
		if(message.author === null){	// Take the previous message
			message.author = prevAuthor;
		}
		else{
			prevAuthor = message.author;
		}

		if(message.date === null){	// Take the previous message
			message.date = prevDate;
		}
		else{
			prevDate = message.date;
		}		
	});
	return paneChatMessages;
}

// Will count how many messages each author has
function getAuthorCount(messages){
	authorCount = {};
	messages.forEach(function(message){
		if(!authorCount[message.author])
			authorCount[message.author] = 1;	// First message
		else
			authorCount[message.author]++;	// Increment the counter
	});
	return authorCount;
}

// Yesterday's top hitter needs to be recognized
function generateTopHitterMessage(){
	var authorCount = getAuthorCount(getAllMessages());

}
