const {findUserAccountById} = require('../models/user.models.js');
const jwt = require('jsonwebtoken');
const config = require('../config/config.js');





function AuthorizationMiddleware() {
	return async function(req, res, next) {
	 	try{
	 		const JWTKey = config.JWT.JWTKey;

			if(JWTKey === undefined || JWTKey === null) {
				throw new Error('JWTKey must not be undefined or null.');
			}

	 		const authorizationToken = req.headers.authorization;

	 		if(authorizationToken === undefined || authorizationToken === null) {
	 			req.user = {is_authenticated: false, is_admin: false};
				next();
	 		}else if(authorizationToken.substr(0, 7) === 'Bearer ') {
	 			const accessToken = authorizationToken.substr(7, authorizationToken.length);
		 		const payload = jwt.verify(accessToken, JWTKey);
				var user = await findUserAccountById(payload._id);
				user = user.toObject();
				if(user === null) return res.status(400).json('No user exists with this token.');
				user.is_authenticated = true;
				req.user = user;
				next();
	 		}
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
}





module.exports = AuthorizationMiddleware;