const {createUserAccount} = require('../../models/user.models.js');
const {validateUserCreationData} = require('./validators.js');


async function addUserAccount(req, res) {
	try {
		const validationResult = await validateUserCreationData(req.body);
		if(validationResult !== null) return res.status(400).send(validationResult);

		const newUserAccountCreationResult = await createUserAccount(req.body);
		return res.status(200).send(newUserAccountCreationResult);

	} catch(error) {
		console.log(error);
		return res.status(400).json('Something went wrong during creating new user account data.');		
	}
}

module.exports.addUserAccount = addUserAccount;