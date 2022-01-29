import fs from 'fs';
import User from '../models/User.js';
import {
  generateToken,
  getCredentials,
  errorResponse,
  hashPassword,
  uploadImage,
  resolvePath,
} from '../utils.js';
import passwordLinkController from './passwordLinkController.js';

const getDetailsById = (req, res) => {
  User.getDetailsById(req.params.userId, res, (user) => {
    if (!user.id)
      return errorResponse(res, 404, 'User with specified id not found');

    res.json({ user });
  });
};

const getDetailsBySession = (req, res) => {
  User.getDetailsById(req.signedCookies.session.userId, res, (user) => {
    if (!user.id)
      return errorResponse(res, 404, 'User with specified id not found');

    res.json({ user });
  });
};

const getByUsername = (req, res, next) => {
  const authHeader = req.header('authorization');

  if (!authHeader) {
    return errorResponse(res, 400, 'No credentials found for authentication');
  }

  const credentials = authHeader.split(' ')[1];

  const username = getCredentials(credentials)[0];

  User.getByUsername(username, res, (user) => {
    if (!user.id) {
      return errorResponse(res, 404, 'User with specified username not found');
    }

    req.user = user;
    next();
  });
};

const getByEmail = (req, res, next) => {
  const { email } = req.body;

  User.getByEmail(email, res, (user) => {
    if (!user.id) {
      return errorResponse(res, 404, 'User with specified email not found');
    }

    req.user = user;
    next();
  });
};

const getByResetLink = (req, res, next) => {
  const link = req.params.resetLink;

  User.getByResetLink(link, res, (user) => {
    if (!user.id) {
      return errorResponse(res, 404, 'Invalid password reset link');
    }

    req.user = user;
    next();
  });
};

const validateCredentials = (req, res, next) => {
  if (req.signedCookies.session)
    return errorResponse(res, 400, 'You are already logged in');

  const authHeader = req.header('authorization');

  if (!authHeader) {
    return errorResponse(res, 401, 'No credentials found for authentication');
  }

  const credentials = authHeader.split(' ')[1];

  const password = getCredentials(credentials)[1];

  User.validateCredentials(req.user.salt, password, res, (user) => {
    const userId = user?.id;

    if (!userId) {
      return errorResponse(res, 403, 'Authentication Failed');
    }

    const autoExpire = parseInt(req.query.rememberMe) || 1;

    const token = generateToken(128 / 8);

    req.session = { userId, token, autoExpire };

    next();
  });
};

const create = (req, res, next) => {
  const user = new User({ ...req.body });

  const { username, password } = user;

  if (username.length < 3)
    return errorResponse(res, 400, 'Minimum 3 characters username');

  if (username.length > 40)
    return errorResponse(res, 400, 'Maximum 40 characters username');

  if (password.length < 8)
    return errorResponse(res, 400, 'Minimum 8 characters password');

  User.create(user, res, (user) => {
    const file = resolvePath(
      import.meta.url,
      `../storage/img/user/${user.id}.jpg`
    );

    uploadImage(file, req);

    const autoExpire = 1;

    const token = generateToken(128 / 8);

    const userId = user.id;

    req.session = { userId, token, autoExpire };

    next();
  });
};

const setDetailsById = (req, res) => {
  const id = req.signedCookies.session.userId;

  User.setDetailsById(id, req.body, res, (user) => {
    const file = resolvePath(import.meta.url, `../storage/img/user/${id}.jpg`);

    uploadImage(file, req);

    res.json({ user });
  });
};

const setPasswordById = (req, res, next) => {
  const { id, salt, password } = req.user;

  const plainPassword = req.body.password;

  const hash = hashPassword(salt, plainPassword);

  if (password === hash) {
    return errorResponse(
      res,
      400,
      'Please use a different password to reset your account'
    );
  }

  User.setPasswordById(id, hash, res, (user) => {
    passwordLinkController.deleteById(req, res, next);

    res.json({ user });
  });
};

const deleteById = (req, res) => {
  const id = req.signedCookies.session.userId;

  const file = resolvePath(import.meta.url, `../storage/img/user/${id}.jpg`);

  try {
    fs.unlinkSync(file);
  } catch (e) {
    console.error(e);
  }

  User.deleteById(id, res, (user) => {
    res.clearCookie('session').json({ user });
  });
};

export default {
  getDetailsById,
  getDetailsBySession,
  getByUsername,
  getByEmail,
  getByResetLink,
  validateCredentials,
  create,
  setDetailsById,
  setPasswordById,
  deleteById,
};
