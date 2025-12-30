const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "waiter", "kitchen", "billing"],
      default: "waiter",
    },
  phone: String,
  uploadImage: String,
  gender: String,
  address: String,
  dateofbirth: String,
  },
  { timestamps: true }
);

/**
 * ✅ SAFEST PASSWORD HASHING
 * No next(), no async → cannot fail
 */
userSchema.pre("save", function () {
  if (!this.isModified("password")) return;

  const salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
});

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
