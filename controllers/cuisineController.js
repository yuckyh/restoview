import Cuisine from '../models/Cuisine.js';

const getList = (req, res) => {
  Cuisine.getList(res, (cuisines) => {
    res.json(cuisines);
  });
};

export default { getList };
