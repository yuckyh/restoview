import { Router } from 'express';
import multer from 'multer';
import app from './app.js';
import cuisineController from './controllers/cuisineController.js';
import passwordLinkController from './controllers/passwordLinkController.js';
import restaurantController from './controllers/restaurantController.js';
import reviewController from './controllers/reviewController.js';
import sessionController from './controllers/sessionController.js';
import userController from './controllers/userController.js';
import viewController from './controllers/viewController.js';
import { imageOnlyUpload } from './utils.js';

const authRouter = Router();
const openRouter = Router();

const imageUpload = multer({
  fileFilter: imageOnlyUpload,
});

openRouter.use(sessionController.validateSession);
authRouter.use(
  sessionController.validateSession,
  sessionController.requireSession
);

openRouter.route('/cuisines').get(cuisineController.getList);

openRouter.route('/restaurants').get(restaurantController.getList);
openRouter.route('/restaurant/:restaurantId').get(restaurantController.getById);

openRouter
  .route('/restaurant/:restaurantId/reviews')
  .get(reviewController.getListByRestaurant);
authRouter.route('/dashboard/reviews').get(reviewController.getListByUser);
openRouter
  .route('/restaurant/:restaurantId/review/user/:userId')
  .get(reviewController.getById);
authRouter
  .route('/restaurant/:restaurantId/review')
  .post(reviewController.create)
  .put(reviewController.setById)
  .delete(reviewController.deleteById);

openRouter
  .route('/login')
  .post(
    userController.getByUsername,
    userController.validateCredentials,
    sessionController.create
  );
authRouter.route('/logout').delete(sessionController.deleteByUser);
openRouter
  .route('/register')
  .post(
    imageUpload.single('profilePic'),
    userController.create,
    sessionController.create
  );
openRouter.route('/user/:userId').get(userController.getDetailsById);

// authRouter.route('/session').get(sessionController.getByCookie);
authRouter
  .route('/dashboard')
  .get(userController.getDetailsBySession)
  .patch(imageUpload.single('profilePic'), userController.setDetailsById)
  .delete(userController.deleteById);
openRouter
  .route('/reset-password')
  .post(userController.getByEmail, passwordLinkController.create);
openRouter
  .route('/reset-password/:resetLink')
  .patch(userController.getByResetLink, userController.setPasswordById);

app.route('/restaurant/:restaurantId').get(viewController.restaurants);

app.use('/api', openRouter);
app.use('/api', authRouter);

export default { openRouter, authRouter };
