const mongoose = require('mongoose');

const verifySchema = mongoose.Schema({
	email: { type: String, require: true},
	code: { type: String, require: true},
},{
	timestamps: true
});

const Verify = mongoose.model("Verify", verifySchema);
module.exports = Verify