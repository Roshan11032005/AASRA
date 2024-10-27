const express = require("express");
const errorHandler = require("./middleware/errorHandler.js");
const connectdb = require("./config/dbconnection");
const dotenv = require("dotenv").config();
connectdb();
const app = express();
const port = process.env.PORT;
app.use(express.json());

app.use("/api/med-history",require("./routes/medRoutes.js"));
app.use("/api/users",require("./routes/userRoutes.js"));
app.use(errorHandler);
app.listen(port,() => {
    console.log(port);
});

