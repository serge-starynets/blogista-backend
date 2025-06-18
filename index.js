const app = require('./app');
const config = require('./utils/config');
const logger = require('./utils/logger');

// app.get('/info', (req, res) => {
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

app.listen(config.PORT, () => {
	logger.info(`Server is running at port ${config.PORT}`);
});
