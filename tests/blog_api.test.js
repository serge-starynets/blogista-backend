const { test, after, beforeEach, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');

const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const helper = require('./test_helper');

const api = supertest(app);

describe('blogs api operations tests', () => {
	beforeEach(async () => {
		await Blog.deleteMany({});
		await Blog.insertMany(helper.initialBlogs);
	});

	test('blogs are returned as json', async () => {
		await api
			.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/);
	});

	test('all blogs are returned', async () => {
		const response = await api.get('/api/blogs');

		assert.strictEqual(response.body.length, helper.initialBlogs.length);
	});

	test('a unique identifier is named "id"', async () => {
		const response = await api.get('/api/blogs');
		for (let p of response.body) {
			assert.strictEqual(Object.hasOwn(p, 'id'), true);
		}
	});

	test('a specific blog is within the returned blogs', async () => {
		const response = await api.get('/api/blogs');

		const titles = response.body.map((e) => e.title);
		assert(titles.includes('this is'));
	});

	test('a valid blog can be added ', async () => {
		// this
		const testUser = await User.findOne({ username: 'root' });

		const newBlog = {
			url: '123123',
			title: 'wow',
			author: 'Gandalf',
			userId: testUser._id,
		};
		try {
			await api
				.post('/api/blogs')
				.auth()
				.send(newBlog)
				.expect(201)
				.expect('Content-Type', /application\/json/);
		} catch (err) {
			console.log('Error: ', err);
		}

		const blogsAtEnd = await helper.blogsInDb();
		assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

		const author = blogsAtEnd.map((r) => r.author);

		assert(author.includes('Gandalf'));
	});

	test('blog without title is not added', async () => {
		//this
		const newBlog = {
			author: 'test author',
		};

		await api.post('/api/blogs').send(newBlog).expect(400);

		const blogsAtEnd = await helper.blogsInDb();

		assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
	});

	test.only('a specific blog can be viewed', async () => {
		const blogsAtStart = await helper.blogsInDb();

		const blogToView = blogsAtStart[0];
		console.log('blogToView', blogToView);

		const resultBlog = await api
			.get(`/api/blogs/${blogToView.id}`)
			.expect(200)
			.expect('Content-Type', /application\/json/);
		console.log('resultBlog', resultBlog.body);
		assert.deepStrictEqual(resultBlog.body, blogToView);
	});

	test('a blog can be deleted', async () => {
		const blogsAtStart = await helper.blogsInDb();
		const blogToDelete = blogsAtStart[0];

		await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

		const blogsAtEnd = await helper.blogsInDb();
		const title = blogsAtEnd.map((p) => p.title);
		assert(!title.includes(blogToDelete.title));

		assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1);
	});
});

after(async () => await mongoose.connection.close());
