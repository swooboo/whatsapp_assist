# whatsapp_assist

This script assists in WhatsApp messaging. Current features:
1. Sending a message - `postMessage(message)` function.
2. Posting a shaming message for the top hitter for last 24 hours - `postShamingMessage(chatMessage)` function, requires part of the group chat name. Hebrew only.
3. Posting a message periodically - `postAnnoyingMessages(chatTitle, messageGenerator, timeInterval)` function, will post whatever `messageGenerator` returns each `timeInterval` miliseconds. Examples below.

Instructions:
1. Copy the whole code from the `.js` file and paste it into the browser console (press F12). But don't trust me - read the code so you know it's safe and that I will not steal all your WhatsApp messages / mine Bitcoin on your PC.
2. Press Enter.
3. Call one of the functions - for example `postMessage("Hello")` will send "Hello" to the current chat.
4. Another example - `postAnnoyingMessages("chat title", ()=>{return "bla"}, 10000)` will send "bla" to "chat title" chat each 10000 miliseconds, or 10 seconds. The generator can be customized to send different messages each time.
