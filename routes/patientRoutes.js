const express = require('express');
const { registerPatient, loginPatient,  logoutPatient, getPatient, editPatient, deletePatient } = require('../controllers/patientController');
const {check} = require('express-validator');
const router = express.Router();

// Middleware to verify JWT token


// REGISTRATION ROUTE
router.post('/register',
    [
    check('first_name', 'First name cannot be empty').not().isEmpty(),
    check('last_name', 'Last name cannot be empty').not().isEmpty(),
    check('email', 'Please enter a valid email address').isEmail(),
    check('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
    check('phone', 'Please enter a valid phone number').isMobilePhone()
    ], 
    registerPatient
);

 //LOGIN ROUTE
router.post('/login', loginPatient);

//LOGOUT ROUTE
router.get('/logout', logoutPatient);

//GET PATIENT ROUTE
router.get('/individual', getPatient);

//EDIT PATIENT ROUTE
router.put('/individual/edit', 
    [
        check('first_name', 'First name cannot be empty').not().isEmpty(),
        check('last_name', 'Last name cannot be empty').not().isEmpty(),
        check('email', 'Please enter a valid email address').isEmpty(),
        check('phone', 'Please enter a valid phone number').isMobilePhone()
    ],
    editPatient
); 

router.delete('/delete', deletePatient);

module.exports = router;