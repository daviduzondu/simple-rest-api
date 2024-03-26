const PORT = 8080
const path = require("path");
const express = require("express");
const app = express();
const feedRoutes = require('./routes/feed')
const bodyParser = require("body-parser");
const {validationResult} = require("express-validator");
const mongoose = require("mongoose");
const helpers = require("./lib/helpers");


app.use("/images", express.static(helpers.absolutePath("images")));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
app.use("/feed", feedRoutes);


app.use((err, req, res, next) => {
    res.status(500).json({error: true, message: err.message})
    // next();
});


(async () => {
    try {
        mongoose.connect("mongodb+srv://daviduzondu:gDNvvT00YgAQ00IM@cluster0.usbmnfm.mongodb.net/messages");
        app.listen(PORT);
        console.log(`Application running on ${PORT}`)
    } catch (e) {
        console.log(e.message);
    }
})()
