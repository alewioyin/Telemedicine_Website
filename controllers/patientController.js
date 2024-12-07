const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

//FUNCTION FOR PATIENT REGISTER
exports.registerPatient = async (req, res) => {
    const errors = validationResult(req);

    //check if any error is present in validation
    if (!errors.isEmpty()) {
        return res.status(401).json({ message: 'Please correct input errors', errors: errors.array() });
    }

    //fetch input parameter
    const { first_name, last_name, email, password, phone, date_of_birth, gender, address } = req.body;

    try {
        // check if patient exist
        const [patient] = await db.execute('SELECT * FROM patients WHERE email = ?', [email]);
        
        if (patient.length > 0) {
            return res.status(400).json({ message: 'The user already exist'});
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //insert record
        await db.execute('INSERT INTO patients (first_name, last_name, email, password, phone, date_of_birth, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
            first_name,
            last_name,
            email,
            hashedPassword,
            phone,
            date_of_birth,
            gender,
            address
        ]);

        //response
        res.status(200).json({ message: 'Patient registered successfully.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering patient', error: error.message });
    } 
};


//FUNCTION FOR PATIENT LOGIN
exports.loginPatient = async (req, res) => {
    //fetch email & password from request body
    const { email, password } = req.body;

    try {
        const [ patient ] = await db.execute('SELECT * FROM patients WHERE email = ?', [email]);

        if (patient.length === 0) {
            return res.status(401).json({ message: 'Patient not found'});
        }

        //check password
        const isMatch = await bcrypt.compare(password, patient[0].password);

        if (!isMatch) return res.status(400).json({ message: 'Invalid email/password combinations.' });

        //create session
        req.session.patientId = patient[0].id;
        req.session.first_name = patient[0].first_name;
        req.session.email = patient[0].email;
        
        return res.status(200).json({ message: 'Login successful', first_name: patient[0].first_name });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error occured during login', error: error.message})
    }
};


 //FUNCTION FOR PATIENT LOGOUT
exports.logoutPatient = async (req, res) => {
    req.session.destroy( (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'An error occured', error: err.message});
        }
        return res.status(200).json({ message: 'Patient successfully logged out.'});
    })
};


//FUNCTION TO GET PATIENT TO EDIT INFORMATION
exports.getPatient = async (req, res) => {
    //check if the patient is logged in or authorised
    if (!req.session.patientId) {
        return res.status(401).json({ message: 'Unauthorized!. Please log in.'});
    } 

    try {
        //fetch patient
        const [patient] = await db.execute('SELECT * FROM patients WHERE id = ?', [req.session.patientId]);

        if (patient.length === 0) {
            return res.status(400).json({ message: 'Patient not found'})
        }

        return res.status(200).json({ message: 'Patient details fetched for editing.', patient: patient[0]});

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occured while fetching patient details.', error: error.message})
    }
};

//FUNCTION FOR PATIENT EDITING
exports.editPatient = async(req, res) => {
    if (!req.session.patientId) {
        return res.status(401).json({ message: 'Unauthorized, Please login to continue.'});
    }

    const errors = validationResult(req);

    //check if any errors present  in validation
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Please correct input errors', errors: errors.array() })
    }

    //fetch patient details from requst body
    const { first_name, last_name, phone, date_of_birth, gender, address} = req.body;

    try {
        //update user details
        await db.execute('UPDATE patients SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ? WHERE id = ?',
      [first_name, last_name, phone, date_of_birth, gender, address, req.session.patientId]);

      return res.status(200).json({ message: 'Patient Information updated successfully.'})
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occured during edit.', error: error.message})
    }

};

//FUNCTION FOR PATINT TO DELETE ACCOUNT
exports.deletePatient =async(req, res) => {
     // Check if patient exists
     if (!req.session.patientId) {
        return res.status(401).json({ message: 'You must be logged in to delete your account.'});
    }

    try {
        //fetch patient
        const [patient] = await db.execute('DELETE FROM patients WHERE id = ?', [req.session.patientId]);

        if (patient.length === 0) {
            return res.status(400).json({ message: 'Patient not found or already deleted'})
        }

        return res.status(200).json({ message: 'Patient account deleted successfully.', patient: patient[0]});

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occured while deleting patient details.', error: error.message})
    }
};