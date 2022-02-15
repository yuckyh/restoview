import Restaurant from '../models/Restaurant.js';
import { errorResponse } from '../utils.js';

const getList = (req, res) => {
  const { cuisines, all, sort, search } = req.query;

  const rating = parseInt(req.query.rating);
  const cuisineIds = cuisines && JSON.parse(`[${cuisines}]`);
  Restaurant.getList(
    res,
    cuisineIds,
    all,
    rating,
    sort,
    search,
    (restaurants) => {
      res.json({ restaurants });
    }
  );
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
