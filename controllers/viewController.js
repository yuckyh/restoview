import fs from 'fs';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import { errorResponse } from '../utils.js';

const restaurants = (req, res) => {
  const { restaurantId } = req.params;
  Restaurant.getById(restaurantId, res, (restaurant) => {
    if (!restaurant.id) {
      return errorResponse(
        res,
        404,
        `Restaurant of id: ${restaurantId} not found`,
        true
      );
    }

    const html = fs.readFileSync('./public/restaurant.html').toString('utf-8');

    res.set('Content-Type', 'text/html').end(html);
  });
};

const resetPassword = (req, res) => {
  const { resetLink } = req.params;
  User.getByResetLink(resetLink, res, (user) => {
    console.log(user);
    if (!user.id) {
      return errorResponse(res, 404, 'Invalid password reset link', true);
    }

    const html = fs
      .readFileSync('./public/update-password.html')
      .toString('utf-8');

    res.set('Content-Type', 'text/html').end(html);
  });
};

export default { restaurants, resetPassword };
