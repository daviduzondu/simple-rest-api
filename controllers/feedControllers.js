const {validationResult} = require("express-validator");
const postModel = require("../models/post");
const fsPromises = require("fs/promises");
const {absolutePath} = require("../lib/helpers");
const userModel = require("../models/user");

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
        console.log(req.userId);
        const post = await (new postModel({
            title, content,
            creator: req.userId,
            imageUrl: imageUrl
        })).save();
        const creator = await userModel.findById(req.userId);
        creator.posts.push(post);
        await creator.save();
        console.log(creator.name);
        res.status(201).json({
            messages: ["Post created successfully!"],
            post, creator: {_id:creator._id, name:creator.name}
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
        if (post.creator._id.toString() !== req.userId.toString()){
            const error = new Error("You cannot perform this action.");
            error.statusCode = 403;
            throw error;
        }
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
        if (post.creator._id.toString() !== req.userId.toString()){
            const error = new Error("You cannot perform this action.");
            error.statusCode = 403;
            throw error;
        }
        if (!post) {
            const error = new Error("Post not found! Something went wrong. Try again!");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({success: true});
        clearImage(post.imageUrl);
        await postModel.findByIdAndDelete(id);
        const user = (await userModel.findById(req.userId))
        user.posts.pull(post._id);
        await user.save();
    } catch (e) {
        return next(e);
    }
}

module.exports = {getPosts, createPost, getSinglePost, editPost, deleteSinglePost}