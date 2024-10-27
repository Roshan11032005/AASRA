const asyncHandler = require("express-async-handler");
const MedicalHistory = require("../models/MedhistorySchema"); 

//@desc Create a new medical history
//@route POST /api/med-history
//@access private
const createMedicalHistory = asyncHandler(async (req, res) => {

  const {
    name,
    age_or_dob,
    gender,
    country,
    personal_phone,
    emergency_phone,
    email,
    HVI,
    current_location,
    home_location,
    buffer_location,
    allergies,
    medicinal_allergies,
    prescription,
  } = req.body;

  console.log(req.body)
  // Check if all required fields are provided
  if (
    !name ||
    !age_or_dob ||
    !gender ||
    !country ||
    !personal_phone ||
    !emergency_phone ||
    !email ||
    !HVI ||
    !home_location
  ) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  const medicalHistory = await MedicalHistory.create({
    name,
    age_or_dob,
    gender,
    country,
    personal_phone,
    emergency_phone,
    email,
    HVI,
    current_location,
    home_location,
    buffer_location,
    allergies,
    medicinal_allergies,
    prescription,
    user_id: req.u.id, // Reference to the user
  });

  res.status(201).json(medicalHistory);
});


//@desc Get an individual medical history by email
//@route GET /api/med-history/email/:email
//@access public
const getMedicalHistory = asyncHandler(async (req, res) => {
  const email = decodeURIComponent(req.params.email); // Decode email from URL
  console.log(email);
  
  const medicalHistory = await MedicalHistory.findOne({ email: email }).select('-prescription');

  if (!medicalHistory) {
    res.status(404);
    throw new Error("Medical history not found for this email");
  }

  res.status(200).json(medicalHistory);
});

//@desc Update an existing medical history
//@route PUT /api/med-history/:id
//@access private
const updateMedicalHistory = asyncHandler(async (req, res) => {
  const medicalHistory = await MedicalHistory.findById(req.params.id);

  if (!medicalHistory) {
    res.status(404);
    throw new Error("Medical history not found");
  }

  // Ensure the logged-in user is the owner of the medical history
  if (medicalHistory.user_id.toString() !== req.u.id) {
    res.status(403);
    throw new Error("User does not have permission to update this medical history");
  }

  const updateData = {};
  [
    'name', 'age_or_dob', 'gender', 'country', 'personal_phone', 
    'emergency_phone', 'email', 'HVI', 'current_location', 
    'home_location', 'buffer_location', 'prescription'
  ].forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  // AddToSet for allergies and medicinal_allergies (to avoid duplicates)
  const appendData = {};
  if (Array.isArray(req.body.allergies)) {
    appendData.$addToSet = { allergies: { $each: req.body.allergies } };
  }
  if (Array.isArray(req.body.medicinal_allergies)) {
    appendData.$addToSet = {
      ...appendData.$addToSet,
      medicinal_allergies: { $each: req.body.medicinal_allergies }
    };
  }


  if (req.files && req.files.length > 0) {
    const newPrescriptions = req.files.map((file) => ({
      filename: file.originalname,
      data: file.buffer,
      contentType: file.mimetype,
    }));

    appendData.$push = { prescription: { $each: newPrescriptions } };
  }


  const updatedHistory = await MedicalHistory.findByIdAndUpdate(
    req.params.id, 
    {
      $set: updateData,       // For normal fields
      ...appendData           // For array fields
    }, 
    { new: true }
  );

  

  res.status(200).json(updatedHistory);
});

//@desc Download prescription file by index
//@route GET /api/med-history/download/:id/:index
//@access public
const downloadPrescription = asyncHandler(async (req, res) => {
  const { id, index } = req.params;

  // Find the medical history by ID
  const medicalHistory = await MedicalHistory.findById(id);
  
  if (!medicalHistory || !medicalHistory.prescription[index]) {
    res.status(404);
    throw new Error("Prescription not found");
  }

  const prescription = medicalHistory.prescription[index];

  // Set the response headers for file download
  res.set({
    'Content-Type': prescription.contentType,
    'Content-Disposition': `attachment; filename="${prescription.filename}"`,
  });

  // Send the file data as a response
  res.send(prescription.data);
});



module.exports = {getMedicalHistory, createMedicalHistory, updateMedicalHistory,downloadPrescription };