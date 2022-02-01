import Restaurant from '../models/Restaurant.js';
import { errorResponse } from '../utils.js';

const getList = (req, res) => {
  const callback = (restaurants) => {
    res.json({ restaurants });
  };

  const { cuisines, all, rating } = req.query;

  if (cuisines)
    return Restaurant.getListByCuisines(JSON.parse(cuisines), res, callback);

  if (rating)
    return Restaurant.getListByRating(parseInt(rating), res, callback);

  if (all) return Restaurant.getList(res, callback);

  Restaurant.getListTop(res, callback);
};

const getById = (req, res) => {
  const restaurantId = parseInt(req.params.restaurantId);

  Restaurant.getById(restaurantId, res, (restaurant) => {
    if (!restaurant.id) {
      return errorResponse(
        res,
        404,
        `Restaurant of id: ${restaurantId} not found`
      );
    }

    res.json({ restaurant });
  });
};

export default { getList, getById };
