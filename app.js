import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser(process.env.SIGNED_COOKIE_SECRET));
app.use(
  express.static('./public', {
    extensions: ['html'],
  })
);
app.use('/storage', express.static('./storage'));

export default app;
