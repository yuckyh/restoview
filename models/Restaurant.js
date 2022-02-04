import Cuisine from './Cuisine.js';
import Model from './Model.js';
import mysql from 'mysql';

export default class Restaurant extends Model {
  static table = 'restoview_cdev_dbav.restaurants';
  static hasCuisines = 'restoview_cdev_dbav.restaurants_has_cuisines';
  id;
  name;
  description;
  address;
  openDays;
  openTime;
  closeTime;
  rating;
  location;
  cuisines;
  cuisinesList;

  constructor(obj) {
    super(obj);
    this.setValues(obj);
  }

  parse() {
    delete this.cuisineName;
    delete this.restaurantId;
    delete this.cuisineId;
    this.cuisinesList = this.cuisines?.split(',');
  }

  static getList(res, cuisineIds, all, rating, sort, search, onComplete) {
    const cuisineIdsSubquery =
      cuisineIds &&
      mysql.format(
        'restaurant_id IN(SELECT restaurant_id FROM ?? WHERE cuisine_id IN (?))',
        [this.hasCuisines, cuisineIds]
      );
    const nameSubquery =
      search && mysql.format('r.`name` LIKE ?', [`%${search}%`]);

    const allSubquery = all ? '' : 'LIMIT 12';

    const sortSubqueryArr = [
      sort && `rating ${sort}`,
      nameSubquery && `r.\`name\` LIKE '${search}%' ${sort}`,
    ]
      .filter((val) => val)
      .join(', ');

    const sortSubquery = sortSubqueryArr && `ORDER BY ${sortSubqueryArr}`;

    const whereSubquery = [cuisineIdsSubquery, nameSubquery]
      .filter((val) => val)
      .map((query) => `AND ${query}`)
      .join('');

    this.query(
      `SELECT r.*, GROUP_CONCAT(c.\`name\` SEPARATOR ', ') AS cuisines FROM ?? AS r LEFT JOIN ?? AS rhc ON r.id=restaurant_id LEFT JOIN ?? AS c ON c.id=cuisine_id WHERE rating >= ? ${whereSubquery} GROUP BY r.id ${sortSubquery} ${allSubquery}`,
      [this.table, this.hasCuisines, Cuisine.table, rating || 0],
      this.arrResultCallback(res, onComplete)
    );
  }

  static getById(id, res, onComplete) {
    this.query(
      "SELECT r.*, GROUP_CONCAT(c.`name` SEPARATOR ', ') AS cuisines FROM ?? AS r LEFT JOIN ?? AS rhc ON r.id=restaurant_id LEFT JOIN ?? AS c ON c.id=cuisine_id WHERE r.? GROUP BY r.id",
      [this.table, this.hasCuisines, Cuisine.table, { id }],
      this.resultCallback(new Restaurant({}), res, onComplete)
    );
  }
}
