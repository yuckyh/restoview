import Session from '../models/Session.js';
import { errorResponse } from '../utils.js';

const requireSession = (req, res, next) => {
  if (!req.signedCookies.session) {
    return errorResponse(res, 401, 'Unauthorized');
  }

  next();
};

const validateSession = (req, res, next) => {
  const { session } = req.signedCookies;
  if (!session) {
    res.clearCookie('session');
    return next();
  }

  const { userId, token } = req.signedCookies.session;

  Session.getById(userId, token, res, (session) => {
    if (!session.userId) {
      res.clearCookie('session');
      return errorResponse(res, 403, 'Session invalid, log in again');
    }

    const now = Date.now();

    if (session.expiryDate < now) {
      res.clearCookie('session');
      deleteByUser(req, res);
      return;
    }

    next();
  });
};

const getByCookie = (req, res) => {
  const { session } = req.signedCookies;
  res.json(session);
};

const create = (req, res) => {
  Session.create(req.session, res, (session) => {
    if (!session.id) {
      return errorResponse(res, 400, 'Unable to create session');
    }

    const expires = session.autoExpire !== 0 ? session.expiryDate : undefined;

    res.cookie(
      'session',
      {
        ...session,
        expiryDate: undefined,
        autoExpire: undefined,
        id: undefined,
      },
      { expires, signed: true, httpOnly: true }
    );
    res.json({ session });
  });
};

const deleteByUser = (req, res) => {
  Session.deleteByUser(req.signedCookies.session.userId, res, (session) => {
    res.clearCookie('session').json({ session });
  });
};

export default {
  requireSession,
  validateSession,
  getByCookie,
  create,
  deleteByUser,
};
