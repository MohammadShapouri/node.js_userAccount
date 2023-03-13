const {findAllUserAccounts} = require('../../models/user.models.js');


const getAllUserAccount = async(req, res) => {
	try {
		// Parsing middleware will parse and add parameters to request object.
		const userAccounts = await findAllUserAccounts(pageNumber=req.pageNumber,
													pageLimit=req.pageLimit,
													filterFields=req.filterFields,
													sortFields=req.sortFields,
													selectFields=req.selectFields
													);

		// Returning error if no user exists.
		// Sequence is important in this if condition.
		if(userAccounts === null || userAccounts.data.length === 0) return res.status(400).json('No user exists.');

		// Sending users data.
		res.status(200).send({
						userAccounts: userAccounts.data,
						totalPages: userAccounts.totalPages,
						currentPage: userAccounts.currentPage
						});

	} catch(error) {
		console.error(error);
		return res.status(400).json('Something went wrong during fetching user accounts\' data.');
	}
}

module.exports.getAllUserAccount = getAllUserAccount;