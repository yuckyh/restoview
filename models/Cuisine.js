import Model from './Model.js';

export default class Cuisine extends Model {
  static table = 'restoview_cdev_dbav.cuisines';
  id;
  name;

  constructor(obj) {
    super(obj);
    this.setValues(obj);
  }

  static getList(res, onComplete) {
    this.query(
      'SELECT * FROM ??',
      [this.table],
      this.arrResultCallback(res, onComplete)
    );
  }
}
