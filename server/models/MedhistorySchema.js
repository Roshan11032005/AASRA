const mongoose = require("mongoose");

const medicalHistorySchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please add the patient's name"],
    },
    age_or_dob: {
      type: String,
      required: [true, "Please add the patient's age or date of birth"],
    },
    gender: {
      type: String,
      required: [true, "Please specify the gender"],
      enum: ["Male", "Female", "Other"],
    },
    country: {
      type: String,
      required: [true, "Please specify the country"],
    },
    personal_phone: {
      type: Number,
      required: [true, "Please add the personal phone number"],
    },
    emergency_phone: {
      type: Number,
      required: [true, "Please add the emergency contact phone number"],
    },
    email: {
      type: String,
      required: [true, "Please add the email"],
    },
    HVI: {
      type: String,
      required: [true, "Please add the Healthy Voice Unique ID"],
      unique: true,
      minlength: 12,
      maxlength: 12,
    },
    current_location: {
      type: String,
    },
    home_location: {
      type: String,
      required: [true, "Please specify the home location"],
    },
    buffer_location: {
      type: String,

    },
    allergies: {
      type: [String], // Array of allergies
    },
    medicinal_allergies: {
      type: [String], // Array of medicinal allergies
    },
    prescription: [{
      filename: { type: String, required: true },
      data: { type: Buffer, required: true }, // Store the binary data as Buffer
      contentType: { type: String, required: true }, 
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MedicalHistories", medicalHistorySchema);