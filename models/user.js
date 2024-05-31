const mongoose = require("mongoose");
const { Schema } = mongoose;
const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  friendRequests: [{ type: Schema.Types.ObjectId, ref: "user" }],
  friends: [{ type: Schema.Types.ObjectId, ref: "user" }],
  summarizedPDFs: [{ type: Schema.Types.ObjectId, ref: "summarizedPDF" }],
});
module.exports = mongoose.model("user", UserSchema);
