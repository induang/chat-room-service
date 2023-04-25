const generateToken = require('../config/tokenGenerator');
const User = require('../models/userModel');
const Verify = require('../models/verifyModel')
const NodeEmail = require('nodemailer');
const transporter = NodeEmail.createTransport({
	service: 'qq',
	port: 465,
	secureConnection: true,
	auth: {
		user: process.env.MAILER_USER,
		pass: process.env.MAILER_PASS,
	}
})

const registerUser = async (req, res) => {
	const { name, code, email, password, pic } = req.body;
	if(!name || !email || !password){
		res.status(400);
		throw new Error("Please Enter all the Fields");
	}

	const userExists = await User.findOne({email});
	const foundVerify = Verify.findOne({email});

	if(userExists){
		res.status(400).send({message: "User already exists."});
		// throw new Error("User already exists");
	}else if (!foundVerify){
		res.status(400).send({message: "Please send email to verify"})
	}
	else{
		const expiredTime = 5*60*1000;
		const updatedTime = new Date(foundVerify.updatedAt).getTime();
		if(new Date().getTime() - updatedTime > expiredTime){
			res.status(400).send({message: "The Verify Code Expired."})
		}else if(foundVerify !== code){
			res.status(400).send({message: "Wrong Verify Code."})
		}
		else {
			const user = await User.create({
				name,email,password,pic
			});
		
			if(user){
				res.set('Authorization', generateToken(user._id)).status(201).json({
					// _id: user._id,
					name: user.name,
					email: user.email,
					pic: user.pic,
				});
			} else{
				res.status(400);
				throw new Error("Failed to Create the User")
			}
		}
	}
}

const authUser = async(req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });
	if(user && (await user.matchPassword(password))){
		res.set('Authorization', generateToken(user._id)).status(201).json({
			name: user.name,
			email: user.email,
			pic: user.pic,
		})
	}else {
		res.status(403).send("Unauthenrization")
	}
}

const verifyEmail = async(req, res) => {
	const { email } = req.body;
	if(!email){
		res.status(400).send({massage: "Please fill the email"});
		throw new Error("Email dosent fill.")
	}
	const user = await Verify.findOne({email});
	if(user){
		res.status(400).send("Email alreay exist.")
	}else{
		const foundVerify = await Verify.findOne({email})
		let code = Math.random().toString().slice(-6);
		if(!foundVerify){
			await Verify.create({email, code});
		}else{
			const startTime = new Date(foundVerify.createAt).getTime();
			const interval = 1000*60;
			if(new Date().getTime() - startTime > interval){
				await Verify.findOneAndUpdate({email},{code})
			}else{
				code = foundVerify.code
			}
		}

		const html = `<div><span>验证码：</span><b>${code}</b></div>`
		const text = "text";
		await transporter.sendMail({
			from: '1419390434@qq.com',
			to: email,
			subject: "Account Register",
			html,
			text,
		})

		res.status(200).send("Email sended.")
	}

}

// /api/user?search
const allUsers = async (req, res) => {
	const keyword = req.query.search ? {
		$or: [
			{name: {$regex: req.query.search, $options: "i"}},
			{name: {$regex: req.query.search, $options: "i"}},
		]
	} : {};

	const users = await User.find(keyword).find({_id: { $ne: req.user._id}});
	res.send(users);
}

module.exports = { registerUser, authUser, allUsers, verifyEmail}