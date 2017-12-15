// Generating fitting event
function generateEvent(type){
	return new MouseEvent(type, {
		'view': window,
		'bubbles': true,
		'cancelable': true
	})
}

var upEvent = generateEvent("mouseup");
var downEvent = generateEvent("mousedown");

// Open chat menu after selecting the chat
function clickChatMenu(){ $(".pane-chat-controls > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)").click(); };
