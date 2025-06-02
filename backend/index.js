require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mysql = require("mysql2/promise"); // Korištenje promise verzije mysql2
import nodemailer from 'nodemailer';
const app = express();
const PORT = process.env.PORT || 3000;


const pool = mysql.createPool({
  host: "ucka.veleri.hr",
  user: "fkrstic",
  password: "11",
  database: "fkrstic",
});

// Middleware
app.use(cors({ origin: "*" })); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


async function checkDbConnection() {
  try {
    const connection = await pool.getConnection(); //
    console.log("Uspješno spojeni na Učku !");
    connection.release(); 
  } catch (error) {
    console.error("Greška prilikom spajanja na bazu podataka:", error.stack);
  }
}
checkDbConnection();

// Nodemailer -> (https://mailtrap.io/blog/send-emails-with-nodejs/?utm_source=youtube&utm_medium=referral&utm_campaign=mailtrap&utm_content=sendwithnodejs)
// Import the Nodemailer library
const nodemailer = require('nodemailer');

// Create a transporter object
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "2ba1d15de32205",
      pass: "6631a97419fbc2"
    }
});

// Configure the mailoptions object
const mailOptions = {
  from: 'HRKrist.prijava@email.com',
  to: 'HRKrist.helpdesk@gmail.com',
  subject: 'Prijava organizatora',
  text: 'test'
};

// Send the email
transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});


// --- RUTE ---

// QOUTES API
app.get("/api/random/test", async (req, res) => {
  try {
    const response = await axios.get("https://bible-api.com/data/web/random");
    res.json(response.data);
    console.log("Netko dohvaća citat!");
  } catch (error) {
    console.error("Greška prilikom dohvaćanja citata!", error.message);
    res.status(500).json({ message: "Greška prilikom dohvaćanja citata!" });
  }
});

// CRKVE API
app.get("/api/crkve", async (req, res) => {
  try {
    const [rows, fields] = await pool.query(
      'SELECT ID_crkve, Naziv_crkve, Adresa_crkve, Latitude, Longitude FROM Crkva'
    );
    

    const crkve = rows.map(crkva => ({
      id: crkva.ID_crkve,
      naziv: crkva.Naziv_crkve,
      adresa: crkva.Adresa_crkve,
      lat: parseFloat(crkva.Latitude),
      lng: parseFloat(crkva.Longitude)
    }));
    res.json(crkve);
    console.log("Dohvaćeni podaci o crkvama.");
  } catch (err) {
    console.error('Greška pri dohvaćanju crkvi:', err.stack);
    res.status(500).json({ message: 'Greška na serveru prilikom dohvaćanja podataka o crkvama.', error: err.message });
  }
});


// Pokretanje servera
app.listen(PORT, () => {
  console.log(`Server sluša na http://localhost:${PORT}`);
});