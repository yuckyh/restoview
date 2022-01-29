import Model from './Model.js';

export default class Session extends Model {
  static table = 'restoview_cdev_dbav.sessions';
  id;
  userId;
  token;
  autoExpire;
  expiryDate;

  constructor(obj) {
    super(obj);
    this.setValues(obj);
  }

  static getById(userId, token, res, onComplete) {
    this.query(
      'SELECT * FROM ?? WHERE ? AND ?',
      [this.table, { userId }, { token }],
      this.resultCallback(new Session({}), res, onComplete)
    );
  }

  static create(sessionObj, res, onComplete) {
    const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const session = new Session({ ...sessionObj, expiryDate });

    this.query(
      'INSERT INTO ?? SET ?',
      [this.table, session],
      this.resultCallback(session, res, onComplete)
    );
  }

  static deleteByUser(userId, res, onComplete) {
    const session = new Session({ userId });

    this.query(
      'DELETE FROM ?? WHERE ?',
      [this.table, { userId }],
      this.resultCallback(session, res, onComplete)
    );
  }
}
