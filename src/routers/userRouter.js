const express = require('express');
const { registerUser, authUser, allUsers, verifyEmail, fakeRegister } = require('../controllers/userController');
const protect = require('../middlewares/authMiddleware')
const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers)
router.post("/login", authUser)
router.post("/verify", verifyEmail)
router.post("/fakeregister", fakeRegister)

module.exports = router;