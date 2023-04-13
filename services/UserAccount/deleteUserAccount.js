const {findUserAccountById, deleteUserAccountById, updateUserAccount} = require('../../models/user.models.js');
const {ValidateDeleteAccountPasswords} = require('./validators.js');
const {comparePassword} = require('./plugins.js');




const deleteUserAccount = async(req, res) => {
	try {
		const requestedUserAccount = await findUserAccountById(req.params.id);
		// Sequence is so important in this if condition.
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(400).json('No user exists with this ID.');

		const validationResult = ValidateDeleteAccountPasswords(req.body);
		if(validationResult !== null) return res.status(400).json(validationResult);

		const passwordCheckingResult = await comparePassword(plainTextPassword=req.body.password, userAccountDoc=requestedUserAccount);

		if(passwordCheckingResult === false) {
			return res.status(400).json('Password is invalid.');
		} else if(passwordCheckingResult === true) {
			await deleteUserAccountById(req.params.id);
			return res.status(201).json('User account deleted.');
		}

	} catch(error) {
		console.log(error);
		return res.status(400).json('Something went wrong during updating user account data.');
	}
}



module.exports.deleteUserAccount = deleteUserAccount;