require("dotenv").config(); 

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mysql = require("mysql2/promise");
const nodemailer = require('nodemailer');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Kod za spajanje na bazu
const pool = mysql.createPool({
  host: process.env.DB_HOST || "ucka.veleri.hr",
  user: process.env.DB_USER || "fkrstic",
  password: process.env.DB_PASSWORD || "11", 
  database: process.env.DB_NAME || "fkrstic",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


async function checkDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Uspješno spojeni na bazu podataka (Učka)!");
    connection.release();
  } catch (error) {
    console.error("Greška prilikom spajanja na bazu podataka:", error.stack);
  }
}
checkDbConnection(); 

// NodeMailer -> (https://www.youtube.com/watch?v=Wa9KDiB7C_I)
const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: parseInt(process.env.MAILTRAP_PORT || "2525", 10),
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS 
    },
});


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


//RUTA ZA REGISTRACIJU ORGANIZATORA 
app.post("/api/registracija-zahtjev/organizator", async (req, res) => {
  console.log("Primljen zahtjev za registraciju organizatora:", req.body);
  const { nazivUdruge, oibUdruge, kontaktOsoba, email, telefon, poruka } = req.body;
  if (!nazivUdruge || !oibUdruge || !kontaktOsoba || !email) {
    return res.status(400).json({ message: "Molimo ispunite sva obavezna polja (Naziv udruge, OIB, Kontakt osoba, Email)." });
  }

  //MAIL PRIKAZ...
  const emailHtml = `
    <h1>Novi zahtjev za registraciju organizatora</h1>
    <ul>
      <li><strong>Naziv udruge/organizacije:</strong> ${nazivUdruge}</li>
      <li><strong>OIB udruge:</strong> ${oibUdruge}</li>
      <li><strong>Kontakt osoba:</strong> ${kontaktOsoba}</li>
      <li><strong>Email:</strong> ${email}</li>
      ${telefon ? `<li><strong>Telefon:</strong> ${telefon}</li>` : ''}
      ${poruka ? `<li><strong>Poruka:</strong> ${poruka}</li>` : ''}
    </ul>
    <p>Molimo Admina da odradi svoj posao !</p>
  `;

  const mailOptions = {
    from: '"HRKrist Prijave" <prijave@hrkrist.hr>', 
    to: "HRKrist.helpdesk@gmail.com", // zamjenit s onim iz disca
    subject: `Nova prijava organizatora: ${nazivUdruge}`,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email s prijavom za "${nazivUdruge}" poslan na ${mailOptions.to}`);
    res.status(200).json({ message: "Vaš zahtjev za registraciju je uspješno poslan. Kontaktirat ćemo vas uskoro." });
  } catch (error) {
    console.error("Greška prilikom slanja emaila s prijavom:", error);
    res.status(500).json({ message: "Došlo je do greške prilikom slanja vaše prijave. Molimo pokušajte ponovno kasnije." });
  }
});

// LOGIN RUTA ZA ORGANIZATORA 
// LOGIN RUTA ZA ORGANIZATORA 
// LOGIN RUTA ZA ORGANIZATORA 
// LOGIN RUTA ZA ORGANIZATORA 
app.post("/api/auth/login/organizator", async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Korisničko ime i lozinka su obavezni." });
    }
  
    try {
      const [rows] = await pool.query(
        'SELECT username_org, password, naziv_udruge FROM Organizator WHERE username_org = ?',
        [username]
      );
  
      if (rows.length === 0) {
        return res.status(401).json({ message: "Neispravno korisničko ime ili lozinka." });
      }
  
      const organizator = rows[0];
      const isMatch = await bcrypt.compare(password, organizator.password);
  
      if (!isMatch) {
        return res.status(401).json({ message: "Neispravno korisničko ime ili lozinka." });
      }
      const payload = {
        user: {
          id: organizator.username_org,
          username: organizator.username_org,
          role: 'organizator'
        }
      };
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '2h' }, 
        (err, token) => {
          if (err) {
              console.error('Greška pri potpisivanju JWT tokena:', err);
              return res.status(500).json({ message: "Greška prilikom generiranja tokena." });
          }
          res.json({
            message: "Prijava uspješna!",
            token: token,
            user: { 
              username: organizator.username_org,
              nazivUdruge: organizator.naziv_udruge,
              role: 'organizator'
            }
          });
        }
      );
  
    } catch (err) {
      console.error('Greška servera kod prijave organizatora:', err.stack);
      res.status(500).json({ message: "Greška na serveru prilikom prijave." });
    }
  });


// JWT OSIGURANJE RUTE
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
  
    if (!token) {
      return res.status(401).json({ message: 'Nedostaje token za autorizaciju.' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Neispravan ili istekao token.' });
      }
      req.user = decoded.user; 
      next();
    });
  }
  
  // Zaštićena ruta za unos 
  app.post("/api/dogadaji", verifyToken, async (req, res) => {
    const { opis, lokacija, naziv_dogadaja } = req.body;
    const username_org = req.user.username;
    let kontakt = '';
    try {
      const [rows] = await pool.query(
        'SELECT email FROM Organizator WHERE username_org = ?',
        [username_org]
      );
      if (rows.length > 0) {
        kontakt = rows[0].email;
      }
    } catch (e) {
      kontakt = '';
    }
  
    if (!username_org || !opis || !lokacija || !naziv_dogadaja) {
      return res.status(400).json({ message: "Sva polja osim slike su obavezna!" });
    }
  
    try {
      const [result] = await pool.query(
        `INSERT INTO Dogadaj (username_org, opis, lokacija, kontakt, naziv_dogadaja)
         VALUES (?, ?, ?, ?, ?)`,
        [username_org, opis, lokacija, kontakt, naziv_dogadaja]
      );
  
      res.status(201).json({ 
        message: "Događaj je uspješno dodan!",
        ID_dogadaja: result.insertId 
      });
    } catch (error) {
      console.error("Greška kod dodavanja događaja:", error);
      res.status(500).json({ message: "Greška na serveru kod upisa događaja." });
    }
  });

  //POVLACENJE DOGADAJA IZ BAZE
  app.get('/api/dogadaji', async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT ID_dogadaja, username_org, opis, lokacija, kontakt, naziv_dogadaja FROM Dogadaj'
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: "Greška kod dohvaćanja događaja." });
    }
  });
  

// Pokretanje servera
app.listen(PORT, async () => {
  console.log(`Server sluša na http://localhost:${PORT}`);
});