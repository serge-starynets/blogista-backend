const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');

const app = require('../app');
const Person = require('../models/person');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
	await Person.deleteMany({});
	for (let person of helper.initialPeople) {
		let personObj = new Person(person);
		await personObj.save();
	}
});

test('people are returned as json', async () => {
	await api
		.get('/api/people')
		.expect(200)
		.expect('Content-Type', /application\/json/);
});

test('all people are returned', async () => {
	const response = await api.get('/api/people');

	assert.strictEqual(response.body.length, helper.initialPeople.length);
});

test('a specific person is within the returned people', async () => {
	const response = await api.get('/api/people');

	const names = response.body.map((e) => e.name);
	assert(names.includes('John Doe'));
});

test('a valid person can be added ', async () => {
	const newPerson = {
		name: 'Gandalf the Gray',
		number: '123-46574',
	};

	await api
		.post('/api/people')
		.send(newPerson)
		.expect(201)
		.expect('Content-Type', /application\/json/);

	const peopelAtEnd = await helper.peopleInDb();
	assert.strictEqual(peopelAtEnd.length, helper.initialPeople.length + 1);

	const name = peopelAtEnd.map((r) => r.name);

	assert(name.includes('Gandalf the Gray'));
});

test('person without name is not added', async () => {
	const newPerson = {
		number: '123-45678',
	};

	await api.post('/api/people').send(newPerson).expect(400);

	const peopelAtEnd = await helper.peopleInDb();

	assert.strictEqual(peopelAtEnd.length, helper.initialPeople.length);
});

test('a specific person can be viewed', async () => {
	const peopleAtStart = await helper.peopleInDb();
	const personToView = peopleAtStart[0];

	const resultPerson = await api
		.get(`/api/people/${personToView.id}`)
		.expect(200)
		.expect('Content-Type', /application\/json/);

	assert.deepStrictEqual(resultPerson.body, personToView);
});

test.only('a person can be deleted', async () => {
	const peopleAtStart = await helper.peopleInDb();
	const personToDelete = peopleAtStart[0];

	await api.delete(`/api/people/${personToDelete.id}`).expect(204);

	const peopleAtEnd = await helper.peopleInDb();
	const name = peopleAtEnd.map((p) => p.name);
	assert(!name.includes(personToDelete.name));

	assert.strictEqual(peopleAtEnd.length, peopleAtStart.length - 1);
});

after(async () => await mongoose.connection.close());
