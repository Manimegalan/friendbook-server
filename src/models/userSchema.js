const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  mobileNumber: {
    type: String,
  },
  token: {
    type: String,
  },
});

userSchema.plugin(timestamps);
module.exports = mongoose.model("User", userSchema);
