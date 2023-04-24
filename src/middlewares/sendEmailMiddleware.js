const NodeEmail = require('nodemailer');
const transporter = NodeEmail.createTransport({
	service: 'qq',
	port: 465,
	secureConnection: true,
	auth: {
		user: '1419390434@qq.com',
		pass: "youshallrose,mgbqusfwjyoyhdhc",
	}
})

const sendEmail = async (req,res,next) => {
	const { email } = req.body;
	const html = `<div><span>验证码：</span><b>${code}</b></div>`
	const text = "text";
	return await transporter.sendMail({
		from: '1419390434@qq.com',
		to: email,
		subject: "Account Register",
		html,
		text,
	})
}