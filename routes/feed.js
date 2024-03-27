const express = require("express");
const feedControllers = require("../controllers/feedControllers")
const {body} = require("express-validator");
const router = express.Router();


let validateInput =
    [body('title')
        .trim()
        .isLength({min: 5})
        .withMessage("The title is not up to 5 characters long!"), body('content')
        .trim()
        .isLength({min: 5})
        .withMessage("The content is not up to 5 characters long!")];

// GET /feed/posts
router.get("/posts", feedControllers.getPosts);

// POST /feed/post
router.post("/post", [...validateInput, body("image").trim().custom((value, {req}) => {
    if (!req.file) {
        throw new Error("No valid image attached. Make sure the attached image is a PNG or a JPEG.")
    }
    return true;
})], feedControllers.createPost);

// PUT /feed/post/edit/:id
router.put("/post/:id", [...validateInput], feedControllers.editPost)

// GET /post
router.get("/post/:id", feedControllers.getSinglePost);

//  DELETE /post
router.delete("/post/:id", feedControllers.deleteSinglePost);
module.exports = router;