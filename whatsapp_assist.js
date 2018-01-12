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
	var targetChat = allChats.filter(function(el){
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
	var paneChatMessagesNodes = Array.from(document.querySelectorAll(".pane-chat-msgs .msg:not(.msg-system)"));	// These are all the available messages in the chat
	var paneChatMessages = paneChatMessagesNodes.map(function(el){	// Map each message so there's only the text, author and date
		
		var author;	// Checking if the message has author and date
		var date;
		if(!el.querySelector(".has-author .emojitext.emoji-text-clickable")){
			author = null;	// We will populate the nulls later
			date = null;
		}
		else{
			author = el.querySelector(".emojitext.emoji-text-clickable").innerText;	// Author is conveniently placed
			dateAuthor = el.querySelector(".has-author").getAttribute("data-pre-plain-text");	// Here, date and author are together, will separate
			var regexMatch = /\[(.*?)\]/.exec(dateAuthor);	// Trying to match the regex. If we fail, it's a deleted message and we will populate the date from previous message
			if(regexMatch === null)
				date = null;
			else{	// Parsing the date further, no choice but to use regex
				var d = /(\d+):(\d+), (\d+)\/(\d+)\/(\d+)/.exec(regexMatch);	// Reference - 10:38, 12/15/2017
				date = new Date(d[5], d[3]-1, d[4], d[1], d[2]);	// Adjusting the indices and also month is 0-based, so -1
			}
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
	var authorCount = {};
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
	var yesterday = new Date();	// Now
	yesterday.setDate(yesterday.getDate() - 1);	// Taking exactly 1 day ago from now

	// Filter the messages to be left with only the last 24h
	var lastMessages = getAllMessages().filter(m => m.date > yesterday);

	var authorCount = Object.entries(getAuthorCount(lastMessages));	// The authors and their counters, in an Array of entries
	var topHitter = authorCount.reduce(function(acc, cur){	// Finding the maximum using reduce
		return cur[1]>acc[1] ? cur : acc;
	});
	var totalMessages = authorCount.reduce(function(acc, cur){	// Finding the total number of messages
		return acc + cur[1];
	}, 0);

	return "סטטיסטיקת חפירות: ביממה האחרונה נשלחו *" + totalMessages +"* הודעות. בראש הרשימה - @" + topHitter[0] + " עם *" + topHitter[1] + "* הודעות.";
}

// Enter the chat named 'chatTitle' and post the top hitter message there.
function postShamingMessage(chatTitle){
	// Failsafe mechanism - chat title has to be at least 7 letters long to avoid accidental messages
	var minLength=7;
	if (chatTitle.length < minLength){
		console.log("Chat title provided is too short, please provide a title longer than " + minLength + " .");
		return false;
	}

	var result = clickTargetChat(chatTitle);	// Enter the chat
	if(!result){
		console.log("Couldn't post the message because target chat couldn't be entered.");
		return false;
	}

	// Making sure the current chat matches chatTitle to avoid errors
	if(!assertCurrentChat(chatTitle)){
		console.log("Current chat doesn't match '" + chatTitle + "', will not post shaming message.");
		return false;
	}

	// Need to scroll up a couple of times to have enough messages, user responsibility
	var messages = getAllMessages();	// Getting the earliest date
	var i = 0;
	var earliestDate = null;
	while(!earliestDate && i < messages.length)
		earliestDate = messages[i++].date;	// While there's null, there are no dates, finding the first valid one.
	// Checking that not everything is null
	if(i === messages.length){
		console.log("All messages don't have a date, critical error.");
		return false;
	}

	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);	// Exactly 24 hours ago
	if(earliestDate > yesterday){	// Earliest date is less than 24 hours ago, not enough messages
		console.log("Earliest message is less than 24 hours old, please scroll the chat up for more messages.");
		return false;
	}

	return postMessage(generateTopHitterMessage());	// Posting the message
}

// Posting a message
function postMessage(message, doSend=false){
	var input = document.querySelector("#main .input-container .pluggable-input-body");	// This is the input box
	input.innerHTML = message;

	// Need to refresh the input
	uievent = new UIEvent("input", {
		view: window,
		bubbles: true,
		cancelable: false,
		detail: 1
	});
	input.dispatchEvent(uievent);

	if(doSend){
		var sendButton = document.querySelector("button.compose-btn-send");	// This is the 'send' button
		sendButton.dispatchEvent(downEvent);
	}
}

// Assert that the current active chat contains chatTitle - to avoid posting in a wrong chat
function assertCurrentChat(chatTitle){
	if(!chatTitle || chatTitle==""){	// Shouldn't check against empty string or null
		console.log("assertCurrentChat: parameter chatTitle is null or empty, which is invalid.");
		return false;
	}

	// Current chat title
	var currentChatTitle = document.querySelector("#main .chat-main .chat-title span").title;
	if(currentChatTitle.match(chatTitle)){
		console.log("assertCurrentChat: current title '" + currentChatTitle + "' matches requested '" + chatTitle +"'");
		return true;
	}

	return false;	// In any other case, fail
}

/* This will post a message each `timeInterval` seconds. `messageGenerator` is a function that should return a string,
	and it's called each time a message should be posted */
function postAnnoyingMessages(chatTitle, messageGenerator, timeInterval){
	// Failsafe mechanism - chat title has to be at least 7 letters long to avoid accidental messages
	var minLength=7;
	if (chatTitle.length < minLength){
		console.log("Chat title provided is too short, please provide a title longer than " + minLength + " .");
		return false;
	}

	var result = clickTargetChat(chatTitle);	// Enter the chat
	if(!result){
		console.log("Couldn't post the message because target chat couldn't be entered.");
		return false;
	}

	// Making sure the current chat matches chatTitle to avoid errors
	if(!assertCurrentChat(chatTitle)){
		console.log("Current chat doesn't match '" + chatTitle + "', will not post shaming message.");
		return false;
	}

	var annoyingMessagesInterval = window.setInterval(function(){
		if(assertCurrentChat(chatTitle)){	// Still in the right chat
			var annoyingMessage = messageGenerator();
			console.log("Posting the annoying message '" + annoyingMessage + "' to '" + chatTitle +"'");
			postMessage(annoyingMessage);
		} else {
			console.log("Not in chat '" + chatTitle +"' any more, stopping the annoying messages to avoid infinite loops.");
			window.clearInterval(annoyingMessagesInterval);
		}

	}, timeInterval);

	return true;
}
