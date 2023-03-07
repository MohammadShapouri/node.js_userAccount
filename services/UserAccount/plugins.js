const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');








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









function generateJWTToken(username, phone_number, JWTKey, JWTAccessTokenExpirySeconds, JWTRefreshTokenExpirySeconds) {
	if(username === null) throw new Error('username is required. Don\'t leave it empty.');
	if(phone_number === null) throw new Error('phone_number is required. Don\'t leave it empty.');
	if(JWTKey === null) throw new Error('JWTKey is required. Don\'t leave it empty.');

	if(JWTAccessTokenExpirySeconds === null) {
		JWTAccessTokenExpirySeconds === 5*60*1000;
	} else if(typeof(JWTAccessTokenExpirySeconds !== null && JWTAccessTokenExpirySeconds) !== 'number') {
		throw new Error('JWTAccessTokenExpirySeconds must be \'number\'.');
	}

	if(JWTRefreshTokenExpirySeconds === null) {
		JWTRefreshTokenExpirySeconds === 180*24*60*60*1000;
	} else if(typeof(JWTRefreshTokenExpirySeconds !== null && JWTRefreshTokenExpirySeconds) !== 'number') {
		throw new Error('JWTRefreshTokenExpirySeconds must be \'number\'.');
	}

	const JWTAccessToken = jwt.sign({username, phone_number}, JWTKey, {algorithm: "HS256", expiresIn: JWTAccessTokenExpirySeconds});
	const JWTRefreshToken = jwt.sign({username, phone_number, JWTAccessTokenExpirySeconds}, JWTKey, {algorithm: "HS256", expiresIn: JWTRefreshTokenExpirySeconds});
	return {JWTAccessToken: JWTAccessToken, JWTRefreshToken: JWTRefreshToken};	
}







function validateJWTTokenStructure(JWTAccessToken, JWTKey) {
		if(JWTToken === null) throw new Error('JWTToken is required. Don\'t leave it empty.');
		if(JWTKey === null) throw new Error('JWTKey is required. Don\'t leave it empty.');

		// It can be a reason of error if jwt token is invalid.
		const payload = jwt.verify(JWTAccessToken, JWTKey);
		return payload;
}






function renewJWTToken(JWTRefreshToken, JWTKey) {
	try {
		if(JWTToken === null) throw new Error('JWTToken is required. Don\'t leave it empty.');
		if(JWTKey === null) throw new Error('JWTKey is required. Don\'t leave it empty.');

		// It can be a reason of error if jwt token is invalid.
		const payload = jwt.verify(JWTRefreshToken, JWTKey);

		// // We ensure that a new token is not issued until enough time has elapsed
		// // In this case, a new token will only be issued if the old token is within
		// // 30 seconds of expiry. Otherwise, return a bad request status
		// const nowUnixSeconds = Math.round(Number(new Date()) / 1000)
		// if (payload.exp - nowUnixSeconds > 30) {
		// 	// return res.status(400).end()
		// 	return {status: 'failure', JWTAccessToken: null, JWTRefreshToken: null, error: 'can only renew JWT token within 30 seconds of its expiry.'};
		// }
		const {username, phone_number, expiresIn, iat, exp} = payload
		const JWTAccessToken = jwt.sign({username, phone_number}, JWTKey, {algorithm: "HS256", expiresIn: expiresIn});
		return {JWTAccessToken: JWTAccessToken};

	} catch(error) {
		// This 'if statement' seperates unautherized user error (invalid jwt token caused it) from server errors.
		if (error instanceof jwt.JsonWebTokenError) {
			return {JWTAccessToken: null, error: 'Unauthorized. JWT token is invalid. No user found with this JWT token. recommended_status_code:401'};
		}
	}

}







module.exports.hashPassword = hashPassword;
module.exports.comparePassword = comparePassword;
module.exports.generateJWTToken = generateJWTToken;
module.exports.validateJWTTokenStructure = validateJWTTokenStructure;
module.exports.renewJWTToken = renewJWTToken;







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

