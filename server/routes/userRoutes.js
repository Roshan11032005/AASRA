const express= require("express");
const {loginUser,registerUser,currentUser} = require("../controllers/UserController");
const validateToken = require("../middleware/validTokenHandler");
const router = express.Router();


router.post("/register",registerUser);
router.post("/login", loginUser);
router.get("/current",validateToken,currentUser);


module.exports= router;