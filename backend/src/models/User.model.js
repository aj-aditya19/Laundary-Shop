import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["customer", "staff", "manager", "admin"],
      default: "customer",
    },
    isActive: { type: Boolean, default: true },
    avatar: { type: String, default: null },
    loyaltyPoints: { type: Number, default: 0 },
    address: { type: String, default: "" },
    notifications: {
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
    },
    lastLogin: { type: Date },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};
const User = mongoose.model("User", userSchema);
export default User;
