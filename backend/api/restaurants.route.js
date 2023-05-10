import express from "express";
import RestaurantsController from "./restaurants.controller.js";
import ReviewsController from "./reviews.controller.js";
// This is the route file - the routes people use
const router = express.Router();

// Server.js has defined all routes to start with /api/v1/restaurants
// It will add "/" at the end of it.

// GET request to restaurants database
router.route("/").get(RestaurantsController.apiGetRestaurants);

// Find all reviews for a restaurant
router.route("/id/:id").get(RestaurantsController.apiGetRestaurants);
// Get all cuisines as a list
router.route("/cuisines").get(RestaurantsController.apiGetRestaurantsCuisines);
// GET/POST/UPDATE/DELETE request to reviews database
router
  .route("/")
  .post(ReviewsController.apiPostReview)
  .put(ReviewsController.apiUpdateReview)
  .delete(ReviewsController.apiDeleteReview);

export default router;
