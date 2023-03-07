function URLParser(req, res, next) {
	const {pageNumber=1, pageLimit=10}= req.query;

	var filterFields = [];
	if(req.query.filterFields !== undefined) {
		var filterFieldsList = null;
		if(Array.isArray(req.query.filterFields) === true) {
			filterFieldsList = req.query.filterFields;
		} else {
			filterFieldsList = [req.query.filterFields];
		}
		for(eachItem of filterFieldsList) {
			const eachSelectFieldDetail = eachItem.split(':');
			const key = eachSelectFieldDetail[0];
			const eachSelectField = {};
			eachSelectField[key] = eachSelectFieldDetail[1];
			filterFields.push(eachSelectField);
		}
	}


	var sortFields = {};
	if(req.query.sortFields !== undefined) {
		var sortFieldsList = null;
		if(Array.isArray(req.query.sortFields) === true) {
			sortFieldsList = req.query.sortFields;
		} else {
			sortFieldsList = [req.query.sortFields];
		}
		for(eachItem of sortFieldsList) {
			sortFields[eachItem] = 1;
		}
	}


	var selectFields = {};
	if(req.query.selectFields !== undefined) {
		var selectFieldsList = null;
		if(Array.isArray(req.query.selectFields) === true) {
			selectFieldsList = req.query.selectFields;
		} else {
			selectFieldsList = [req.query.selectFields];
		}
		for(eachItem of selectFieldsList) {
			selectFields[eachItem] = 1;
		}
	}

	req.pageNumber = pageNumber;
	req.pageLimit = pageLimit;
	req.filterFields = filterFields;
	req.sortFields = sortFields;
	req.selectFields = selectFields;
	next();
}

// IT WORKS. ---\/
// ?filterFields=first_name:MSH&filterFields=username:mohammad3&selectFields=password&selectFields=_id


module.exports.URLParser = URLParser;