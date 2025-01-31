import express from "express"
import UserController from "../controller/Implements/auth.controller";
import authMiddilware, { refreshTokenMidllWare } from "../middleware/authMiddileware";
import { validate } from "../middleware/validateMiddleware";
import {  validationSchemas } from "../validator/auth.validator";
const Router = express.Router();

const controller = new UserController()

// login user
Router.route("/login").post(validate(validationSchemas.login),controller.login.bind(controller));

// register user
Router.route("/register").post(validate(validationSchemas.register),controller.registerUser.bind(controller));

// check
Router.route("/check").get(authMiddilware, controller.checkUser);

// logout
Router.post("/logout", authMiddilware, controller.logoutUser.bind(controller));

// get refresh Token
Router.post("/token", refreshTokenMidllWare, controller.refreshTokenGet.bind(controller))


// get all users
// wire up : with admin middileware , now is for testing poropuse
Router.route("/users").get(controller.getAllUsers.bind(controller));



export default Router