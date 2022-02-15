import { createConnection } from 'mysql2';
// import pg from 'pg';

const initDB = async () => {
  let db;

  // if (process.env.DATABASE_URL) {
  //   console.log(process.env.DATABASE_URL);
  //   db = new pg.Client({
  //     connectionString: process.env.DATABASE_URL,
  //     ssl: {
  //       rejectUnauthorized: false,
  //     },
  //   });

  //   await db.connect();

  //   db.query;

  //   return db;
  // }

  db = createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });

  db.connect((e) => {
    if (e) return console.error(e);
    console.log('DB Connected');
  });

  return db;
};

const db = await initDB();

export default db;
