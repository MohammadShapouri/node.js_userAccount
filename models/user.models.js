const mongoose = require('mongoose');
const {hashPassword} = require('../services/UserAccount/plugins.js')

mongoose.connect('mongodb://localhost/DemoUserModel')
	.then(result => console.log('Connected to DB'))
	.catch(error => console.error('Something went wrong.', error.message));




// const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{7,29}$/;
const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{5,29}$/;
const phone_numberRegex = /^09(1[0-9]|3[1-9]|2[1-9])-?[0-9]{3}-?[0-9]{4}$/;

const RETRY_COUNTER_LIMIT = 5;
const ALL_OTP_USAGE_TYPES = ['userAccount_verification', 'password_reset', 'new_phone_number_verification', 'login_second_step'];
// Can not directly use Date.now() because it create stativ date time.
const OTP_EXPIRATION_TIME_OFFSET = {
	userAccount_verification: 60*60*1000,
	password_reset: 5*60*1000,
	new_phone_number_verification: 60*60*1000,
	login_second_step: 5*60*1000
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
		default: Date.now() + 5*60*1000
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
		default: true
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
		expire_at: Date.now() + OTP_EXPIRATION_TIME_OFFSET[OTPUsageType],
		usage_type: OTPUsageType
	}
}





function addOTPCodeToUserAccount(userAccount, OTPUsageType) {
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
	// return await UserAccount.findOneAndUpdate({"_id": userAccount._id, "OTP_code._id": OTPObject._id}, {$inc: {"OTP_code.$.retry_counter": 1}}, {new: true});
		// OR
	const indexOfOTPObject = userAccount.OTP_code.indexOf(OTPObject);
	userAccount.OTP_code[indexOfOTPObject].retry_counter += 1;
	return await userAccount.save();
}


async function deleteOTPValidationObject(userAccount, OTPObject) {
	// return await UserAccount.findOneAndUpdate({"_id": userAccount._id, "OTP_code._id": OTPObject._id}, {$pull: {"OTP_code": {"_id": OTPObject._id}}});
		// OR
	const indexOfOTPObject = userAccount.OTP_code.indexOf(OTPObject);
	userAccount.OTP_code.splice(indexOfOTPObject, 1);
	return await userAccount.save();
}




