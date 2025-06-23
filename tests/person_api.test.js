const { test, after, beforeEach, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');

const app = require('../app');
const Person = require('../models/person');
const User = require('../models/user');
const helper = require('./test_helper');

const api = supertest(app);

describe('people api operations tests', () => {
	beforeEach(async () => {
		await Person.deleteMany({});
		await Person.insertMany(helper.initialPeople);
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

	test('a unique identifier is named "id"', async () => {
		const response = await api.get('/api/people');
		for (let p of response.body) {
			assert.strictEqual(Object.hasOwn(p, 'id'), true);
		}
	});

	test('a specific person is within the returned people', async () => {
		const response = await api.get('/api/people');

		const names = response.body.map((e) => e.name);
		assert(names.includes('John Doe'));
	});

	test('a valid person can be added ', async () => {
		const testUser = await User.findOne({ username: 'root' });

		const newPerson = {
			name: 'Gandalf the Gray',
			number: '123-46574',
			address: 'Minas Tirith',
			userId: testUser._id,
		};
		try {
			await api
				.post('/api/people')
				.send(newPerson)
				.expect(201)
				.expect('Content-Type', /application\/json/);
		} catch (err) {
			console.log('Error: ', err);
		}

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

	test('a person can be deleted', async () => {
		const peopleAtStart = await helper.peopleInDb();
		const personToDelete = peopleAtStart[0];

		await api.delete(`/api/people/${personToDelete.id}`).expect(204);

		const peopleAtEnd = await helper.peopleInDb();
		const name = peopleAtEnd.map((p) => p.name);
		assert(!name.includes(personToDelete.name));

		assert.strictEqual(peopleAtEnd.length, peopleAtStart.length - 1);
	});
});

after(async () => await mongoose.connection.close());
