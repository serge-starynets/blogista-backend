const peopleRouter = require('express').Router();
const Person = require('../models/person');

peopleRouter.get('/', (req, res) => {
	Person.find({}).then((persons) => {
		res.json(persons);
	});
});

// peopleRouter.get('/info', (req, res) => {
// 	let personsCount = 0;
// 	Person.find({}).then((result) => {
// 		personsCount = result.length;
// 		const currDateTime = Date.now();
// 		res.send(`<div>
//             <p>Phonebook has info for ${personsCount} people</p>
//             <p>${new Date(currDateTime)}</p>
//         </div>`);
// 	});
// });

peopleRouter.get('/:id', (req, res, next) => {
	Person.findById(req.params.id)
		.then((person) => {
			if (person) {
				res.json(person);
			} else {
				res.status(404).end();
			}
		})
		.catch((error) => next(error));
});

peopleRouter.post('/', (req, res, next) => {
	const body = req.body;
	if (!body.name || !body.number) {
		return res.status(400).json({
			error: 'name or number is missing',
		});
	}

	const person = new Person({
		name: body.name,
		number: body.number,
	});

	person
		.save()
		.then((savedPerson) => {
			res.json(savedPerson);
		})
		.catch((err) => {
			next(err);
		});
});

peopleRouter.put('/:id', (req, res, next) => {
	const { name, number } = req.body;

	Person.findById(req.params.id)
		.then((person) => {
			if (!person) {
				res.status(404).end();
			}
			person.name = name;
			person.number = number;

			return person.save().then((updatedPerson) => {
				res.json(updatedPerson);
			});
		})
		.catch((err) => next(err));
});

peopleRouter.delete('/:id', (req, res, next) => {
	const id = req.params.id;
	Person.findByIdAndDelete(id)
		.then((result) => {
			res.status(204).end();
		})
		.catch((err) => next(err));
});

module.exports = peopleRouter;
