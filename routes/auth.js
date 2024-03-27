const express = require("express");
const {body} = require("express-validator");
const router = express.Router();
const userModel = require("../models/user");
const authControllers = require("../controllers/authControllers");

router.put("/signup", body("email").isEmail().withMessage("Please enter a valid email").custom(async (value, {req}) => {
        const [userExists] = await userModel.find({email: value});
        if (userExists) throw new Error("Email address already exists!");
        return true;
    }),
    body("password").trim().isLength({min: 5}),
    body("name").trim().not().isEmpty()
    , authControllers.signup);

router.post("/login", body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").trim().isLength({min: 5}), authControllers.login);

module.exports = router;