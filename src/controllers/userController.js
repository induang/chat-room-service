const generateToken = require('../config/tokenGenerator');
const User = require('../models/userModel');
const Verify = require('../models/verifyModel')
const NodeEmail = require('nodemailer');

const transporter = NodeEmail.createTransport({
	service: process.env.MAILER_SERVICE,
	port: process.env.MAILER_PORT,
	secureConnection: true,
	auth: {
		user: process.env.MAILER_USER,
		pass: process.env.MAILER_PASS,
	}
})

const registerUser = async (req, res) => {
	const { name, code, email, password, pic } = req.body;
	
	// 验证 所有项已填
	if(!name || !email || !password || !code){
		res.status(400).send({message: "Please Enter all the Fields"});
		throw new Error("Please Enter all the Fields");
	}

	const userExists = await User.findOne({email});

	// 验证 用户是否已注册
	if(userExists){
		res.status(400).send({message: "User already exists."});
		throw new Error("User already exists.");
	}

	const foundVerify = await Verify.findOne({email});

	// 验证 是否已经点击发送验证码按钮
	if (!foundVerify){
		res.status(400).send({message: "Please send email to verify"})
		throw new Error("Don\'t send verify code.")
	}

	const expiredTime = 5*60*1000;
	const updatedTime = new Date(foundVerify.updatedAt).getTime();
	
	// 验证 验证码是否过期
	if(new Date().getTime() - updatedTime > expiredTime){
		res.status(400).send({message: "The Verify Code Expired."})
		throw new Error("Verify code expired.")
	}

	// 验证 验证码是否正确
	if(foundVerify.code !== code){
		res.status(400).send({message: "Wrong Verify Code."})
		throw new Error("Wrong Verify code.")
	}

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
		res.status(400).send({message: "Failed to create the user."});
		throw new Error("Failed to Create the User")
	}
}

const authUser = async(req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });
	if(user && (await user.matchPassword(password))){
		res.set('Access-Control-Expose-Headers', 'Authorization')
		.set('Authorization', generateToken(user._id)).status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			pic: user.pic,
		})
	}else {
		res.status(403).send({message: "Unauthenrization. Check the account or password"})
	}
}

const verifyEmail = async(req, res) => {
	const { email } = req.body;
	
	// email 是否已填
	if(!email){
		res.status(400).send({massage: "Please fill the email"});
		throw new Error("Email doesn\'t fill.")
	}

	// 用户是否已注册
	const user = await User.findOne({email});
	if(user){
		res.status(400).send({message: "Email already exist."})
		throw new Error("User already exist.")
	}

	const foundVerify = await Verify.findOne({email})
	let code = Math.random().toString().slice(-6);

	if(!foundVerify){
		await Verify.create({email, code});
	}else{
		const startTime = new Date(foundVerify.updatedAt).getTime();
		const interval = 1000*60*5;
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

const fakeRegister = async (req,res) => {
	const { name, email, password, pic} = req.body;
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
		res.status(400).send({message: "Failed to create the user."});
		throw new Error("Failed to Create the User")
	}
}

module.exports = { registerUser, authUser, allUsers, verifyEmail, fakeRegister}