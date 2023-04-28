const Message = require('../models/messageModel')
const User = require('../models/userModel');
const Chat = require('../models/chatModel');

const sendMessage = async (req, res) => {
	const {content, chatId} = req.body;
	if(!content || !chatId) {
		res.send(400).send({message: "Invalid data."})
		throw new Error("Invalid data.")
	}
	const newMessage = {
		sender: req.user._id,
		content,
		chat: chatId,
	}
	try{
		let message = await Message.create(newMessage);
		message = await message.populate("sender", "name pic");
		message = await message.populate("chat");
		message = await User.populate(message, {
			path: "chat.users",
			select: "name pic email"
		});
		await Chat.findByIdAndUpdate(req.body.chatId, {
			latestMessage: message
		});

		res.json(message)
	} catch(error){
		res.status(400);
		throw new Error(error.message)
	}

}

const allMessages = async (req, res) => {
	try{
		const messages = await Message.find({chat: req.params.chatId}).populate("sender", "name pic email").populate("chat")

		res.json(messages)
	} catch(error){
		res.status(400)
		throw new Error(error.message)
	}
}

module.exports = { sendMessage, allMessages }