import cryptoJs from 'crypto-js';
import encBase64 from 'crypto-js/enc-base64.js';
import { hashPassword } from '../utils.js';
import Model from './Model.js';
import PasswordLink from './PasswordLink.js';

export default class User extends Model {
  static table = 'restoview_cdev_dbav.users';
  id;
  username;
  password;
  salt;
  firstName;
  lastName;
  contactNo;
  email;
  gender;

  constructor(obj) {
    super(obj);
    this.setValues(obj);
  }

  static getDetailsById(id, res, onComplete) {
    this.query(
      'SELECT id, username, first_name, last_name, email, contact_no, gender FROM ?? WHERE ?',
      [this.table, { id }],
      this.resultCallback(new User({}), res, onComplete)
    );
  }

  static getByUsername(username, res, onComplete) {
    this.query(
      'SELECT * FROM ?? WHERE ?',
      [this.table, { username }],
      this.resultCallback(new User({}), res, onComplete)
    );
  }

  static getByEmail(email, res, onComplete) {
    this.query(
      'SELECT * FROM ?? WHERE ?',
      [this.table, { email }],
      this.resultCallback(new User({}), res, onComplete)
    );
  }

  static getByResetLink(link, res, onComplete) {
    this.query(
      'SELECT * FROM ?? WHERE id=(SELECT user_id FROM ?? WHERE ?)',
      [this.table, PasswordLink.table, { link }],
      this.resultCallback(new User({}), res, onComplete)
    );
  }

  static validateCredentials(salt, plainPassword, res, onComplete) {
    const password = hashPassword(salt, plainPassword);

    this.query(
      'SELECT id FROM ?? WHERE ? AND ?',
      [this.table, { salt }, { password }],
      this.resultCallback(new User({}), res, onComplete)
    );
  }

  static create(userObj, res, onComplete) {
    const { password } = new User(userObj);

    const salt = encBase64.stringify(cryptoJs.lib.WordArray.random(512 / 8));

    const hash = hashPassword(salt, password);

    const user = new User({ ...userObj, salt, password: hash });

    this.query(
      'INSERT INTO ?? SET ?',
      [this.table, user],
      this.resultCallback(new User({ ...userObj }), res, onComplete)
    );
  }

  static setDetailsById(id, obj, res, onComplete) {
    const user = new User(obj);

    this.query(
      'UPDATE ?? SET ? WHERE ?',
      [this.table, obj, { id }],
      this.resultCallback(user, res, onComplete)
    );
  }

  static setPasswordById(id, password, res, onComplete) {
    const user = new User({ id });

    this.query(
      'UPDATE ?? SET ? WHERE ?',
      [this.table, { password }, { id }],
      this.resultCallback(user, res, onComplete)
    );
  }

  static deleteById(id, res, onComplete) {
    const user = new User({ id });

    this.query(
      'DELETE FROM ?? WHERE ?',
      [this.table, { id }],
      this.resultCallback(user, res, onComplete)
    );
  }
}