async function validateOTPCode(input_OTP_code, userAccount, OTPUsageType) {
	if(ALL_OTP_USAGE_TYPES.includes(OTPUsageType) === false) {
		throw new Error(`OTP usage type must be one of these values: ${ALL_OTP_USAGE_TYPES}`);
	}

	const requestedOTPValidationObject = getOTPValidationObjectBaseOnUsage(userAccount, OTPUsageType);
	if(requestedOTPValidationObject === null) return {result: false, msg: 'No OTP code exists exists for validating this action.'}


	if(Date.now() >= requestedOTPValidationObject.expire_at) {
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
// 	const a = await UserAccount.findById('641ddb25d129a2ea8461c7cc')
// 	const b = await getOTPValidationObjectBaseOnUsage(a, 'password_reset')
// 	console.log(b);
// 	// await incrementOTPValidationObjectRetryCounter(a, b)
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


async function findOneUserAccountByPhoneNumberOrUsername(input) {
	if(/^\d+$/.test(input) === true) {
		// when input contains only numbers (phonenumber).
		return await UserAccount.findOne({ phone_number: input });
	} else {
		// when input contains numbers and strings (username).
		return await UserAccount.findOne({ username: input });
	}
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
	if('old_password' in body === true && 'new_password1' in body === true && 'new_password2' in body === true) {
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


async function activateAccountById(_id) {
	// return await UserAccount.findByIdAndUpdate(_id, {$set: {is_active: true}}, {new: true});
		// OR
	return await UserAccount.findByIdAndUpdate(_id, {is_active: true}, {new: true});
}


async function resetPasswordById(_id, body) {
	return await UserAccount.findByIdAndUpdate(_id, {password: await hashPassword(body.new_password1)}, {new: true});
}



function getFieldsName() {
	// const userAccountSchemaKeys = Object.keys(UserAccountSchema.paths);
	// return userAccountSchemaKeys;
	return Object.keys(UserAccountSchema.paths);
}





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
module.exports.resetPasswordById = resetPasswordById;
module.exports.activateAccountById = activateAccountById;
module.exports.findOneUserAccountByPhoneNumberOrUsername = findOneUserAccountByPhoneNumberOrUsername;
module.exports.getFieldsName = getFieldsName;

module.exports.validateOTPCode = validateOTPCode;
module.exports.getOTPValidationObjectBaseOnUsage = getOTPValidationObjectBaseOnUsage;
module.exports.addOTPCodeToUserAccount = addOTPCodeToUserAccount;
module.exports.generateOTPCode = generateOTPCode;
module.exports.ALL_OTP_USAGE_TYPES = ALL_OTP_USAGE_TYPES;
//
module.exports.incrementOTPValidationObjectRetryCounter = incrementOTPValidationObjectRetryCounter;
module.exports.deleteOTPValidationObject = deleteOTPValidationObject;


































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





// console.log(UserAccountSchema.paths);



// {
//   first_name: SchemaString {
//     enumValues: [],
//     regExp: null,
//     path: 'first_name',
//     instance: 'String',
//     validators: [ [Object], [Object] ],
//     getters: [],
//     setters: [],
//     _presplitPath: [ 'first_name' ],
//     options: SchemaStringOptions {
//       type: [Function: String],
//       require: [Array],
//       unique: false,
//       minlength: 3,
//       maxlength: 20
//     },
//     _index: null,
//     minlengthValidator: [Function (anonymous)],
//     maxlengthValidator: [Function (anonymous)],
//     [Symbol(mongoose#schemaType)]: true
//   },
//   last_name: SchemaString {
//     enumValues: [],
//     regExp: null,
//     path: 'last_name',
//     instance: 'String',
//     validators: [ [Object] ],
//     getters: [],
//     setters: [],
//     _presplitPath: [ 'last_name' ],
//     options: SchemaStringOptions {
//       type: [Function: String],
//       require: false,
//       unique: false,
//       maxlength: 20
//     },
//     _index: null,
//     maxlengthValidator: [Function (anonymous)],
//     [Symbol(mongoose#schemaType)]: true
//   },
//   username: SchemaString {
//     enumValues: [],
//     regExp: null,
//     path: 'username',
//     instance: 'String',
//     validators: [ [Object] ],
//     getters: [],
//     setters: [],
//     _presplitPath: [ 'username' ],
//     options: SchemaStringOptions {
//       type: [Function: String],
//       require: [Array],
//       unique: [Array],
//       validate: [Object]
//     },
//     _index: { unique: true },
//     [Symbol(mongoose#schemaType)]: true
//   },
//   phone_number: SchemaString {
//     enumValues: [],
//     regExp: null,
//     path: 'phone_number',
//     instance: 'String',
//     validators: [ [Object] ],
//     getters: [],
//     setters: [],
//     _presplitPath: [ 'phone_number' ],
//     options: SchemaStringOptions {
//       type: [Function: String],
//       require: [Array],
//       unique: [Array],
//       validate: [Object]
//     },
//     _index: { unique: true },
//     [Symbol(mongoose#schemaType)]: true
//   },
//   password: SchemaString {
//     enumValues: [],
//     regExp: null,
//     path: 'password',
//     instance: 'String',
//     validators: [ [Object] ],
//     getters: [],
//     setters: [],
//     _presplitPath: [ 'password' ],
//     options: SchemaStringOptions {
//       type: [Function: String],
//       maxlength: 512,
//       require: [Array]
//     },
//     _index: null,
//     maxlengthValidator: [Function (anonymous)],
//     [Symbol(mongoose#schemaType)]: true
//   },
//   creation_date: SchemaDate {
//     path: 'creation_date',
//     instance: 'Date',
//     validators: [],
//     getters: [],
//     setters: [],
//     _presplitPath: [ 'creation_date' ],
//     options: SchemaDateOptions {
//       type: [Function: Date],
//       default: [Function: now]
//     },
//     _index: null,
//     defaultValue: [Function: now],
//     [Symbol(mongoose#schemaType)]: true
//   },
//   is_active: SchemaBoolean {
//     path: 'is_active',
//     instance: 'Boolean',
//     validators: [],
//     getters: [],
//     setters: [],
//     _presplitPath: [ 'is_active' ],
//     options: SchemaTypeOptions { type: [Function: Boolean], default: false },
//     _index: null,
//     defaultValue: false,
//     [Symbol(mongoose#schemaType)]: true
//   },
//   is_admin: SchemaBoolean {
//     path: 'is_admin',
//     instance: 'Boolean',
//     validators: [],
//     getters: [],
//     setters: [],
//     _presplitPath: [ 'is_admin' ],
//     options: SchemaTypeOptions { type: [Function: Boolean], default: false },
//     _index: null,
//     defaultValue: false,
//     [Symbol(mongoose#schemaType)]: true
//   },
//   is_phone_number_verified: SchemaBoolean {
//     path: 'is_phone_number_verified',
//     instance: 'Boolean',
//     validators: [],
//     getters: [],
//     setters: [],
//     _presplitPath: [ 'is_phone_number_verified' ],
//     options: SchemaTypeOptions { type: [Function: Boolean], default: true },
//     _index: null,
//     defaultValue: true,
//     [Symbol(mongoose#schemaType)]: true
//   },
//   OTP_code: DocumentArrayPath {
//     schemaOptions: {},
//     casterConstructor: [Function: EmbeddedDocument] {
//       schema: [Schema],
//       '$isArraySubdocument': true,
//       events: [EventEmitter],
//       base: [Mongoose],
//       _events: undefined,
//       _eventsCount: 0,
//       _maxListeners: undefined,
//       setMaxListeners: [Function: setMaxListeners],
//       getMaxListeners: [Function: getMaxListeners],
//       emit: [Function: emit],
//       addListener: [Function: addListener],
//       on: [Function: addListener],
//       prependListener: [Function: prependListener],
//       once: [Function: once],
//       prependOnceListener: [Function: prependOnceListener],
//       removeListener: [Function: removeListener],
//       off: [Function: removeListener],
//       removeAllListeners: [Function: removeAllListeners],
//       listeners: [Function: listeners],
//       rawListeners: [Function: rawListeners],
//       listenerCount: [Function: listenerCount],
//       eventNames: [Function: eventNames],
//       options: [Object],
//       path: 'OTP_code',
//       '$appliedMethods': true,
//       '$appliedHooks': true,
//       _middleware: [Kareem]
//     },
//     caster: [Function: EmbeddedDocument] {
//       schema: [Schema],
//       '$isArraySubdocument': true,
//       events: [EventEmitter],
//       base: [Mongoose],
//       _events: undefined,
//       _eventsCount: 0,
//       _maxListeners: undefined,
//       setMaxListeners: [Function: setMaxListeners],
//       getMaxListeners: [Function: getMaxListeners],
//       emit: [Function: emit],
//       addListener: [Function: addListener],
//       on: [Function: addListener],
//       prependListener: [Function: prependListener],
//       once: [Function: once],
//       prependOnceListener: [Function: prependOnceListener],
//       removeListener: [Function: removeListener],
//       off: [Function: removeListener],
//       removeAllListeners: [Function: removeAllListeners],
//       listeners: [Function: listeners],
//       rawListeners: [Function: rawListeners],
//       listenerCount: [Function: listenerCount],
//       eventNames: [Function: eventNames],
//       options: [Object],
//       path: 'OTP_code',
//       '$appliedMethods': true,
//       '$appliedHooks': true,
//       _middleware: [Kareem]
//     },
//     '$embeddedSchemaType': SchemaType {
//       path: 'OTP_code.$',
//       instance: undefined,
//       validators: [],
//       getters: [],
//       setters: [],
//       _presplitPath: [Array],
//       options: [SchemaTypeOptions],
//       _index: null,
//       isRequired: false,
//       cast: [Function (anonymous)],
//       doValidate: [Function (anonymous)],
//       '$isMongooseDocumentArrayElement': true,
//       caster: [Function],
//       schema: [Schema],
//       [Symbol(mongoose#schemaType)]: true
//     },
//     '$isMongooseArray': true,
//     path: 'OTP_code',
//     instance: 'Array',
//     validators: [],
//     getters: [],
//     setters: [],
//     _presplitPath: [ 'OTP_code' ],
//     options: SchemaDocumentArrayOptions {
//       type: [Array],
//       require: false,
//       default: undefined
//     },
//     _index: null,
//     defaultValue: undefined,
//     schema: Schema {
//       obj: [Object],
//       paths: [Object],
//       aliases: {},
//       subpaths: {},
//       virtuals: [Object],
//       singleNestedPaths: {},
//       nested: {},
//       inherits: {},
//       callQueue: [],
//       _indexes: [],
//       methods: {},
//       methodOptions: {},
//       statics: {},
//       tree: [Object],
//       query: {},
//       childSchemas: [],
//       plugins: [Array],
//       '$id': 1,
//       mapPaths: [],
//       s: [Object],
//       _userProvidedOptions: {},
//       options: [Object],
//       '$globalPluginsApplied': true
//     },
//     '$isMongooseDocumentArray': true,
//     Constructor: [Function: EmbeddedDocument] {
//       schema: [Schema],
//       '$isArraySubdocument': true,
//       events: [EventEmitter],
//       base: [Mongoose],
//       _events: undefined,
//       _eventsCount: 0,
//       _maxListeners: undefined,
//       setMaxListeners: [Function: setMaxListeners],
//       getMaxListeners: [Function: getMaxListeners],
//       emit: [Function: emit],
//       addListener: [Function: addListener],
//       on: [Function: addListener],
//       prependListener: [Function: prependListener],
//       once: [Function: once],
//       prependOnceListener: [Function: prependOnceListener],
//       removeListener: [Function: removeListener],
//       off: [Function: removeListener],
//       removeAllListeners: [Function: removeAllListeners],
//       listeners: [Function: listeners],
//       rawListeners: [Function: rawListeners],
//       listenerCount: [Function: listenerCount],
//       eventNames: [Function: eventNames],
//       options: [Object],
//       path: 'OTP_code',
//       '$appliedMethods': true,
//       '$appliedHooks': true,
//       _middleware: [Kareem]
//     },
//     [Symbol(mongoose#schemaType)]: true
//   },
//   _id: ObjectId {
//     path: '_id',
//     instance: 'ObjectID',
//     validators: [],
//     getters: [],
//     setters: [ [Function: resetId] ],
//     _presplitPath: [ '_id' ],
//     options: SchemaObjectIdOptions { auto: true, type: 'ObjectId' },
//     _index: null,
//     defaultValue: [Function: defaultId] { '$runBeforeSetters': true },
//     [Symbol(mongoose#schemaType)]: true
//   },
//   __v: SchemaNumber {
//     path: '__v',
//     instance: 'Number',
//     validators: [],
//     getters: [],
//     setters: [],
//     _presplitPath: [ '__v' ],
//     options: SchemaNumberOptions { type: [Function: Number] },
//     _index: null,
//     [Symbol(mongoose#schemaType)]: true
//   }
// }