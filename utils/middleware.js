const logger = require('./logger');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const requestLogger = (request, response, next) => {
	logger.info('Method:', request.method);
	logger.info('Path:  ', request.path);
	logger.info('Body:  ', request.body);
	logger.info('---');
	next();
};

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (err, req, res, next) => {
	logger.error(err.message);

	if (err.name === 'CastError') {
		return res.status(400).send({ error: 'malformatted id' });
	} else if (err.name === 'ValidationError') {
		return res.status(400).send({ error: err.message });
	} else if (
		err.name === 'MongoServerError' &&
		err.message.includes('E11000 duplicate key error')
	) {
		return res.status(400).json({ error: 'expected `username` to be unique' });
	} else if (err.name === 'JsonWebTokenError') {
		return res.status(401).json({ error: 'token invalid' });
	} else if (err.name === 'TokenExpiredError') {
		return res.status(401).json({
			error: 'token expired',
		});
	}
	next(err);
};

const tokenExtractor = (req, res, next) => {
	const authorization = req.get('authorization');
	if (authorization && authorization.startsWith('Bearer ')) {
		const token = authorization.replace('Bearer ', '');
		req.token = token;
	}
	next();
};

const userExtractor = async (req, res, next) => {
	const decodedToken = jwt.verify(req.token, process.env.SECRET);
	if (!decodedToken.id) {
		return res.status(401).json({ error: 'token invalid' });
	}
	const user = await User.findById(decodedToken.id);
	req.user = user;
	next();
};

module.exports = {
	requestLogger,
	unknownEndpoint,
	errorHandler,
	tokenExtractor,
	userExtractor,
};
