const express = require('express');

const router = express.Router();

const {getAllUserAccount} = require('./UserAccount/getAllUserAccounts.js');
const {getSpecificUserAccount} = require('./UserAccount/getSpecificUserAccount.js');
const {addUserAccount} = require('./UserAccount/addUserAccount.js');
const {updateUserAccount} = require('./UserAccount/updateUserAccount.js');
const {deleteUserAccount} = require('./UserAccount/deleteUserAccount.js');
const {changeUserAccountPassword} = require('./UserAccount/changeUserAccountPassword.js');
const {verifyUserAccountVerificationOTP, verifyPasswordResetOTP, verifyNewPhoneNumberVerificationOTP, verifyLoginSecondStepOTP} = require('./UserAccount/verifyOTPCode.js');
const {generatePasswordResetOTP, resetPassword} = require('./UserAccount/passwordReset.js');
const {generateJWTAccessRefreshToken, refreshJWTAccessRefreshToken} = require('./UserAccount/generateRefreshJWTTokens.js');



// From UserAccount service
router.get('/', getAllUserAccount);
router.get('/:id', getSpecificUserAccount);
router.post('/', addUserAccount);
router.patch('/:id', updateUserAccount);
router.delete('/:id', deleteUserAccount);
router.patch('/change_password/:id', changeUserAccountPassword);
router.post('/userAccount_verification/:id', verifyUserAccountVerificationOTP);
router.get('/request_reset_password_otp', generatePasswordResetOTP);
router.post('/check_reset_password_otp', verifyPasswordResetOTP);
router.post('/reset_password', resetPassword);

router.post('/new_phone_number_verification/:id', verifyNewPhoneNumberVerificationOTP);
router.post('/login_second_step/:id', verifyLoginSecondStepOTP);


router.post('/jwt/generate', generateJWTAccessRefreshToken);
router.post('/jwt/refresh', refreshJWTAccessRefreshToken);




module.exports = router;
