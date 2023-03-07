const {findUserAccountById, updateUserAccountById} = require('../../models/user.models.js');
const {validateUserNewInfo} = require('./validators.js');
const {comparePassword, hashPassword} = require('./plugins.js');


async function updateUserAccount (req, res) {
	try {
		const requestedUserAccount = await findUserAccountById(req.params.id);
		// Sequence is so important in this if condition.
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(400).json('No user exists with this ID.');

		const validationResult = await validateUserNewInfo(req.body, req.params.id);
		if(validationResult !== null) return res.status(400).send(validationResult);

		const updatedUserAccount = await updateUserAccountById(req.params.id, req.body)
		return res.status(200).send(updatedUserAccount);
		
	} catch(error) {
		console.error(error);
		return res.status(400).json('Something went wrong during updating user account data.');
	}
}




module.exports.updateUserAccount = updateUserAccount;