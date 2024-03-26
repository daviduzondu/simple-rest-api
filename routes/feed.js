const express = require("express");
const feedControllers = require("../controllers/feedControllers")
const {body} = require("express-validator");
const router = express.Router();

// GET /feed/posts
router.get("/posts",
    feedControllers.getPosts);

// POST /feed/post
router.post("/post",
    body('title')
    .trim()
    .isLength({min: 5})
    .withMessage("The title is not up to 5 characters long!"),
    body('content')
        .trim()
        .isLength({min: 5})
        .withMessage("The content is not up to 5 characters long!"),
    feedControllers.createPost);

module.exports = router; 