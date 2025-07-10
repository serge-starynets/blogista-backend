const blogRouter = require('express').Router();

const Blog = require('../models/blog');

blogRouter.get('/', async (req, res) => {
	const blogs = await Blog.find({}).populate('user', {
		username: 1,
		name: 1,
	});
	res.json(blogs);
});

blogRouter.get('/:id', async (req, res) => {
	const blog = await Blog.findById(req.params.id);
	if (blog) {
		res.json(blog);
	} else {
		res.status(404).end();
	}
});

blogRouter.post('/', async (req, res) => {
	const body = req.body;
	const user = req.user;

	if (!user) {
		return res.status(400).json({ error: 'userId missing or not valid' });
	}

	if (!body.title || !body.author) {
		return res.status(400).json({
			error: 'title or author is missing',
		});
	}

	const blog = new Blog({
		url: body.url || '',
		title: body.title,
		author: body.author,
		user: user._id,
	});

	const savedBlog = await blog.save();
	user.blogs = user.blogs.concat(savedBlog._id);
	await user.save();

	res.status(201).json(savedBlog);
});

blogRouter.put('/:id', async (req, res) => {
	const { url, title, author } = req.body;

	const blog = await Blog.findById(req.params.id);
	if (!blog) {
		res.status(404).end();
	}
	blog.url = url || '';
	blog.title = title;
	blog.author = author;

	const updatedBlog = await blog.save();
	res.json(updatedBlog);
});

blogRouter.delete('/:id', async (req, res) => {
	const id = req.params.id;
	const user = req.user;

	if (!user) {
		return res.status(400).json({ error: 'userId missing or not valid' });
	}

	const blogToDelete = await Blog.findById(id);

	if (!blogToDelete) {
		res.status(404).end();
	}

	if (user.id !== blogToDelete.user.toString()) {
		return res.status(401).json({ error: 'Anauthorized' });
	}

	await Blog.findByIdAndDelete(id);
	res.status(204).end();
});

module.exports = blogRouter;
