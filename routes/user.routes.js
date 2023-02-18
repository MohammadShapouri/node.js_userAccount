const express = require('express');
const mongoose = require('mongoose');
const UserAccount = require('../models/user.models.js');
const {validateUserCreation, validateUserNewInfo, usernameExists, phone_numberExists} = require('../utils/validators/user.validators.js');
// const {validateUserCreation, validateUserNewInfo, validateInputObjectId} = require('../utils/validators/user.validators.js');


const router = express.Router();


router.get('/', async(req, res) => {
	// Getting page number and limit size / using defaults.
	const {page=1, limit=10}= req.query;

	// Fetching and paginating all user account data for normal users.
	try {
		const accountsCount = await UserAccount.countDocuments({});
		const userAccounts = await UserAccount.find({$and: [{is_active: true}, {is_phone_number_verified: true}]})
									.limit(limit*1)
									.skip((page-1)*limit)
									.sort({ creation_date: 1 })
									.select({ phone_number: 0, password: 0, is_active: 0, is_admin: 0, is_phone_number_verified: 0 });

		// Returning error if no user exists.
		// if(!userAccounts) return res.status(400).send('No user exists.');

		// Sending users data.
		res.status(200).send({
			userAccounts,
			totalPages: Math.ceil(accountsCount/limit),
			currentPage: page
			});

	} catch(error) {
		console.error(error);
		return res.status(400).send('Something went wrong during fetching user accounts\' data.');
	}

});










router.get('/:id', async(req, res) => {

	try {
		const requestedUserAccount = await UserAccount.find({$and: [{id: req.params.id}, {is_active: true}, {is_phone_number_verified: true}]})
											.select({ phone_number: 0, password: 0, is_active: 0, is_admin: 0, is_phone_number_verified: 0 });

		// if(!requestedUserAccount) return res.status(400).send('No user exists with this ID.');

		return res.status(200).send(requestedUserAccount);
	} catch(error) {
		console.error(error);
		return res.status(400).send('Something went wrong during fetching user account\'s data.');
	}

});










router.post('/', async(req, res) => {

	const validationResult = await validateUserCreation(req.body);

	console.log(validationResult);

	if(validationResult) {
		if(validationResult.hasOwnProperty("unexpected_error")) {
			if(validationResult.unexpected_error === true) {
				return res.status(400).send('Something went wrong during checking new user account\'s info.');
			}
		} else if(validationResult) {
			return res.status(400).send(validationResult);
		}	
	} else if(!validationResult) {
		null;
	}


	try {
		const newUserAccount = await UserAccount.create({ first_name: req.body.first_name, last_name: req.body.last_name, username: req.body.username, phone_number: req.body.phone_number, password: req.body.password });
		return res.status(200).send(newUserAccount);
	} catch(error) {
		console.error(error);
		return res.status(400).send('Something went wrong during saving new user account.');
	}
});










router.patch('/:id', async(req, res) => {

	try {
		var requestedUserAccount = await UserAccount.findById(req.params.id);
		if(!requestedUserAccount) return res.status(400).send('No user exists with this ID.');

		var validationResult = validateUserNewInfo(req.body);
		if(!validationResult) {
				validationResult = {};
			}

		const douplicateUsers = await UserAccount.find({$or: [{username:req.body.username}, {phone_number: req.body.phone_number}]});
		if(douplicateUsers) {
			for(eachUser of douplicateUsers) {
				if(eachUser.username === req.body.username && eachUser._id!== req.params.id) {
					if(validationResult.hasOwnProperty("username")) {
						const joiUsernameError = validationResult["username"];
						validationResult["username"] = [joiUsernameError, usernameExists];
					} else {
						validationResult["username"] = usernameExists;
					}
				}
				if(eachUser.phone_number === req.body.phone_number && eachUser._id!== req.params.id) {
					if(validationResult.hasOwnProperty("phone_number")) {
						const joiPhone_numberError = validationResult["phone_number"];
						validationResult["phone_number"] = [joiPhone_numberError, phone_numberExists];
					} else {
						validationResult["phone_number"] = phone_numberExists;
					}
				}
			}
		}
		if(Object.keys(validationResult).length !== 0) return res.status(400).send(validationResult);

		userAccountNewData = {
			first_name: req.body.first_name || requestedUserAccount.first_name,
			last_name: req.body.last_name || requestedUserAccount.last_name,
			username: req.body.username || requestedUserAccount.username,
			phone_number: req.body.phone_number || requestedUserAccount.phone_number
		};
		requestedUserAccount = await UserAccount.findByIdAndUpdate(req.params.id, userAccountNewData, {new: true});
		return res.status(200).send(requestedUserAccount);
	} catch(error) {
		console.error(error);
		return res.status(400).send('Something went wrong during updating user account data.');
	}
});





module.exports = router;




	// const ValidationResult = validateInputObjectId(req.body);

 	// if(ValidationResult.error) {
	// 	var errorMessags = {};
	// 	for(errorItem of ValidationResult.error["details"]) {
	// 		var key = errorItem["context"]["key"];
	// 		errorMessags[key] = errorItem["message"];
	// 	}
	// 	return res.status(400).send(errorMessags);
	// }
