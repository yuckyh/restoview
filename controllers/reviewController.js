import Review from '../models/Review.js';
import { errorResponse } from '../utils.js';

const getListByRestaurant = (req, res) => {
  const restaurantId = parseInt(req.params.restaurantId);

  Review.getListByRestaurant(restaurantId, res, (reviews) => {
    res.json({ reviews });
  });
};

const getListByUser = (req, res) => {
  const { userId } = req.signedCookies.session;

  Review.getListByUser(userId, res, (reviews) => {
    res.json({ reviews });
  });
};

const getById = (req, res) => {
  const userId = parseInt(req.params.userId);
  const restaurantId = parseInt(req.params.restaurantId);

  Review.getRestaurantById(userId, restaurantId, res, (review) => {
    if (!review.userId || !review.restaurantId) {
      return errorResponse(
        res,
        404,
        `Review of restaurantId: ${restaurantId} and userId: ${userId} not found`
      );
    }

    res.json({ review });
  });
};

const create = (req, res) => {
  const { userId } = req.signedCookies.session;
  const restaurantId = parseInt(req.params.restaurantId);

  const review = new Review({ ...req.body, restaurantId, userId });

  Review.create(review, res, (review) => {
    res.json({ review });
  });
};

const setById = (req, res) => {
  const { userId } = req.signedCookies.session;
  const restaurantId = parseInt(req.params.restaurantId);

  const review = { ...req.body, userId, restaurantId };

  Review.setById(review, res, (review) => {
    res.json({ review });
  });
};

const deleteById = (req, res) => {
  const { userId } = req.signedCookies.session;
  const restaurantId = parseInt(req.params.restaurantId);

  Review.deleteById(userId, restaurantId, res, (review) => {
    res.json({ review });
  });
};

export default {
  getListByRestaurant,
  getListByUser,
  getById,
  create,
  setById,
  deleteById,
};
