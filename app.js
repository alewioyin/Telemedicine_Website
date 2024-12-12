const express = require('express');
const db = require('./config/database')
const bodyParser = require('body-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const dotenv = require('dotenv');
const path = require('path');

//SET UP ENV ENVIRONMENT
dotenv.config();

//INITIALIZE APP
const app = express();

// SET UP MIDDLEWARE
app.use(express.static("index.html"));
app.use(express.static("views"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:  true}));

//CONFIGURE SESSION STORE
const sessionStore = new MySQLStore({}, db);

//CONFIGURE SESSION MIDDLEWARE
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));

//LANDING PAGE
    app.get('/', (req, res) =>{
        res.sendFile(path.join(__dirname, 'index.html'))
    })


//DEFINE ROUTES
app.use('/telemedicine/api/patients', require('./routes/patientRoutes'));
app.use('/telemedicine/api/doctors', require('./routes/doctorRoutes'));
/* app.use('/telemedicine/api/appointments', require('./routes/appointmentRoutes')); */
app.use('/telemedicine/api/admin', require('./routes/adminRoutes'));


//CRUD OPERATIONS
//Create patient table
app.get('/createPatientsTable', (req, res) => {
    const patients = ` CREATE TABLE patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        date_of_birth DATE,
        gender ENUM('Male', 'Female', 'Other'),
        address VARCHAR(255)
    )`
    db.query(patients, (error) => {
        if (error) {
            console.error('Error creating patients table', error)
            return res.status(500).send('Error creating patients table')
        }
        res.status(201).send('Patients table created successfully');
    })
});

//CREATE DOCTORS TABLE
app.get('/createDoctorsTable', (req, res) => {
    const doctors = `  CREATE TABLE doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        specialization VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        phone VARCHAR(15),
        schedule TEXT
    )`

    db.query(doctors, (err) => {
        if (err) {
            console.error('Error creating doctors table:', err);
            return res.status(500).send('Error creating doctors table')
        }

        res.status(200).send('Doctors table created successfully.')
    })
});

//CREATE APPOINTMENT TABLE
app.get('/createaAppointmentTable', (req, res) => {
    const appointments = `  CREATE TABLE appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        doctor_id INT,
        appointment_date DATE,
        appointment_time TIME,
        status ENUM('scheduled', 'completed', 'canceled'),
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    )`

    db.query(appointments, (err) => {
        if (err) {
            console.log('Error creating appointments table:', err);
            return res.status(500).send('Error creating appointments table')
        }

        res.status(200).send('Appointments table created successfully.')
    })
});

//CREATE ADMIN TABLE
app.get('/createAdminTable', (req, res) => {
    const admin = `  CREATE TABLE admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin') DEFAULT 'admin'
    )`

    db.query(admin, (err) => {
        if (err) {
            console.log('Error creating admin table:', err);
            return res.status(500).send('Error creating admin table')
        }

        res.status(200).send('Admin table created successfully.')
    })
});

//LAUNCH SERVER
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})