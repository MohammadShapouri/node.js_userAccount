const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/config.js');








// Returns hashed password. If an error occurs, it returns null.
async function hashPassword(plainTextPassword) {
	const saltRound = 10;
	const salt = await bcrypt.genSalt(saltRound);
	return await bcrypt.hash(plainTextPassword, salt);
	// return await bcrypt.hash(plainTextPassword, saltRound);
}


// Returns true if input password is the same as user's password otherwise, returns false.
// Returns a js object containing {invalidUser: true, description: 'No user found.'} when it wnats to find user by its
//	id and no user exists with that id, or null when an error occurs in any situation.
async function comparePassword(plainTextPassword, userAccountDoc=null, userAccountID=null) {
	var userAccount = null;

	if(userAccountDoc) {
		userAccount = userAccountDoc;
	} else if(userAccountID) {
		userAccount = await findUserAccountById(userAccountID);
		if(userAccount === null || userAccount.length === 0) throw new Error('Invalid user. no user found with this id.');
	}
	return await bcrypt.compare(plainTextPassword , userAccountDoc.password);
}









function generateJWTTokens(_id, username, phone_number) {
	if(_id === undefined || _id === null) throw new Error('_id is required. Don\'t leave it empty.');
	if(username === undefined || username === null) throw new Error('username is required. Don\'t leave it empty.');
	if(phone_number === undefined || phone_number === null) throw new Error('phone_number is required. Don\'t leave it empty.');
	// if(JWTKey === null) throw new Error('JWTKey is required. Don\'t leave it empty.');

	const JWTKey = config.JWT.JWTKey;
	const AccessTokenExpirySeconds = config.JWT.AccessTokenExpirySeconds;
	const RefreshTokenExpirySeconds = config.JWT.RefreshTokenExpirySeconds;

	if(JWTKey === undefined || JWTKey === null) {
		throw new Error('JWTKey must not be undefined or null.');
	}

	if(AccessTokenExpirySeconds === undefined || AccessTokenExpirySeconds === null) {
		AccessTokenExpirySeconds === 60*60*1000;
	} else if(typeof(AccessTokenExpirySeconds !== null && AccessTokenExpirySeconds) !== 'number') {
		throw new Error('AccessTokenExpirySeconds must be \'number\'.');
	}

	if(RefreshTokenExpirySeconds === undefined || RefreshTokenExpirySeconds === null) {
		RefreshTokenExpirySeconds === 180*24*60*60*1000;
	} else if(typeof(RefreshTokenExpirySeconds !== null && RefreshTokenExpirySeconds) !== 'number') {
		throw new Error('RefreshTokenExpirySeconds must be \'number\'.');
	}

	const AccessToken = jwt.sign({_id, username, phone_number}, JWTKey, {algorithm: "HS256", expiresIn: AccessTokenExpirySeconds});
	const RefreshToken = jwt.sign({_id, username, phone_number, AccessTokenExpirySeconds}, JWTKey, {algorithm: "HS256", expiresIn: RefreshTokenExpirySeconds});
	return {AccessToken: AccessToken, RefreshToken: RefreshToken};	
}







function validateJWTToken(AccessToken) {
	try {
		const JWTKey = config.JWT.JWTKey;

		if(JWTKey === undefined || JWTKey === null) {
			throw new Error('JWTKey must not be undefined or null.');
		}

		if(AccessToken === undefined || AccessToken === null) throw new Error('AccessToken is required. Don\'t leave it empty.');
		// if(JWTKey === null) throw new Error('JWTKey is required. Don\'t leave it empty.');

		// It can be a reason of error if jwt token is invalid.
		const payload = jwt.verify(AccessToken, JWTKey);
		return payload;
	} catch(error) {
		if (error instanceof jwt.JsonWebTokenError) {
 			if(error.message === 'jwt expired') {
				return {AccessToken: null, error: 'JWT token is expired'};
 			} else if(error.message === 'invalid token') {
				return {AccessToken: null, error: 'JWT token is invalid'};
 			}
		}
	}
}





