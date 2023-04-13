const {findUserAccountById} = require('../models/user.models.js');
const jwt = require('jsonwebtoken');
const config = require('../config/config.js');





function JWTAuthorization(req, res, next) {
 	try{
 		const JWTKey = config.JWT.JWTKey;

		if(JWTKey === undefined || JWTKey === null) {
			throw new Error('JWTKey must not be undefined or null.');
		}

 		const authorizationToken = req.headers.authorization;
 		const AccessToken = null;

 		if(authorizationToken === undefined || authorizationToken === null) {
 			return res.status(400).json('authorization token is required.');
 		}else if(authorizationToken.substr(0, 7) === 'Bearer ') {
 			AccessToken = authorizationToken.substr(7, authorizationToken.length);
 		}

		const payload = jwt.verify(AccessToken, JWTKey);
		const user = await findUserAccountById(payload._id);
		if(user === null) return res.status(400).json('No user exists with this token.')
		req.user = user;
		next();

 	} catch(error) {
 		if(error instanceof jwt.JsonWebTokenError) {
 			if(error.message === 'jwt expired') {
 				return res.status(400).json('Token is expired.');
 			} else if(error.message === 'invalid token') {
 				return res.status(400).json('Token is not valid.');
 			}
		}
	}
}





module.exports.JWTAuthorization = JWTAuthorization;