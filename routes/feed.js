const express = require("express");
const feedControllers = require("../controllers/feedControllers")
const {body} = require("express-validator");
const router = express.Router();
const jwt = require("jsonwebtoken");


function isAuth(req, res, next) {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        const error = new Error("Authorization header is missing");
        error.statusCode = 401;
        return next(error);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        const error = new Error("Token is missing in Authorization header");
        error.statusCode = 401;
        return next(error);
    }

    try {
        const decodedToken = jwt.verify(token, "ff933e07-fc6c-482d-a3ac-9c48445b9866");
        req.userId = decodedToken.userId; // Store decoded data for further use
        next();
    } catch (error) {
        error.statusCode = 401;
        return next(error); // Pass the error to the error handling middleware
    }
}

let validateInput =
    [body('title')
        .trim()
        .isLength({min: 5})
        .withMessage("The title is not up to 5 characters long!"), body('content')
        .trim()
        .isLength({min: 5})
        .withMessage("The content is not up to 5 characters long!")];

// GET /feed/posts
router.get("/posts", isAuth, feedControllers.getPosts);

// POST /feed/post
router.post("/post", isAuth, [...validateInput, body("image").trim().custom((value, {req}) => {
    if (!req.file) {
        throw new Error("No valid image attached. Make sure the attached image is a PNG or a JPEG.")
    }
    return true;
})], feedControllers.createPost);

// PUT /feed/post/edit/:id
router.put("/post/:id", [...validateInput], isAuth, feedControllers.editPost)

// GET /post
router.get("/post/:id", isAuth, feedControllers.getSinglePost);

//  DELETE /post
router.delete("/post/:id", isAuth, feedControllers.deleteSinglePost);
module.exports = router;