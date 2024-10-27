const express = require("express");
const router = express.Router();
const {getMedicalHistory, createMedicalHistory, updateMedicalHistory,downloadPrescription }= require("../controllers/medController.js");
const validateToken = require("../middleware/validTokenHandler.js");
const upload = require("../middleware/multerpdf.js");


router.route('/:email').get(getMedicalHistory);
router.get('/api/med-history/download/:id/:index', downloadPrescription);
router.use(validateToken);
router.route('/').post(upload, createMedicalHistory);
router.put('/:id', upload, updateMedicalHistory);

module.exports = router;

