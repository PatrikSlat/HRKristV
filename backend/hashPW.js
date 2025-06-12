require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const BCRYPT_SALT_ROUNDS = 10; // Broj rundi za bcrypt salt

async function hashPasswordsInTable(connection, tableName, idColumnName, passwordColumnName) {
  console.log(`\n--- Započinjem hashiranje za tablicu: ${tableName} ---`);
  try {
    const query = `SELECT ${idColumnName}, ${passwordColumnName} FROM ${tableName} WHERE LENGTH(${passwordColumnName}) < 60 AND NOT ${passwordColumnName} LIKE '$2a$%' AND NOT ${passwordColumnName} LIKE '$2b$%'`;
    const [users] = await connection.execute(query);

    if (users.length === 0) {
      console.log(`Nema zapisa u tablici "${tableName}" koji odgovaraju kriterijima za hashiranje.`);
      return;
    }

    console.log(`Pronađeno ${users.length} zapisa u tablici "${tableName}" za hashiranje lozinke.`);

    for (const user of users) {
      const userId = user[idColumnName];
      const plainPassword = user[passwordColumnName];

      if (!plainPassword || typeof plainPassword !== 'string' || plainPassword.trim() === '') {
        console.log(`Preskačem zapis ID ${userId} u tablici "${tableName}" jer nema validnu lozinku za hashiranje.`);
        continue;
      }

      try {
        const hashedPassword = await bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);

        await connection.execute(
          `UPDATE ${tableName} SET ${passwordColumnName} = ? WHERE ${idColumnName} = ?`,
          [hashedPassword, userId]
        );
        console.log(`Lozinka za ID ${userId} u tablici "${tableName}" uspješno hashirana i ažurirana.`);
      } catch (hashError) {
        console.error(`Greška pri hashiranju/ažuriranju lozinke za ID ${userId} u tablici "${tableName}":`, hashError);
      }
    }
    console.log(`--- Hashiranje za tablicu ${tableName} završeno ---`);
  } catch (tableError) {
    console.error(`Greška prilikom obrade tablice ${tableName}:`, tableError);
  }
}


async function main() {
  let connection;
  try {
    console.log('Pokušavam se spojiti na bazu podataka...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log('Uspješno spojen na bazu podataka.');
    await hashPasswordsInTable(connection, 'Organizator', 'username_org', 'password');
    await hashPasswordsInTable(connection, 'Administrator', 'usernameAdmin', 'passwordAdmin');

  } catch (error) {
    console.error('Glavna greška u skripti za hashiranje:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nKonekcija na bazu podataka zatvorena.');
    }
  }
}

main();