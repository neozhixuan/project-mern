import mongodb from "mongodb";
const ObjectId = mongodb.ObjectID;

let restaurants;

export default class RestaurantsDAO {
  // How we initially connect to the database/refer to it
  static async injectDB(conn) {
    if (restaurants) {
      // If it is already filled
      return;
    }
    try {
      // Connect and get specific collection in database
      restaurants = await conn
        .db(process.env.RESTREVIEWS_NS)
        .collection("restaurants");
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in restaurantsDAO: ${e}`
      );
    }
  }
  static async getRestaurants({
    // Options made up for this method
    filters = null,
    page = 0,
    restaurantsPerPage = 20,
  } = {}) {
    // Empty unless someone called this method with filters
    let query;
    // $text means "search for __ anywhere in the text"
    // $eq means "equal"
    if (filters) {
      // Name filter
      // Set up logic in atlas for knowing which field to search for to pass in name
      if ("name" in filters) {
        query = { $text: { $search: filters["name"] } };
        // Cuisine filter (database field)
      } else if ("cuisine" in filters) {
        query = { cuisine: { $eq: filters["cuisine"] } };
        // Zipcode filter (database field)
      } else if ("zipcode" in filters) {
        query = { "address.zipcode": { $eq: filters["zipcode"] } };
      }
    }
    let cursor;
    try {
      // restaurants.find(query) finds all restaurants
      // that match the query
      cursor = await restaurants.find(query);
    } catch (e) {
      // Catch error and return empty fields
      console.error(`Unable to issue find command, ${e}`);
      return { restaurantsList: [], totalNumRestaurants: 0 };
    }

    // Limit the restaurants shown
    // Skip: get the page number
    const displayCursor = cursor
      .limit(restaurantsPerPage)
      .skip(restaurantsPerPage * page);

    try {
      const restaurantsList = await displayCursor.toArray();
      // Get total number of restaurants
      const totalNumRestaurants = await restaurants.countDocuments(query);
      return { restaurantsList, totalNumRestaurants };
    } catch (e) {
      console.error(
        `Unable to convert cursor to array or problem counting documents, ${e}`
      );
      return { restaurantsList: [], totalNumRestaurants: 0 };
    }
  }
  // Get reviews from one collection and put into restaurant
  static async getRestaurantByID(id) {
    try {
      // Aggregation pipelines match collections together
      // It is modeled on concept of data processing pipelines
      // Transforms pipelines into aggregated results
      const pipeline = [
        {
          $match: {
            // ReviewsDAO used objectId for id
            _id: new ObjectId(id),
          },
        },
        {
          // Part of the aggregation pipeline
          $lookup: {
            from: "reviews",
            let: {
              id: "$_id",
            },
            // Create pipeline from reviews collection
            pipeline: [
              {
                // Find all the reviews that match the restaurant id
                $match: {
                  $expr: {
                    $eq: ["$restaurant_id", "$$id"],
                  },
                },
              },
              {
                $sort: {
                  date: -1,
                },
              },
            ],
            as: "reviews",
          },
        },
        {
          // Add a new field
          $addFields: {
            reviews: "$reviews",
          },
        },
      ];
      // Collect everything together and return
      // the next item (restaurant with all reviews connected)
      return await restaurants.aggregate(pipeline).next();
    } catch (e) {
      console.error(`Something went wrong in getRestaurantByID: ${e}`);
      throw e;
    }
  }

  static async getCuisines() {
    let cuisines = [];
    try {
      // Get each distinct cuisine
      cuisines = await restaurants.distinct("cuisine");
      return cuisines;
    } catch (e) {
      console.error(`Unable to get cuisines, ${e}`);
      return cuisines;
    }
  }
}
