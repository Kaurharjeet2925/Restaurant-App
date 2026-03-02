const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: function () {
        return this.role !== "superAdmin";
      },
    },

    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: [
        "superAdmin",
        "owner",
        "admin",
        "waiter",
        "kitchen",
        "billing",
      ],
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

/* ===============================
   HASH PASSWORD
================================ */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* ===============================
   COMPARE PASSWORD
================================ */
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);