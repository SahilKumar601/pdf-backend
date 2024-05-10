

const mongoose = require("mongoose");


const connect = () => {
  mongoose.connect("mongodb://127.0.0.1:27017/localjacob", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log("Db connected successfully.")).catch((error) => console.log(error));
};

module.exports = connect;
