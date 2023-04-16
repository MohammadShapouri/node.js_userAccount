const {findUserAccountById, updateUserAccountById} = require('../../models/user.models.js');
const {validatePasswordChangingInputs} = require('./validators.js');
const {comparePassword} = require('./plugins.js');



const changeUserAccountPassword = async(req, res) => {
	try {
		const requestedUserAccount = await findUserAccountById(req.params.id);
		// Sequence is so important in this if condition.
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(404).json('No user exists with this ID.');

		// Just validating inputs format.
		const validationResult = validatePasswordChangingInputs(req.body);
		if(validationResult !== null) return res.status(400).send(validationResult);

		// Comparing password with saved encrypted string in DB.
		const passwordCheckingResult = await comparePassword(plainTextPassword=req.body.old_password, userAccountDoc=requestedUserAccount);

		if(passwordCheckingResult === false) {
			return res.status(400).json('Password is incorrect.');
		} else if(passwordCheckingResult === true) {
			await updateUserAccountById(req.params.id, req.body);
			return res.status(200).json('Password updated.');
		}
	} catch(error) {
		console.log(error);
		return res.status(500).json('Something went wrong during changing user account password.');
	}
}




module.exports.changeUserAccountPassword = changeUserAccountPassword;