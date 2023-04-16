const {findAllUserAccounts} = require('../../models/user.models.js');
const {URLParser} = require('./plugins.js');
const {getFieldsName} = require('../../models/user.models.js');





//EXAMPLE URL:: http://127.0.0.1:4000/api/users/?pageNumber=3&pageLimit=5&selectFields=first_name&selectFields=phone_number&sortFields=phone_number

const getAllUserAccount = async(req, res) => {
	try {
		const allFields = getFieldsName();
		var userAccounts = null;

		if(req.user.is_authenticated === true && req.user.is_admin === true) {
			const allowedFieldsName = getFieldsName();
			var {pageNumber, pageLimit, filterFields, sortFields, selectFields} = URLParser(req, allFields, allowedFieldsName);
			userAccounts = await findAllUserAccounts(pageNumber,
												pageLimit,
												filterFields,
												sortFields,
												selectFields
												);
		} else {
			const allowedFieldsName = ['first_name', 'last_name', 'username', 'creation_date'];
			var {pageNumber, pageLimit, filterFields, sortFields, selectFields} = URLParser(req, allFields, allowedFieldsName);
			if(Object.keys(selectFields).length === 0) selectFields = {first_name: 1, last_name: 1, username: 1, creation_date: 1};
			userAccounts = await findAllUserAccounts(pageNumber,
												pageLimit,
												filterFields,
												sortFields,
												selectFields
												);
		}


		// Returning error if no user exists.
		// Sequence is important in this if condition.
		if(userAccounts === null || userAccounts.data.length === 0) return res.status(204).json('No user exists.');

		// Sending users data.
		return res.status(200).send({
						userAccounts: userAccounts.data,
						totalPages: userAccounts.totalPages,
						currentPage: userAccounts.currentPage
						});

	} catch(error) {
		console.error(error);
		return res.status(500).json('Something went wrong during fetching user accounts\' data.');
	}
}

module.exports.getAllUserAccount = getAllUserAccount;