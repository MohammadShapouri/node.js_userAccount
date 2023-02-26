const express = require('express');
const mongoose = require('mongoose');
const {UserAccount} = require('../models/user.models.js');
const {validateUserCreation, validateUserNewInfo, ValidateDeleteAccountPasswords, validatePasswordChangingInputs, usernameExists, phone_numberExists} = require('../utils/validators/user.validators.js');
const {hashPassword, comparePassword} = require('../utils/password_hasher/bcrypt.password.hasher.js');


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
		// Sequence is so important in this if condition.
		if(userAccounts === null || userAccounts.length === 0) return res.status(400).json('No user exists.');

		// Sending users data.
		res.status(200).send({
			userAccounts,
			totalPages: Math.ceil(accountsCount/limit),
			currentPage: page
			});

	} catch(error) {
		console.error(error);
		return res.status(400).json('Something went wrong during fetching user accounts\' data.');
	}

});










router.get('/:id', async(req, res) => {
	try {
		const requestedUserAccount = await UserAccount.find({$and: [{_id: req.params.id}, {is_active: true}, {is_phone_number_verified: true}]})
											.select({ phone_number: 0, password: 0, is_active: 0, is_admin: 0, is_phone_number_verified: 0 });

		// Sequence is so important in this if condition.
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(400).json('No user exists with this ID.');

		return res.status(200).send(requestedUserAccount);
	} catch(error) {
		console.error(error);
		return res.status(400).json('Something went wrong during fetching user account\'s data.');
	}

});










router.post('/', async(req, res) => {
	try {
		const validationResult = await validateUserCreation(req.body);


		if(validationResult.status === 'success') {
			if(validationResult.errorMessages) {
				return res.status(400).send(validationResult.errorMessages);
			}
		} else {
			console.log(validationResult.error);
			return res.status(400).json('Something went wrong during checking new user account\'s info.');
		}		
	} catch(error) {
		console.log(error);
		return res.status(400).json('Something went wrong during validating new user account data.');		
	}

	try {
		const hashedPassword = await hashPassword(req.body.password1)

		if(hashedPassword.status === 'failure') {
			console.log(hashedPassword.error);
			return res.status(400).json('An error occured.');
		}

		const newUserAccount = await UserAccount.create({first_name: req.body.first_name, last_name: req.body.last_name, username: req.body.username, phone_number: req.body.phone_number, password: hashedPassword.password});
		return res.status(200).send(newUserAccount);
	} catch(error) {
		console.log(error);
		return res.status(400).json('Something went wrong during saving new user account.');
	}
});










router.patch('/:id', async(req, res) => {
	try {
		var requestedUserAccount = await UserAccount.findById(req.params.id);
		// Sequence is so important in this if condition.
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(400).json('No user exists with this ID.');

		var validationResult = await validateUserNewInfo(req.body, req.params.id);
		if(validationResult.status === 'success') {
			if(validationResult.errorMessages) {
				return res.status(400).send(validationResult.errorMessages);
			}
		} else {
			console.log(validationResult.error);
			return res.status(400).json('Something went wrong during checking new user account\'s info.');
		}


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
		return res.status(400).json('Something went wrong during updating user account data.');
	}
});










router.delete('/:id', async(req, res) => {
	try {
		const requestedUserAccount = await UserAccount.findById(req.params.id);
		// Sequence is so important in this if condition.
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(400).json('No user exists with this ID.');

		const validationResult = ValidateDeleteAccountPasswords(req.body);
		if(validationResult.status === 'success') {
			if (validationResult.errorMessages) {
				return res.status(400).json(validationResult.errorMessages);
			}
		} else {
			console.log(validationResult.error);
			return res.status(400).json('Something went wrong during deleting new user account\'s info.');	
		}

		const passwordCheckingResult = await comparePassword(plainTextPassword=req.body.password, userAccountDoc=requestedUserAccount);

		if(passwordCheckingResult === 'failure') {
			console.log(passwordCheckingResult.error);
			return res.status(400).json('An error occured during checking password.');
		} else if(passwordCheckingResult === 'invalidUser') {
			return res.status(400).json('No user account found eith this ID.');
		} else if(passwordCheckingResult.status === 'success' && passwordCheckingResult.compareResult === false) {
			return res.status(400).json('Password is invalid.');
		} else if(passwordCheckingResult.status === 'success' && passwordCheckingResult.compareResult === true) {
			await UserAccount.findByIdAndDelete(req.params.id, {new: true});
			return res.status(401).json('User account deleted.');
		}

	} catch(error) {
		console.log(error);
		return res.status(400).json('Something went wrong during updating user account data.');
	}
});










router.patch('/changepassword/:id', async(req, res) => {
	try {
		const requestedUserAccount = await UserAccount.findById(req.params.id);
		// Sequence is so important in this if condition.
		if(requestedUserAccount === null || requestedUserAccount.length === 0) return res.status(400).json('No user exists with this ID.');

		// Just validating inputs format.
		const validationResult = validatePasswordChangingInputs(req.body);
		if(validationResult.status === 'success') {
			if(validationResult.errorMessages) {
				return res.status(400).send(validationResult.errorMessages);
			}
		} else {
			console.log(validationResult.error);
			return res.status(400).json('Something went wrong during changing user account password.');
		}

		// Comparing password with saved encrypted string in DB.
		const passwordCheckingResult = await comparePassword(plainTextPassword=req.body.old_password, userAccountDoc=requestedUserAccount);

		if(passwordCheckingResult === 'failure') {
			console.log(passwordCheckingResult.error);
			return res.status(400).json('An error occured during checking password.');
		} else if(passwordCheckingResult === 'invalidUser') {
			return res.status(400).json('No user account found eith this ID.');
		} else if(passwordCheckingResult.status === 'success' && passwordCheckingResult.compareResult === false) {
			return res.status(400).json('Password is incorrect.');
		} else if(passwordCheckingResult.status === 'success' && passwordCheckingResult.compareResult === true) {
			const hashedPassword = await hashPassword(req.body.new_password1)

			if(hashedPassword.status === 'failure') {
				console.log(hashedPassword.error);
				return res.status(400).json('An error occured.');
			}
			userAccountNewPassword = {
				password:hashedPassword.password
			};
			await UserAccount.findByIdAndUpdate(req.params.id, userAccountNewPassword, {new:true});
			return res.status(200).json('Password updated.');
		}

	} catch(error) {
		console.log(error);
		return res.status(400).json('Something went wrong during changing user account password.');
	}
});











module.exports = router;