const {findOneUserAccountByPhoneNumberOrUsername} = require('../../models/user.models.js');
const {validateJWTTokenGenerationInput} = require('./validators.js');
const {comparePassword, generateJWTTokens, refreshJWTTokens} = require('./plugins.js');





async function generateJWTAccessRefreshToken(req, res) {
	try {
		const validationResult = await validateJWTTokenGenerationInput(req.body);
		if(validationResult !== null) return res.status(400).send(validationResult);


		const requestedUserAccount = await findOneUserAccountByPhoneNumberOrUsername(req.body.phone_number_username);
		if(requestedUserAccount === null) return res.status(404).json('No user exists with this id.');

		const passwordCheckingResult = await comparePassword(plainTextPassword=req.body.password, userAccountDoc=requestedUserAccount);

		if(passwordCheckingResult === false) {
			return res.status(400).json('Password is incorrect.');
		} else if(passwordCheckingResult === true) {
			const JWTTokens = generateJWTTokens(requestedUserAccount._id, requestedUserAccount.username, requestedUserAccount.phone_number);
			return res.status(201).send(JWTTokens);
		}
	} catch(error) {
		console.log(error);
		return res.status(500).json('Something went wrong during creating JWT token.');
	}
}








async function refreshJWTAccessRefreshToken(argument) {
	try {
		const validationResult = await validateJWTTokenRefreshInput(req.body);
		if(validationResult !== null) return res.status(400).send(validationResult);

		const newJWTTokens = refreshJWTTokens(req.body.RefreshToken);
		res.status(201).send(newJWTTokens);

	} catch(error) {
		console.log(error);
		return res.status(500).json('Something went wrong during creating JWT token.');
	}
}







module.exports.generateJWTAccessRefreshToken = generateJWTAccessRefreshToken;
module.exports.refreshJWTAccessRefreshToken = refreshJWTAccessRefreshToken;
