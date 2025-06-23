const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		minLength: 2,
		maxLength: 16,
		match: /^[a-zA-Z0-9]+$/,
	},
	name: {
		type: String,
		minLength: 2,
		maxLength: 32,
		match: /^[a-zA-Z0-9 ]+$/,
	},
	passwordHash: String,
	phonebookEntries: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Person',
		},
	],
});

userSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
		// the passwordHash should not be revealed
		delete returnedObject.passwordHash;
	},
});

const User = mongoose.model('User', userSchema);

module.exports = User;
