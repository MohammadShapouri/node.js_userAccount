const {findUserAccountById} = require('../../models/user.models.js');


const getSpecificUserAccount = async (req, res) => {
	try {
		req.filterFields.push({_id: req.params.id});
		const requestedUserAccount = await findUserAccountById(filterFields=req.filterFields, selectFields=req.selectFields);
		// Sequence is so important in this if condition.
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(400).json('No user exists with this ID.');

		return res.status(200).send(requestedUserAccount);
	} catch(error) {
		console.error(error);
		return res.status(400).json('Something went wrong during fetching user account\'s data.');
	}
}


module.exports.getSpecificUserAccount = getSpecificUserAccount;