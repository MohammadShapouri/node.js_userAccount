const mongoose = require('mongoose');
const {hashPassword} = require('../services/UserAccount/plugins.js')

mongoose.connect('mongodb://localhost/DemoUserModel')
	.then(result => console.log('Connected to DB'))
	.catch(error => console.error('Something went wrong.', error.message));




const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{7,29}$/;
const phone_numberRegex = /^09(1[0-9]|3[1-9]|2[1-9])-?[0-9]{3}-?[0-9]{4}$/;

const RETRY_COUNTER_LIMIT = 5;
const ALL_OTP_USAGE_TYPES = ['userAccount_verification', 'password_reset', 'new_phone_number_verification', 'login_second_step'];
const OTP_EXPIRATION_TIME = {
	userAccount_verification: +new Date() + 60*60*1000,
	password_reset: +new Date() + 5*60*1000,
	new_phone_number_verification: +new Date() + 60*60*1000,
	login_second_step: +new Date() + 5*60*1000
}




const OTPValidationSchema = mongoose.Schema({
	OTP_code: {
		type: String,
		minlength: 8,
		maxlength: 8,
		require: [true, 'OTP Code is required.']
	},
	retry_counter: {
		type: Number,
		max: 5,
		default: 0
	},
	creation_date: {
		type: Date,
		default: Date.now
	},
	expire_at: {
		type: Date,
		default: +new Date() + 5*60*1000
		// default: new Date(+new Date() + 5*60*1000)
		// default: function() {return +new Date() + 5*60*1000}
	},
	usage_type: {
		type: String,
		require: [true, 'Decelaring usage type is required.'],
		enum: ALL_OTP_USAGE_TYPES,
		validate: {
			isasync: false,
			validator: function(value) {
				return ALL_OTP_USAGE_TYPES.includes(value);
			},
			message: '{VALUE} is not among acceptable values of the list.'
			
		}
	}
});






const UserAccountSchema = mongoose.Schema({
	first_name: {
		type: String,
		require: [true, 'First name is required.'],
		unique: false,
		minlength: 3,
		maxlength: 20
	},
	last_name: {
		type: String,
		require: false,
		unique: false,
		minlength: 3,
		maxlength: 20
	},
	username: {
		type: String,
		require: [true, 'Username is required.'],
		unique: [true, 'Username must be unique.'],
		validate: {
			isasync: false,
			validator: function(value) {
				return new RegExp(usernameRegex).test(value);
			},
			message: '{VALUE} is not a valid username.'
		}
		// match: [/^[A-Za-z][A-Za-z0-9_]{7,29}$/, '{VALUE} is not a valid username.']
	},
	phone_number: {
		type: String,
		require: [true, 'Phone number is required.'],
		unique: [true, 'Phone Number must be unique.'],
		validate: {
			isasync: false,
			validator: function(value) {
				return new RegExp(phone_numberRegex).test(value);
			},
			message: '{VALUE} is not a valid phone number.'
		}
	},
	password: {
		type: String,
		maxlength: 512,
		require: [true, 'Password is required.']
	},
	creation_date: {
		type: Date,
		default: Date.now
	},
	is_active: {
		type: Boolean,
		default: false
	},
	is_admin: {
		type: Boolean,
		default: false
	},
	is_phone_number_verified:{
		type: Boolean,
		default: false
	},
	OTP_code: {
		type: [OTPValidationSchema],
		require: false,
		default: undefined
	}
});
const UserAccount = mongoose.model("User Account", UserAccountSchema)










function generateOTPCode(OTPUsageType) {
	if(ALL_OTP_USAGE_TYPES.includes(OTPUsageType) === false) {
		throw new Error(`OTP usage type must be one of these values: ${ALL_OTP_USAGE_TYPES}`);
	}

	return {
		OTP_code: parseInt(10000000 + Math.random()* 90000000),
		expire_at: OTP_EXPIRATION_TIME[OTPUsageType],
		usage_type: OTPUsageType
	}
}





function addOTPCodeTOUserAcountBaseOnId(userAccount, OTPUsageType) {
	const OTPCodeObject = generateOTPCode(OTPUsageType);
	userAccount.OTP_code.push(OTPCodeObject);
	userAccount.save();
}




function getOTPValidationObjectBaseOnUsage(userAccount, OTPUsageType) {
	// var requestedOTPValidationObject = await UserAccount.findOne({"_id": '64115a2e137bf073f970c9f2'}, {"OTP_code": {$elemMatch: {"otp_usage": OTPUsageType}}});
	// Sequence is important.
	if(userAccount.OTP_code === undefined || userAccount.OTP_code.length === 0) return null;

	for(eachOTPObject of userAccount.OTP_code) {
		if(eachOTPObject.usage_type === OTPUsageType) return eachOTPObject
	}
	return null;
}


async function incrementOTPValidationObjectRetryCounter(userAccount, OTPObject) {
	return await UserAccount.findOneAndUpdate({"_id": userAccount._id, "OTP_code._id": OTPObject._id}, {$inc: {"OTP_code.$.retry_counter": 1}}, {new: true});
		// OR
	// indexOfOTPObject = userAccount.OTP_code.indexOf(OTPObject);
	// userAccount.OTP_code[indexOfOTPObject].retry_counter += 1;
	// return await userAccount.save();
}


async function deleteOTPValidationObject(userAccount, OTPObject) {
	return await UserAccount.findOneAndUpdate({"_id": userAccount._id, "OTP_code._id": OTPObject._id}, {$pull: {"OTP_code": {"_id": OTPObject._id}}});
		// OR
// 	indexOfOTPObject = userAccount.OTP_code.indexOf(OTPObject);
// 	userAccount.OTP_code.splice(indexOfOTPObject, 1);
// 	return await userAccount.save();
}




