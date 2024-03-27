const userModel = require("../models/user");
const {validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function signup(req, res, next) {
    const {email, name, password} = req.body;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error = new Error("Validation Failed");
            error.statusCode = 422;
            error.errors = [...errors.array().map(x => x.msg)];
            throw error;
        }
        const hashedPw = await bcrypt.hash(password, 12);
        const user = new userModel({
            email, password: hashedPw, name
        });
        const result = await user.save();
        res.status(201).json({message: "New user added!", userId: result._id});
    } catch (e) {
        return next(e);
    }
}

async function login(req, res, next) {
    const {email, password} = req.body;
    try {
        const userToLogin = await userModel.findOne({email: email});
        if (!userToLogin) {
            const error = new Error("No user with this email found!");
            error.statusCode = 401;
            throw error;
        }
        const isCorrectPw = await bcrypt.compare(password, userToLogin.password);
        if (!isCorrectPw) {
            const error = new Error("Wrong password!");
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign({
            email: userToLogin.email, userId: userToLogin._id.toString()
        }, "ff933e07-fc6c-482d-a3ac-9c48445b9866", {expiresIn: '1h'});
        res.status(200).json({token: token, userId: userToLogin._id.toString()});
    } catch (e) {
        next(e);
    }
}

module.exports = {signup, login}