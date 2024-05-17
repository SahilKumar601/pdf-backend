const dotenv = require('dotenv');
const mongoose = require("mongoose");
dotenv.config();
const dbUrl =process.env.db_url;

const connect = () => {
  mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log("Db connected successfully.")).catch((error) => console.log(error));
};
module.exports = connect;
