const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();

const User = require('../models/user');

const passwordValidator = (password) => {
	return /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password);
};

usersRouter.get('/', async (req, res) => {
	const users = await User.find({}).populate('blogs', {
		url: 1,
		title: 1,
		author: 1,
	});

	res.json(users);
});

usersRouter.post('/', async (req, res) => {
	const { username, name, password } = req.body;

	if (!passwordValidator(password) || password.length < 8) {
		res.status(400).json({
			error: `password show contain at least 1 number, 1 uppercase character 
       and 1 special character and have 8 or more characters`,
		});
	}

	const saltedRounds = 10;
	const passwordHash = await bcrypt.hash(password, saltedRounds);

	const user = new User({
		username,
		name,
		passwordHash,
	});

	const savedUser = await user.save();

	res.status(201).json(savedUser);
});

module.exports = usersRouter;
