const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const blogShema = new mongoose.Schema({
	url: {
		type: String,
		required: false,
		minLength: 2,
	},
	title: {
		type: String,
		required: [true, 'Please enter the title'],
		minLength: 1,
		maxLength: 256,
	},
	author: {
		type: String,
		required: [true, 'Please enter the author'],
		maxLength: 256,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
});

blogShema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		// returnedObject.user = returnedObject.user.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

const Blog = mongoose.model('Blog', blogShema);

module.exports = Blog;
