const {validationResult} = require("express-validator");
const postModel = require("../models/post");
const fsPromises = require("fs/promises");
const {absolutePath} = require("../lib/helpers");

// console.log(absolutePath("images"))
async function clearImage(filePath) {
    filePath = absolutePath(`${filePath}`);
    try {
        await fsPromises.unlink(filePath)
    } catch (e) {
        console.log("Delete Operation failed!");
    }
}

async function getPosts(req, res, next) {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    try {
        let totalItemsCount = await postModel.find().countDocuments();
        const posts = await postModel.find().skip((currentPage - 1) * perPage).limit(perPage);
        const response = {success: true, posts, count: posts.length, totalItems: totalItemsCount};
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
            const error = new Error("Validation Failed");
            error.statusCode = 422;
            error.errors = [...errors.array().map(x => x.msg)];
            throw error;
        }
        const imageUrl = req.file.path;
        const post = await (new postModel({
            title, content,
            creator: {
                name: "David Uzondu"
            },
            imageUrl: imageUrl
        })).save();

        res.status(201).json({
            messages: ["Post created successfully!"],
            post
        });
    } catch (e) {
        return next(e);
    }
}

async function editPost(req, res, next) {
    const errors = validationResult(req);
    const {id} = req.params;
    let {title, content, image} = req.body;
    if (req.file) image = req.file.path;
    try {
        if (!errors.isEmpty()) {
            const error = new Error("Validation Failed");
            error.statusCode = 422;
            error.errors = [...errors.array().map(x => x.msg)];
            throw error;
        }
        const post = await postModel.findById(id);
        if (!post) {
            const error = new Error("Post not found! Something went wrong. Try again!");
            error.statusCode = 404;
            throw error;
        }
        if (image !== post.imageUrl) clearImage(post.imageUrl)
        post.title = title;
        post.imageUrl = image;
        post.content = content;
        await post.save();
        return res.status(200).json({success: true, post, message: "Post updated!"});
    } catch (e) {
        return next(e);
    }
}

async function getSinglePost(req, res, next) {
    let {id} = req.params;
    try {
        const post = await postModel.findById(id);
        if (!post) {
            const error = new Error("Post was not found!");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({post});
    } catch (e) {
        next(e);
    }
}

async function deleteSinglePost(req, res, next) {
    const {id} = req.params;
    try {
        const post = await postModel.findById(id);
        if (!post) {
            const error = new Error("Post not found! Something went wrong. Try again!");
            error.statusCode = 404;
            throw error;
        }
        await postModel.findByIdAndDelete(id);
        clearImage(post.imageUrl);
        res.status(200).json({success: true});
    } catch (e) {
        return next(e);
    }
}

module.exports = {getPosts, createPost, getSinglePost, editPost, deleteSinglePost}