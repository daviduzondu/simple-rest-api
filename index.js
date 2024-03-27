const PORT = 8080
const path = require("path");
const express = require("express");
const app = express();
const feedRoutes = require('./routes/feed')
const bodyParser = require("body-parser");
const {validationResult} = require("express-validator");
const mongoose = require("mongoose");
const helpers = require("./lib/helpers");
const multer = require("multer");
const {v4: uuidv4} = require("uuid")

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images")
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + "-" + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    const acceptedTypes = ["image/jpeg", "image/png", "image/jpg"];
    for (const type of acceptedTypes) {
        if (file.mimetype === type) {
            // console.log(req.file);
            cb(null, true);
            break;
        } else {
            cb(null, false);
        }
    }
}

app.use("/images", express.static(helpers.absolutePath("images")));
app.use(bodyParser.json());
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
// app.use(multer({storage: fileStorage, fileFilter: fileFilter}));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
app.use("/feed", feedRoutes);


app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({error: true, message: err.message, ...err})
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
