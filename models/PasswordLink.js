import { generateUrlToken, mailer } from '../utils.js';
import Model from './Model.js';

export default class PasswordLink extends Model {
  static table = 'restoview_cdev_dbav.password_reset_links';
  userId;
  link;
	expiryDate;

  constructor(obj) {
    super(obj);
    this.setValues(obj);
  }

  static async create(userId, email, res, onComplete) {
    const link = generateUrlToken(64 / 8);

    const expiryDate = new Date(Date.now() + 1 * 30 * 60 * 1000);

    await mailer.sendMail({
      from: 'RestoView Bot <noreply@restoview.com>',
      to: email,
      subject: 'Password Reset Email',
      html: `Trouble signing in?<br><br>Resetting your password is easy.<br><br>Just press the button below and follow the instructions. The link will expire in 30 minutes.<br><br><a href="http://localhost/reset-password/${link}">Reset Password</a><br><br>If you can't click on the link above, you can copy the link below to reset your password.<br><br>http://localhost/reset-password/${link}<br><br>If you did not make this request then please ignore this email.`,
    });

    const passwordLink = new PasswordLink({ userId, link, expiryDate });

    this.query(
      'INSERT INTO ?? SET ? ON DUPLICATE KEY UPDATE ?',
      [this.table, passwordLink, passwordLink],
      this.resultCallback(passwordLink, res, onComplete)
    );
  }

  static deleteById(userId, res, onComplete) {
    const passwordLink = new PasswordLink({ userId });

    this.query(
      'DELETE FROM ?? WHERE ?',
      [this.table, { userId }],
      this.resultCallback(passwordLink, res, onComplete)
    );
  }
}
