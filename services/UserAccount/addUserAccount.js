const {createUserAccount} = require('../../models/user.models.js');
const {validateUserCreationData} = require('./validators.js');


const addUserAccount = async(req, res) => {
	try {
		const validationResult = await validateUserCreationData(req.body);
		if(validationResult !== null) return res.status(400).send(validationResult);

		// OTP code will be created during creating new user account.
		const newUserAccountCreationResult = await createUserAccount(req.body);
		return res.status(201).json("Please enter your OTP code.");

	} catch(error) {
		console.log(error);
		return res.status(500).json('Something went wrong during creating new user account data.');		
	}
}

module.exports.addUserAccount = addUserAccount;