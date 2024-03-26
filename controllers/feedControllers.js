const {validationResult} = require("express-validator");
const postModel = require("../models/post");

async function getPosts(req, res, next) {
    try {
        throw new Error("Internal server error");
        const posts = await postModel.find();
        const response = {success: true, posts};
        res.status(200).json(response);
    } catch (e) {
        return next(e);
    }
}

async function createPost(req, res, next) {
//     todo: Create post in db
    const errors = validationResult(req);
    const {title, content} = req.body;
    try {
        if (!errors.isEmpty()) {
            return res.status(422).json({error: true, messages: [...errors.array().map(x => x.msg)]})
        }
        const post = await (new postModel({
            title, content,
            creator: {
                name: "David Uzondu"
            },
            imageUrl: 'images/'
        })).save();

        res.status(201).json({
            messages: ["Post created successfully!"],
            post
        });
    } catch (e) {
        console.log(e);
        return next(e);
    }
}

module.exports = {getPosts, createPost}