import PasswordLink from '../models/PasswordLink.js';

const create = (req, res) => {
  const { id, email } = req.user;

  PasswordLink.create(id, email, res, (passwordLink) => {
    res.json({ passwordLink });
  });
};

const deleteById = (req, res, next) => {
  PasswordLink.deleteById(req.user.id, res, (passwordLink) => {
    next();
  });
};

export default { create, deleteById };