async function validateOTPCode(input_OTP_code, userAccount, OTPUsageType) {
	if(ALL_OTP_USAGE_TYPES.includes(OTPUsageType) === false) {
		throw new Error(`OTP usage type must be one of these values: ${ALL_OTP_USAGE_TYPES}`);
	}


	const requestedOTPValidationObject = getOTPValidationObjectBaseOnUsage(userAccount, OTPUsageType);
	if(requestedOTPValidationObject === null) return {result: false, msg: 'No OTP code exists exists for validating this action.'}


	if(Date.now() > requestedOTPValidationObject.expire_at) {
		return {result: false, msg: 'OTP is expired. Request new one.'}
	} else {
		if(requestedOTPValidationObject.retry_counter >= 5) {
			return {result: false, msg: 'Too many trys. Request new one.'}
		} else {
			if(input_OTP_code !== requestedOTPValidationObject.OTP_code) {
				await incrementOTPValidationObjectRetryCounter(userAccount, requestedOTPValidationObject)
				return {result: false, msg: 'OTP is not correct. Enter the correct one.'}
			} else {
				await deleteOTPValidationObject(userAccount, requestedOTPValidationObject)
				return {result: true, msg: 'Successful!'}
			}
		}
	}
}



// async function aa() {
// 	const a = await UserAccount.findById('64115a2e137bf073f970c9f2')
// 	const b = await getOTPValidationObjectBaseOnUsage(a, 'password_reset')
// 	console.log(b);
// 	await incrementOTPValidationObjectRetryCounter(a, b)
// }
// aa()



async function findUserAccountsForValidation(username, phone_number) {
	return await UserAccount.find({ $or: [{ username: username }, { phone_number: phone_number }] });
}


async function findUserAccountById(_id, selectFields=null) {
	return await UserAccount.findById(_id)
				.select(selectFields);
}
// ?selectFields=password&selectFields=_id


async function findOneUserAccountByPhoneNumber(phone_number) {
	return await UserAccount.findOne({ phone_number: phone_number });
}


async function createUserAccount(body) {
	const hashedPassword = await hashPassword(body.password1);
	body['password'] = hashedPassword;
	delete body.password1;
	delete body.password2;
	body['OTP_code'] = generateOTPCode('userAccount_verification')
	return await UserAccount.create(body);
}


async function updateUserAccountById(_id, body) {
	if('new_password1' in body === true && 'new_password2' in body === true) {
		return await UserAccount.findByIdAndUpdate(_id, {password: await hashPassword(body.new_password1)}, {new:true});
	} else {
		return await UserAccount.findByIdAndUpdate(_id, body, {new: true});
	}
}


async function deleteUserAccountById(_id) {
	return await UserAccount.findByIdAndDelete(_id, {new: true});
}


async function findAllUserAccounts(pageNumber, pageLimit, filterFields, sortFields, selectFields) {
	// const accountsCount = await UserAccount.countDocuments({});
	var findEXP = null;
	if(filterFields.length === 0) {
		findEXP = {};
	} else {
		findEXP = {$and: filterFields};
	}

	const userAccounts = await UserAccount.find(findEXP)
					.limit(pageLimit*1)
					.skip((pageNumber-1)*pageLimit)
					.sort(sortFields)
					.select(selectFields);
	return {
		data: userAccounts,
		totalPages: Math.ceil(userAccounts.length/pageLimit),
		currentPage: pageNumber
		};
}


// async function findSpecificUserAccount(filterFields, selectFields) {
// 	return await UserAccount.find({$and: filterFields})
// 				.select(selectFields);
// }













module.exports.usernameRegex = usernameRegex;
module.exports.phone_numberRegex = phone_numberRegex;
module.exports.UserAccount = UserAccount;
module.exports.findUserAccountsForValidation = findUserAccountsForValidation;
module.exports.findUserAccountById = findUserAccountById;
module.exports.findOneUserAccountByPhoneNumber = findOneUserAccountByPhoneNumber;
module.exports.createUserAccount = createUserAccount;
module.exports.updateUserAccountById = updateUserAccountById;
module.exports.deleteUserAccountById = deleteUserAccountById;
module.exports.findAllUserAccounts = findAllUserAccounts;
module.exports.validateOTPCode = validateOTPCode;
module.exports.getOTPValidationObjectBaseOnUsage = getOTPValidationObjectBaseOnUsage;
module.exports.addOTPCodeTOUserAcountBaseOnId = addOTPCodeTOUserAcountBaseOnId
module.exports.ALL_OTP_USAGE_TYPES = ALL_OTP_USAGE_TYPES;


































// validate: {
        //     isAsync: true,
        //     validator: function(value, callback= result => result) {
        //         const notes = this.model('Note').find({title: {$regex: new RegExp(value, "i")}}).count();
        //         // if(error) return callback(error);
        //         return callback(notes === 0);
        //     },
        //     message: "Title is not unique."
        // }
    // },




// noteSchema.path('title').validate(validator= function(value, callback= result => result) {
//     const notes = this.model('Note').find({title: {$regex: new RegExp(value, "i")}}).count();
//     // if(error) return callback(error.message);
//     return callback(notes === 0);
// }, message= "Title is not unique.")


// noteSchema.path('title').validate(validator= async function(value) {
//     const notes = await this.model('Note').find({title: {$regex: new RegExp(value, "i")}}).count();
//     console.log(notes);
//     return notes === 0;
//     // if(notes === 0) return true
//     // return false
// }, message= "Title is not unique.")