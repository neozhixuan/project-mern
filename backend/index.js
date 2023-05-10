import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
import RestaurantsDAO from "./dao/restaurantsDAO.js";

dotenv.config();
// Access mongo client
const MongoClient = mongodb.MongoClient;

// 8000 if the current one cannot be accessed
const port = process.env.PORT || 8000;

MongoClient.connect(process.env.RESTREVIEWS_DB_URI, {
  // options: max people who can connnect
  maxPoolSize: 50,
  // after x time, the request times out
  wtimeoutMS: 250,
  // Mongodb nodejs driver rewrote the tool that parses mongodb
  // connection strings
  useNewUrlParser: true,
})
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async (client) => {
    await RestaurantsDAO.injectDB(client);
    // How we start the web server after connecting
    app.listen(port, () => {
      // Log the process
      console.log(`listening on port ${port}`);
    });
  });
