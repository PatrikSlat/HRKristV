require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
const mysql = require("mysql2/promise");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;

// --- DB POOL ---
const pool = mysql.createPool({
  host: process.env.DB_HOST || "ucka.veleri.hr",
  user: process.env.DB_USER || "fkrstic",
  password: process.env.DB_PASSWORD || "11",
  database: process.env.DB_NAME || "fkrstic",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// --- MIDDLEWARE ---
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- SERVE STATIC FRONTEND ---
const frontendPath = path.join(__dirname, "public");
app.use(express.static(frontendPath));
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// --- reCAPTCHA MIDDLEWARE ---
async function verifyRecaptcha(req, res, next) {
  if (process.env.NODE_ENV === "test") return next();

  const recaptchaToken = req.body.recaptchaToken;
  if (!recaptchaToken) return res.status(400).json({ message: "reCAPTCHA nedostaje." });

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    );

    if (!response.data.success) {
      return res.status(403).json({ message: "reCAPTCHA verifikacija nije prošla." });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Greška kod reCAPTCHA.", error: error.message });
  }
}

// --- DB TEST ---
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Uspješno spojeni na bazu!");
    connection.release();
  } catch (error) {
    console.error("Greška spajanja na bazu:", error.stack);
  }
})();

// --- MAIL ---
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: parseInt(process.env.MAILTRAP_PORT || "2525", 10),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

// --- API ROUTES ---
app.get("/api/random/test", async (req, res) => {
  try {
    const response = await axios.get("https://bible-api.com/data/web/random");
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Greška kod citata." });
  }
});

app.get("/api/crkve", async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT ID_crkve, Naziv_crkve, Adresa_crkve, Latitude, Longitude FROM Crkva');
    const crkve = rows.map(c => ({
      id: c.ID_crkve,
      naziv: c.Naziv_crkve,
      adresa: c.Adresa_crkve,
      lat: parseFloat(c.Latitude),
      lng: parseFloat(c.Longitude),
    }));
    res.json(crkve);
  } catch (err) {
    res.status(500).json({ message: 'Greška kod crkvi.', error: err.message });
  }
});

app.post("/api/registracija-zahtjev/organizator", verifyRecaptcha, async (req, res) => {
  const { nazivUdruge, oibUdruge, kontaktOsoba, email, telefon, poruka } = req.body;
  if (!nazivUdruge || !oibUdruge || !kontaktOsoba || !email) {
    return res.status(400).json({ message: "Nedostaju obavezna polja." });
  }

  const emailHtml = `<h1>Novi zahtjev</h1><ul><li><strong>Naziv:</strong> ${nazivUdruge}</li><li><strong>OIB:</strong> ${oibUdruge}</li><li><strong>Kontakt:</strong> ${kontaktOsoba}</li><li><strong>Email:</strong> ${email}</li>${telefon ? `<li><strong>Telefon:</strong> ${telefon}</li>` : ''}${poruka ? `<li><strong>Poruka:</strong> ${poruka}</li>` : ''}</ul>`;

  try {
    await transporter.sendMail({
      from: '"HRKrist" <prijave@hrkrist.hr>',
      to: "HRKrist.helpdesk@gmail.com",
      subject: `Prijava: ${nazivUdruge}`,
      html: emailHtml,
    });
    res.status(200).json({ message: "Zahtjev poslan." });
  } catch (error) {
    res.status(500).json({ message: "Greška kod slanja emaila." });
  }
});

app.post("/api/auth/login/organizator", verifyRecaptcha, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Nedostaju podaci." });

  try {
    const [rows] = await pool.query(
      'SELECT username_org, password, naziv_udruge FROM Organizator WHERE username_org = ?',
      [username]
    );

    if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ message: "Neispravno korisničko ime ili lozinka." });
    }

    const payload = {
      user: {
        id: rows[0].username_org,
        username: rows[0].username_org,
        role: "organizator",
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" }, (err, token) => {
      if (err) return res.status(500).json({ message: "Greška s tokenom." });

      res.json({
        message: "Prijava uspješna!",
        token,
        user: {
          username: rows[0].username_org,
          nazivUdruge: rows[0].naziv_udruge,
          role: "organizator",
        },
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Greška kod prijave." });
  }
});

// --- JWT MIDDLEWARE ---
function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Nema tokena." });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Neispravan token." });
    req.user = decoded.user;
    next();
  });
}

// --- DOGAĐAJI ---
app.post("/api/dogadaji", verifyToken, async (req, res) => {
  const { opis, lokacija, naziv_dogadaja } = req.body;
  const username_org = req.user.username;

  try {
    const [rows] = await pool.query('SELECT email FROM Organizator WHERE username_org = ?', [username_org]);
    const kontakt = rows[0]?.email || "";

    if (!opis || !lokacija || !naziv_dogadaja) {
      return res.status(400).json({ message: "Nedostaju podaci." });
    }

    const [result] = await pool.query(
      `INSERT INTO Dogadaj (username_org, opis, lokacija, kontakt, naziv_dogadaja)
       VALUES (?, ?, ?, ?, ?)`,
      [username_org, opis, lokacija, kontakt, naziv_dogadaja]
    );

    res.status(201).json({ message: "Događaj dodan!", ID_dogadaja: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Greška kod upisa događaja." });
  }
});

app.get("/api/dogadaji", async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT ID_dogadaja, username_org, opis, lokacija, kontakt, naziv_dogadaja FROM Dogadaj');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Greška kod dohvaćanja događaja." });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server sluša na portu ${PORT}`);
});
