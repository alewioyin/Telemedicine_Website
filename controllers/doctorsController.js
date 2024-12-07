const db = require('../config/database');
const { validationResult } = require('express-validator');

//ADD DOCTOR
exports.addDoctor = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(401).json({ message: 'Please correct input errors', errors: errors.array() });
    }

    const { first_name, last_name, specialization, email, phone, schedule } = req.body;

    try {
        // check if doctor exist
        const [doctor] = await db.execute('SELECT * FROM doctors WHERE email = ?', [email]);

        if (doctor.length > 0) {
            return res.status(400).json({ message: 'Doctor already exist'});
        }

        //if doctor does not  exist
         await db.execute( ' INSERT doctors (first_name, last_name, specialization, email, phone, schedule) VALUES (?, ?, ?, ?, ?, ?)', [ first_name, last_name, specialization, email, phone, schedule ]);

        return res.status(200).json({ message: 'Doctor added successfully!'});

    } catch (error) {
        console.error(error);
       return res.status(500).json({ message: 'An error occurred while adding the doctor', error: error.message });
    }
};

//LOGIN DOCTOR
exports.loginDoctor = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [doctor] = await db.execute('SELECT * FROM doctors WHERE email =?', [email]);
        
        if (doctor.length === 0) {
            return res.status(401).json({ message: 'Doctor not found'});
        }
        
       /*  const isMatch = await bcrypt.compare(password, doctor[0].password);
        
        if (!isMatch) return res.status(400).json({ message: 'Invalid email/password combinations.' }); */
        
        //create session
        req.session.doctorId = doctor[0].id;
        req.session.first_name = doctor[0].first_name;
        req.session.email = doctor[0].email;
        
        return res.status(200).json({ message: 'Login successful', first_name: doctor[0].first_name });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error occured during login', error: error.message});
    }
};

//GET ALL DOCTORS
exports.getAllDoctors = async (req, res) => {
    try {
        const [doctors] = await db.execute(`SELECT * FROM doctors`);

        return res.status(200).json(doctors)
       
    } catch (error) {
        console.error(error);
       return res.status(500).json({ message: 'An error occurred while fetching doctor', error: error.message });
    }
};

// GET A DOCTOR
exports.getDoctor = async (req, res) => { 
    try {
        const  email  = req.params.email;

        const [doctor] = await db.execute(`SELECT * FROM doctors WHERE email = ?`, [email]);

        if (doctor.length === 0) {
            return res.status(400).json({ message: 'Doctor not found'});
        }
        
        return res.status(200).json(doctor[0]);      
    } catch (error) {
        console.error(error);
       return res.status(500).json({ message: 'An error occurred while fetching doctor', error: error.message });
    }
};

//UPDATE DOCTOR
exports.updateDoctor = async (req, res) => {
    const errors = validationResult(req);

    const doctorId = req.params.id;
    const { first_name, last_name, specialization, email, phone, schedule} = req.body;

    if (!errors.isEmpty()) {
        return res.status(401).json({ message: 'All fields are required', errors: errors.array() });
    }

    if (!first_name || !last_name || !specialization || !email || !phone || !schedule) {
        return res.status(400).json({ message: 'All fields are required.' });
      }
    
    try {
        await db.execute('UPDATE doctors SET first_name = ?, last_name = ?, specialization = ?, email = ?, phone = ?, schedule = ?  WHERE id = ?', [first_name, last_name, specialization, email, phone, schedule, doctorId]);

        return res.status(200).json({ message: 'Doctor updated successfully!'});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating doctor', error: error.message });
    }
}

//DELETE DOCTOR
exports.deleteDoctor = async (req, res) => {
    
    try {
        const  doctorId  = req.params.id;

        const [doctor] = await db.execute(`DELETE FROM doctors WHERE id = ?`, [doctorId]);

        if (doctor.length === 0) {
            return res.status(400).json({ message: 'Doctor not found or deleted already'});
        }
        
        return res.status(200).json({ message: 'Doctor deleted successfully',doctorId: doctorId[0]}); 
       
    } catch (error) {
        console.error(error);
       return res.status(500).json({ message: 'An error occurred while deleting the doctor', error: error.message });
    }
}