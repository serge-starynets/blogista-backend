const { test, after, beforeEach, describe, before } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');

const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const helper = require('./test_helper');

const api = supertest(app);

let token;

before(async () => {
	const loginResponse = await api
		.post('/api/login')
		.send({ username: 'root', password: '$ecRe7' });
	token = loginResponse.body.token;
});

describe('blogs api operations tests', () => {
	beforeEach(async () => {
		await Blog.deleteMany({});
		await Blog.insertMany(helper.initialBlogs);
	});

	test('blogs are returned as json', async () => {
		await api
			.get('/api/blogs')
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect('Content-Type', /application\/json/);
	});

	test('all blogs are returned', async () => {
		const response = await api
			.get('/api/blogs')
			.set('Authorization', `Bearer ${token}`);

		assert.strictEqual(response.body.length, helper.initialBlogs.length);
	});

	test('a unique identifier is named "id"', async () => {
		const response = await api
			.get('/api/blogs')
			.set('Authorization', `Bearer ${token}`);
		for (let p of response.body) {
			assert.strictEqual(Object.hasOwn(p, 'id'), true);
		}
	});

	test('a specific blog is within the returned blogs', async () => {
		const response = await api
			.get('/api/blogs')
			.set('Authorization', `Bearer ${token}`);

		const titles = response.body.map((e) => e.title);
		assert(titles.includes('this is'));
	});

	test('a valid blog can be added', async () => {
		const testUser = await User.findOne({ username: 'root' });

		const newBlog = {
			url: '123123',
			title: 'wow',
			author: 'Gandalf',
			userId: testUser._id,
		};

		await api
			.post('/api/blogs')
			.set('Authorization', `Bearer ${token}`)
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/);

		const blogsAtEnd = await helper.blogsInDb();
		assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

		const author = blogsAtEnd.map((r) => r.author);
		assert(author.includes('Gandalf'));
	});

	test('blog without title is not added', async () => {
		const newBlog = {
			author: 'test author',
		};

		await api
			.post('/api/blogs')
			.set('Authorization', `Bearer ${token}`)
			.send(newBlog)
			.expect(400);

		const blogsAtEnd = await helper.blogsInDb();

		assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
	});

	test('a specific blog can be viewed', async () => {
		const blogsAtStart = await helper.blogsInDb();

		const blogToView = blogsAtStart[0];

		const resultBlog = await api
			.get(`/api/blogs/${blogToView.id}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect('Content-Type', /application\/json/);

		const userId = blogToView.user.toString();

		blogToView.user = userId;

		assert.deepStrictEqual(resultBlog.body, blogToView);
	});

	test('a blog can be deleted', async () => {
		const blogsAtStart = await helper.blogsInDb();
		const blogToDelete = blogsAtStart[0];

		await api
			.delete(`/api/blogs/${blogToDelete.id}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(204);

		const blogsAtEnd = await helper.blogsInDb();
		const title = blogsAtEnd.map((p) => p.title);
		assert(!title.includes(blogToDelete.title));

		assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1);
	});
});

after(async () => await mongoose.connection.close());
