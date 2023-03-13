const mongoose = require('mongoose');
const {hashPassword} = require('../services/UserAccount/plugins.js')

mongoose.connect('mongodb://localhost/DemoUserModel')
	.then(result => console.log('Connected to DB'))
	.catch(error => console.error('Something went wrong.', error.message));




const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{7,29}$/;
const phone_numberRegex = /^09(1[0-9]|3[1-9]|2[1-9])-?[0-9]{3}-?[0-9]{4}$/;

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
		type: mongoose.Schema.Types.ObjectId,
		ref: "OTP Validation",
		require: false
	}
});
const UserAccount = mongoose.model("User Account", UserAccountSchema)








async function findUserAccountsForValidation(username, phone_number) {
	return await UserAccount.find({ $or: [{ username: username }, { phone_number: phone_number }] });
}


async function findUserAccountById(_id, selectFields=null) {
	return await UserAccount.findById(_id)
				.select(selectFields);
}
// ?selectFields=password&selectFields=_id


async function findUserAccountByPhoneNumber(phone_number) {
	return await UserAccount.find({ phone_number: phone_number });
}


async function createUserAccount(body) {
	const hashedPassword = await hashPassword(body.password1);
	body['password'] = hashedPassword;
	delete body.password1;
	delete body.password2;
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
module.exports.findUserAccountByPhoneNumber = findUserAccountByPhoneNumber;
module.exports.createUserAccount = createUserAccount;
module.exports.updateUserAccountById = updateUserAccountById;
module.exports.deleteUserAccountById = deleteUserAccountById;
module.exports.findAllUserAccounts = findAllUserAccounts;




































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