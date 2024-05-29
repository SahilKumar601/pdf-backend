const mongoose = require("mongoose");

require("dotenv").config();

const connectToDatabase = () => {
  return mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Database connected");
    })
    .catch((err) => {
      console.log("Database connection error", err);
    });
};

module.exports = connectToDatabase;
