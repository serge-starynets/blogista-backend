const peopleRouter = require('express').Router();
const jwt = require('jsonwebtoken');

const Person = require('../models/person');
const User = require('../models/user');

const getTokenFrom = (req) => {
	const authorization = req.get('authorization');
	if (authorization && authorization.startsWith('Bearer ')) {
		return authorization.replace('Bearer ', '');
	}
	return null;
};

peopleRouter.get('/', async (req, res) => {
	const people = await Person.find({}).populate('user', {
		username: 1,
		name: 1,
	});
	res.json(people);
});

peopleRouter.get('/:id', async (req, res) => {
	const person = await Person.findById(req.params.id);
	if (person) {
		res.json(person);
	} else {
		res.status(404).end();
	}
});

peopleRouter.post('/', async (req, res) => {
	const body = req.body;

	const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET);
	if (!decodedToken.id) {
		return res.status(401).json({ error: 'token invalid' });
	}
	const user = await User.findById(decodedToken.id);

	if (!user) {
		return res.status(400).json({ error: 'userId missing or not valid' });
	}

	if (!body.name || !body.number) {
		return res.status(400).json({
			error: 'name or number is missing',
		});
	}

	const person = new Person({
		name: body.name,
		number: body.number,
		address: body.address || '',
		user: user._id,
	});

	const savedPerson = await person.save();
	user.phonebookEntries = user.phonebookEntries.concat(savedPerson._id);
	await user.save();

	res.status(201).json(savedPerson);
});

peopleRouter.put('/:id', async (req, res) => {
	const { name, number, address } = req.body;

	const person = await Person.findById(req.params.id);
	if (!person) {
		res.status(404).end();
	}
	person.name = name;
	person.number = number;
	person.address = address || '';

	const updatedPerson = await person.save();
	res.json(updatedPerson);
});

peopleRouter.delete('/:id', async (req, res) => {
	const id = req.params.id;

	await Person.findByIdAndDelete(id);
	res.status(204).end();
});

module.exports = peopleRouter;
