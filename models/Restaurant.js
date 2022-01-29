import Cuisine from './Cuisine.js';
import Model from './Model.js';

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

  static getList(res, onComplete) {
    this.query(
      'SELECT *,group_concat(cuisine_name) AS cuisines FROM ?? AS r INNER JOIN ?? AS rhc ON r.id=restaurant_id INNER JOIN (SELECT id AS cuisine_id, `name` AS cuisine_name FROM ??) AS c ON c.cuisine_id=rhc.cuisine_id GROUP BY restaurant_id',
      [this.table, this.hasCuisines, Cuisine.table],
      this.arrResultCallback(res, onComplete)
    );
  }

  static getListTop(res, onComplete) {
    this.query(
      'SELECT *,group_concat(cuisine_name) AS cuisines FROM ?? AS r INNER JOIN ?? AS rhc ON r.id=restaurant_id INNER JOIN (SELECT id AS cuisine_id, `name` AS cuisine_name FROM ??) AS c ON c.cuisine_id=rhc.cuisine_id GROUP BY restaurant_id ORDER BY rating DESC LIMIT 12',
      [this.table, this.hasCuisines, Cuisine.table],
      this.arrResultCallback(res, onComplete)
    );
  }

  static getListByCuisines(cuisineIds, res, onComplete) {
    this.query(
      'SELECT *, group_concat(cuisine_name) AS cuisines FROM ?? AS r INNER JOIN ?? AS rhc ON r.id=restaurant_id INNER JOIN (SELECT id AS cuisine_id, `name` AS cuisine_name FROM ??) AS c ON c.cuisine_id=rhc.cuisine_id WHERE restaurant_id IN(SELECT restaurant_id FROM ?? WHERE cuisine_id IN (?)) GROUP BY restaurant_id',
      [
        this.table,
        this.hasCuisines,
        Cuisine.table,
        this.hasCuisines,
        cuisineIds,
      ],
      this.arrResultCallback(res, onComplete)
    );
  }

  static getListByRating(rating, res, onComplete) {
    this.query(
      'SELECT *,group_concat(cuisine_name) AS cuisines FROM ?? AS r INNER JOIN ?? AS rhc ON r.id=restaurant_id INNER JOIN (SELECT id AS cuisine_id, `name` AS cuisine_name FROM ??) AS c ON c.cuisine_id=rhc.cuisine_id WHERE rating >= ? GROUP BY restaurant_id ORDER BY rating DESC',
      [this.table, this.hasCuisines, Cuisine.table, rating],
      this.arrResultCallback(res, onComplete)
    );
  }

  static getById(id, res, onComplete) {
    this.query(
      'SELECT *,group_concat(cuisine_name) AS cuisines FROM ?? AS r INNER JOIN ?? AS rhc ON r.id=restaurant_id INNER JOIN (SELECT id AS cuisine_id, `name` AS cuisine_name FROM ??) AS c ON c.cuisine_id=rhc.cuisine_id WHERE ? GROUP BY restaurant_id',
      [this.table, this.hasCuisines, Cuisine.table, { id }],
      this.resultCallback(new Restaurant({}), res, onComplete)
    );
  }
}
