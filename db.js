import { createConnection } from 'mysql';

const db = createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

db.connect((e) => {
  if (e) {
    console.error(e);
    return;
  }
  console.log('DB Connected');
});

export default db;
