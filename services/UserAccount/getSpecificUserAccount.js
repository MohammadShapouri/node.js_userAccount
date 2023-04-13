const {findUserAccountById} = require('../../models/user.models.js');
const {URLParser} = require('./plugins.js');
const {getFieldsName} = require('../../models/user.models.js');




const getSpecificUserAccount = async (req, res) => {
	try {
		const allFields = getFieldsName();
		const allowedFilterFieldsName = ['first_name', 'last_name', 'username', 'phone_number'];
		const {pageNumber, pageLimit, filterFields, sortFields, selectFields} = URLParser(req, allFields, allowedFilterFieldsName);


		req.filterFields.push({_id: req.params.id});
		const requestedUserAccount = await findUserAccountById(filterFields, selectFields);
		// Sequence is so important in this if condition.
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(400).json('No user exists with this ID.');

		return res.status(200).send(requestedUserAccount);
	} catch(error) {
		console.error(error);
		return res.status(400).json('Something went wrong during fetching user account\'s data.');
	}
}


module.exports.getSpecificUserAccount = getSpecificUserAccount;