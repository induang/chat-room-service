const generateToken = require('../config/tokenGenerator');
const User = require('../models/userModel');

const registerUser = async (req, res) => {
	const { name, email, password, pic } = req.body;
	if(!name || !email || !password){
		res.status(400);
		throw new Error("Please Enter all the Fields");
	}

	const userExists = await User.findOne({email});

	if(userExists){
		res.status(400).send("User already exists");
		// throw new Error("User already exists");
	}else{
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

module.exports = { registerUser, authUser, allUsers}