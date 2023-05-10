import mongodb from "mongodb";
const ObjectId = mongodb.ObjectID;

let reviews;

export default class ReviewsDAO {
  static async injectDB(conn) {
    // Check if reviews exist already
    if (reviews) {
      return;
    }
    try {
      // Fetch info from the database
      // MongoDB is good because if it doesnt already exist, the collection will be created
      reviews = await conn.db(process.env.RESTREVIEWS_NS).collection("reviews");
    } catch (e) {
      console.error(`Unable to establish collection handles in userDAO: ${e}`);
    }
  }

  static async addReview(restaurantId, user, review, date) {
    try {
      // Create review doc
      const reviewDoc = {
        name: user.name,
        user_id: user._id,
        date: date,
        text: review,
        // MongoDB object id
        restaurant_id: ObjectId(restaurantId),
      };
      //   Insert the review doc into the database
      return await reviews.insertOne(reviewDoc);
    } catch (e) {
      console.error(`Unable to post review: ${e}`);
      return { error: e };
    }
  }

  static async updateReview(reviewId, userId, text, date) {
    try {
      const updateResponse = await reviews.updateOne(
        // Look for review with correct user and review ID
        { user_id: userId, _id: ObjectId(reviewId) },
        // Set the new text and date
        { $set: { text: text, date: date } }
      );

      return updateResponse;
    } catch (e) {
      console.error(`Unable to update review: ${e}`);
      return { error: e };
    }
  }

  static async deleteReview(reviewId, userId) {
    try {
      const deleteResponse = await reviews.deleteOne({
        // Look for review with this id and userID
        _id: ObjectId(reviewId),
        user_id: userId,
      });

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to delete review: ${e}`);
      return { error: e };
    }
  }
}
