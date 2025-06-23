const { test, after, beforeEach, describe } = require('node:test');
const bcrypt = require('bcrypt');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');

const app = require('../app');
const helper = require('./test_helper');
const User = require('../models/user');

const api = supertest(app);

describe('users', () => {
	beforeEach(async () => {
		await User.deleteMany({});

		const passwordHash = await bcrypt.hash('$ecRe7', 10);
		const user = new User({ username: 'root', passwordHash });

		await user.save();
	});

	test('creation succeeds with a fresh username', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: 'sstarynets',
			name: 'Serge Starynets',
			password: 'ver!fyTh1s',
		};

		await api
			.post('/api/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/);

		const usersAtEnd = await helper.usersInDb();
		assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

		const usernames = usersAtEnd.map((u) => u.username);
		assert(usernames.includes(newUser.username));
	});

	test('creation fails with proper statuscode and message if username already taken', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: 'root',
			name: 'Superuser',
			password: 'ver!fyTh1s',
		};

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/);

		const usersAtEnd = await helper.usersInDb();
		assert(result.body.error.includes('expected `username` to be unique'));

		assert.strictEqual(usersAtEnd.length, usersAtStart.length);
	});

	test('creation fails with proper statuscode and message if username contains restricted characters', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: '#$%^&',
			name: 'Superuser',
			password: 'ver!fyTh1s',
		};

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/);

		const usersAtEnd = await helper.usersInDb();
		assert(result.body.error.includes('User validation failed: username'));

		assert.strictEqual(usersAtEnd.length, usersAtStart.length);
	});

	test('creation fails with proper statuscode and message if password is less than 8 characters length', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: 'theuser',
			name: 'Superuser2',
			password: 'yes',
		};

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/);
		console.log('result.body', result.body);

		const usersAtEnd = await helper.usersInDb();
		assert(result.body.error.includes('have 8 or more characters'));

		assert.strictEqual(usersAtEnd.length, usersAtStart.length);
	});
});

after(async () => await mongoose.connection.close());