function refreshJWTTokens(RefreshToken) {
	try {
		if(RefreshToken === undefined || RefreshToken === null) throw new Error('RefreshToken is required. Don\'t leave it empty.');
		// if(JWTKey === null) throw new Error('JWTKey is required. Don\'t leave it empty.');

		const JWTKey = config.JWT.JWTKey;

		if(JWTKey === undefined || JWTKey === null) {
			throw new Error('JWTKey must not be undefined or null.');
		}

		const payload = jwt.verify(RefreshToken, JWTKey);

		// // We ensure that a new token is not issued until enough time has elapsed
		// // In this case, a new token will only be issued if the old token is within
		// // 30 seconds of expiry. Otherwise, return a bad request status
		// const nowUnixSeconds = Math.round(Number(new Date()) / 1000)
		// if (payload.exp - nowUnixSeconds > 30) {
		// 	// return res.status(400).end()
		// 	return {status: 'failure', AccessToken: null, RefreshToken: null, error: 'can only renew JWT token within 30 seconds of its expiry.'};
		// }
		const {username, phone_number, AccessTokenExpirySeconds, iat, exp} = payload
	const AccessToken = jwt.sign({_id, username, phone_number}, JWTKey, {algorithm: "HS256", expiresIn: AccessTokenExpirySeconds});
	const RefreshToken = jwt.sign({_id, username, phone_number, AccessTokenExpirySeconds}, JWTKey, {algorithm: "HS256", expiresIn: RefreshTokenExpirySeconds});
		return {AccessToken: AccessToken, RefreshToken: RefreshToken, error: null};

	} catch(error) {
		// This 'if statement' seperates unautherized user error (invalid jwt token caused it) from server errors.
		if (error instanceof jwt.JsonWebTokenError) {
 			if(error.message === 'jwt expired') {
				return {AccessToken: null, RefreshToken: null, error: 'JWT token is expired'};
 			} else if(error.message === 'invalid token') {
				return {AccessToken: null, RefreshToken: null, error: 'JWT token is invalid'};
 			}
		}
	}

}




function URLParser(req, allFields, allowedFieldsName) {
	var fieldsName = [];
	for(eachField of allowedFieldsName) {
		if(allFields.includes(eachField)) {
			fieldsName.push(eachField);
		}
	}

	var pageNumber = 1
	var pageLimit = 10
	if(req.query.pageNumber !== undefined) pageNumber = parseInt(req.query.pageNumber);
	if(req.query.pageLimit !== undefined) pageLimit = parseInt(req.query.pageLimit);

	var filterFields = [];
	for(eachFieldName of fieldsName) {
		if(req.query[eachFieldName] !== undefined) {
			if(Array.isArray(req.query[eachFieldName]) === true) {
				for(eachItem of req.query[eachFieldName]) {
					var filterFieldObj = {};
					filterFieldObj[eachFieldName] = eachItem;
					filterFields.push(filterFieldObj);
				}
			} else {
				var filterFieldObj = {};
				filterFieldObj[eachFieldName] = req.query[eachFieldName];
				filterFields.push(filterFieldObj);
			}
		}
	}


	var sortFields = {};
	if(req.query.sortFields !== undefined) {
		var sortFieldsList = null;
		if(Array.isArray(req.query.sortFields) === true) {
			sortFieldsList = req.query.sortFields;
		} else {
			sortFieldsList = [req.query.sortFields];
		}
		for(eachItem of sortFieldsList) {
			if(fieldsName.includes(eachItem) === true) {
				if(eachItem.substr(0,1) === '-') {
					sortFields[eachItem] = -1;
				} else {
					sortFields[eachItem] = 1;
				}
			}
		}
	}


	var selectFields = {};
	if(req.query.selectFields !== undefined) {
		var selectFieldsList = null;
		if(Array.isArray(req.query.selectFields) === true) {
			selectFieldsList = req.query.selectFields;
		} else {
			selectFieldsList = [req.query.selectFields];
		}
		for(eachItem of selectFieldsList) {
			if(fieldsName.includes(eachItem) === true) {
				selectFields[eachItem] = 1;
			}
		}
	}
	return {pageNumber: pageNumber, pageLimit: pageLimit, filterFields: filterFields, sortFields: sortFields, selectFields: selectFields};
}





module.exports.hashPassword = hashPassword;
module.exports.comparePassword = comparePassword;
module.exports.generateJWTTokens = generateJWTTokens;
module.exports.refreshJWTTokens = refreshJWTTokens;
module.exports.URLParser = URLParser;
// module.exports.validateJWTTokenStructure = validateJWTTokenStructure;







// function validateInputObjectId(body) {
// 	const objectIdSchema = Joi.object({
// 		id: Joi.objectId()
// 			.label('ID')
// 			.required()
// 			.empty()
// 			.message({
// 				"objectId.base": "{#label} must be a valid object id.",
// 				"any.required": "{#label} is required.",
// 				"objectId.empty": "{#label} must not be empty."
// 			})
// 	});
// 	return objectIdSchema.validate(body, { 'abortEarly': false });
// }



// module.exports.validateInputObjectId = validateInputObjectId;

