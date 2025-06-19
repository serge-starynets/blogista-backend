const Person = require('../models/person');

const initialPeople = [
	{
		name: 'John Doe',
		number: '555-123456',
	},
	{
		name: 'Jane Smith',
		number: '444-654321',
	},
];

const nonExistingId = async () => {
	const person = new Person({
		name: 'lalala',
		number: '123-555555',
	});
	await person.save();
	await person.deleteOne();

	return person._id.toString();
};

const peopleInDb = async () => {
	const people = await Person.find({});

	return people.map((p) => p.toJSON());
};

module.exports = { initialPeople, nonExistingId, peopleInDb };
