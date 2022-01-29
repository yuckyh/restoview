import cryptoJs from 'crypto-js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';

const errorResponse = (res, status, message) => {
  const err = new HTTPJSONError(status, message);

  console.error(err);

  res.status(status).json({ err });
};

const resolvePath = (fileUrl, ...paths) => {
  return path.join(path.dirname(fileURLToPath(fileUrl)), ...paths);
};

const getCredentials = (credentials) => {
  const encodedCredentials = cryptoJs.enc.Base64.parse(credentials);

  const decodedCredentials = cryptoJs.enc.Utf8.stringify(encodedCredentials);

  return decodedCredentials.split(':');
};

const hashPassword = (salt, password) => {
  return cryptoJs.enc.Base64.stringify(
    cryptoJs.HmacSHA3(salt + password, process.env.AUTH_SECRET)
  );
};

const generateToken = (nBytes) => {
  return cryptoJs.enc.Base64.stringify(cryptoJs.lib.WordArray.random(nBytes));
};

const generateUrlToken = (nBytes) => {
  return cryptoJs.enc.Base64url.stringify(
    cryptoJs.lib.WordArray.random(nBytes)
  );
};

const imageOnlyUpload = (req, file, callback) => {
  const whitelist = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/tiff',
    'image/bmp',
  ];
  if (whitelist.includes(file.mimetype)) {
    req.isFileImage = true;
    return callback(null, true);
  }

  callback(null, false);
};

const uploadImage = (file, req) => {
  if (!req.isFileImage) return;

  if (!req.file) return;

  try {
    fs.writeFileSync(file, req.file.buffer);
  } catch (e) {
    console.error(e);
  }
};

const mailer = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  secure: true,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

class HTTPJSONError extends Error {
  constructor(HTTPCode, message) {
    super(message);
    this.HTTPCode = HTTPCode;
    this.error = message;
  }
}

export {
  resolvePath,
  errorResponse,
  getCredentials,
  hashPassword,
  generateToken,
  generateUrlToken,
  imageOnlyUpload,
  uploadImage,
  mailer,
  HTTPJSONError,
};
