const mongoose = require("mongoose");


const userSchema = mongoose.Schema({
    username : {
        type: String,
        required : [true,"please add the hospital name"],
    },
    email : {
        type: String,
        required : [true,"please add the hospital name"],
        unique: [true,"email addres already taken"],
    },
    password : {
        type: String,
        required : [true,"please add the hospital password"],
    },

},{
    timestamps: true
});



module.exports = mongoose.model("Users",userSchema);