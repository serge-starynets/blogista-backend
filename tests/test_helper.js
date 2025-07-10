const Blog = require('../models/blog');
const User = require('../models/user');

const initialBlogs = [
	{
		url: 'lalala',
		title: 'so what?',
		author: 'P.J.',
		user: '685905c0a3a9fac1965e62d1',
	},
	{
		url: 'lalala2',
		title: 'this is',
		author: 'J.D.',
		user: '6857a9da7fa5f30164931e5a',
	},
];

const nonExistingId = async () => {
	const blog = new Blog({
		url: 'lalala',
		title: '123-555555',
		author: 'J.D.',
		user: '6857a9da7fa5f30164931e5a',
	});
	await blog.save();
	await blog.deleteOne();

	return blog._id.toString();
};

const blogsInDb = async () => {
	const blogs = await Blog.find({});

	return blogs.map((p) => p.toJSON());
};

const usersInDb = async () => {
	const users = await User.find({});
	return users.map((u) => u.toJSON());
};

module.exports = { initialBlogs, nonExistingId, blogsInDb, usersInDb };
