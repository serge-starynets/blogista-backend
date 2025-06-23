const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const personSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please enter the name'],
		minLength: 2,
		maxLength: 64,
	},
	number: {
		type: String,
		required: [true, 'Please enter the number'],
		minLength: 8,
		validate: {
			validator: function (v) {
				return /\d{2,3}-\d{3,8}/.test(v);
			},
			message: (props) => `${props.value} is not a valid phone number!`,
		},
	},
	address: {
		type: String,
		required: false,
		maxLength: 256,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
});

personSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		// returnedObject.user = returnedObject.user.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

const Person = mongoose.model('Person', personSchema);

module.exports = Person;
