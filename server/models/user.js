const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["buyer", "creator", "admin"], default: "buyer" },
  approved: {
    type: Boolean,
    default: function () {
      return this.role !== "creator"; // Auto-approve buyers and admins, creators need approval
    },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
