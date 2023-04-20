const Chat = require('../models/chatModel')
const User = require("../models/userModel")

const accessChat = async (req, res) => {
	const {userId} = req.body;

	if(!userId){
		console.log("userId params not sent with request")
		return res.sendStatus(400);
	}
	let isChat = await Chat.find({
		isGroupChat: false,
		$and: [
			{users: {$elemMatch: { $eq: req.user._Id}}},
			{users: {$elemMatch: { $eq: userId}}}
		]
	}).populate("users", "-password").populate("latestMessage");
	isChat = await User.populate(isChat, {
		path: 'lastestMessgae.sender',
		select: "name pic email"
	});

	if(isChat.length > 0){
		res.send(isChat[0]);
	}else{
		const chatData = {
			chatName: "sender",
			isGroupChat: false,
			users: [req.user._id, userId]
		};

		try {
			const createChat = await Chat.create(chatData);
			const fullChat = await Chat.findOne({_id: createChat._id}).populate("users","-password")
			res.status(200).send(fullChat)
		} catch (error){
			res.status(400);
			throw new Error(error.message)
		}
	}
}

const fetchChats = async (req, res) => {
	try{
		Chat.find({users: {$elemMatch: {$eq: req.user._id}}}).populate("users", "-password").populate("groupAdmin", "-password").populate("latestMessage").sort({updatedAt: -1})
		.then(async(results) => {
			results = await User.populate(results, {
				path: 'latestMessage.sender',
				select: 'name pic email'
			})

			res.status(200).send(results);
		})
	} catch(error){

	}
}

const createGroupChat = async(req, res) => {
	
}

module.exports = { accessChat, fetchChats, createGroupChat }