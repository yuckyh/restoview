import Model from './Model.js';

export default class Review extends Model {
  static table = 'restoview_cdev_dbav.reviews';
  userId;
  restaurantId;
  content;
  rating;

  constructor(obj) {
    super(obj);
    this.setValues(obj);
  }

  static getListByUser(userId, res, onComplete) {
    this.query(
      'SELECT * FROM ?? WHERE ?',
      [this.table, { userId }],
      this.arrResultCallback(res, onComplete)
    );
  }

  static getListByRestaurant(restaurantId, res, onComplete) {
    this.query(
      'SELECT * FROM ?? WHERE ?',
      [this.table, { restaurantId }],
      this.arrResultCallback(res, onComplete)
    );
  }

  static getRestaurantById(userId, restaurantId, res, onComplete) {
    this.query(
      'SELECT * FROM ?? WHERE ? AND ?',
      [this.table, { userId }, { restaurantId }],
      this.resultCallback(new Review({}), res, onComplete)
    );
  }

  static create(reviewObj, res, onComplete) {
    const review = new Review(reviewObj);
    this.query(
      'INSERT INTO ?? SET ?',
      [this.table, review],
      this.resultCallback(review, res, onComplete)
    );
  }

  static setById(reviewObj, res, onComplete) {
    const review = new Review(reviewObj);

    const { userId, restaurantId } = review;

    this.query(
      'UPDATE ?? SET ? WHERE ? AND ?',
      [this.table, review, { userId }, { restaurantId }],
      this.resultCallback(review, res, onComplete)
    );
  }

  static deleteById(userId, restaurantId, res, onComplete) {
    const review = new Review({ userId, restaurantId });

    this.query(
      'DELETE FROM ?? WHERE ? AND ?',
      [this.table, { userId }, { restaurantId }],
      this.resultCallback(review, res, onComplete)
    );
  }
}
