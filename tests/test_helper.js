const Person = require('../models/person');
const User = require('../models/user');

const initialPeople = [
	{
		name: 'John Doe',
		number: '555-123456',
		address: 'address 1',
		user: '6857a9da7fa5f30164931e5a',
	},
	{
		name: 'Jane Smith',
		number: '444-654321',
		address: 'address 2',
		user: '6857a9da7fa5f30164931e5a',
	},
];

const nonExistingId = async () => {
	const person = new Person({
		name: 'lalala',
		number: '123-555555',
		user: '6857a9da7fa5f30164931e5a',
	});
	await person.save();
	await person.deleteOne();

	return person._id.toString();
};

const peopleInDb = async () => {
	const people = await Person.find({});

	return people.map((p) => p.toJSON());
};

const usersInDb = async () => {
	const users = await User.find({});
	return users.map((u) => u.toJSON());
};

module.exports = { initialPeople, nonExistingId, peopleInDb, usersInDb };
