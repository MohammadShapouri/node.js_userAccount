const express = require('express');
const router = express.Router();

const {getAllUserAccount} = require('./UserAccount/getAllUserAccounts.js');
const {getSpecificUserAccount} = require('./UserAccount/getSpecificUserAccount.js');
const {addUserAccount} = require('./UserAccount/addUserAccount.js');
const {updateUserAccount} = require('./UserAccount/updateUserAccount.js');
const {deleteUserAccount} = require('./UserAccount/deleteUserAccount.js');
const {changeUserAccountPassword} = require('./UserAccount/changeUserAccountPassword.js');
const {verifyUserAccountVerificationOTP, verifyPasswordResetOTP, verifyNewPhoneNumberVerificationOTP, verifyLoginSecondStepOTP} = require('./UserAccount/verifyOTPCode.js');






router.get('/', getAllUserAccount);
router.get('/:id', getSpecificUserAccount);
router.post('/', addUserAccount);
router.patch('/:id', updateUserAccount);
router.delete('/:id', deleteUserAccount);
router.patch('/changepassword/:id', changeUserAccountPassword);
router.get('/userAccount_verification/:id', );
router.post('/userAccount_verification/:id', verifyUserAccountVerificationOTP);
router.post('/password_reset/:id', verifyPasswordResetOTP);
router.post('/new_phone_number_verification/:id', verifyNewPhoneNumberVerificationOTP);
router.post('/login_second_step/:id', verifyLoginSecondStepOTP);





module.exports = router;