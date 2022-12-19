const User = require("../models/userModel")
const nodemailer = require('nodemailer')
const bcrypt = require("bcrypt")
const { updateOne } = require("../models/userModel")
const config = require('../config/config')
const radomstring = require('randomstring')
//password hashing 
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message)
    }
}

//email sending to mail id
const sendVerifyMail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: true, // use SSL
            requireTLS: true,
            auth: {
                user: config.emailUser,
                password: config.password
            }

        })
        const mailoption = {
            from: "nishantjambhlkar6@gmail.com",
            to: email,
            subject: 'For verification',
            html: '<p>hii' + name + ',please click here to verify <a href=http://localhost:3000/register/verify?id=' + user_id + '">verify</a>verify Your mail..</p>'
        }
        transporter.sendMail(mailoption, function (err, info) {
            if (err) {
                console.log(err.message)
            }
            else {
                console.log("email has been send:-", info.response)
            }
        })


    } catch (error) {
        console.log(error.message)
    }
}

//for reset password send mail
const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // use SSL
            requireTLS: true,
            auth: {
                user: config.emailUser,
                password: config.password
            }

        })
        const mailoption = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset password',
            html: '<p>hii' + name + ',please click here to forget <a href=http://localhost:3000/register/verify?token=' + token + '">reset</a>reset Your password..</p>'
        }
        transporter.sendMail(mailoption, function (err, info) {
            if (err) {
                console.log(err.message)
            }
            else {
                console.log("email has been send:-", info.response)
            }
        })


    } catch (error) {
        console.log(error.message)
    }
}
const loadRegister = async (req, res) => {
    try {
        res.render('registration')
    } catch (error) {
        console.log(error.message)
    }
}
const inserUser = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password)
        const data = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: spassword,
            image: req.file.filename,
            is_verified: 0
        })

        const userData = await data.save();
        if (userData) {
            sendVerifyMail(req.body.name, req.body.email, userData._id)
            return res.render("registration", { message: "Registration sucessfull please verify your mail" })
        }
        else {
            return res.render("Registration", { message: "registration sucessfull" })
        }



    } catch (error) {
        console.log(error.message)
    }
}
const verifymail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne.apply({ _id: req.querry.id }, { $set: { is_verified: 1 } })
        console.log(updateInfo)
        res.render("email-verified")
    } catch (error) {
        console.log(error.message)
    }
}


//login user
const loginload = async (req, res) => {
    try {
        res.render("login")
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password
        // console.log(email,password)
        const UserData = await User.findOne({ email: email })//find 
        // console.log(UserData)
        if (UserData) {
            // console.log(UserData.password)
            const passwordMatch = await bcrypt.compare(password, UserData.password)
            // console.log(passwordMatch)
            if (passwordMatch) {
                if (User.is_verified === 0) {
                    res.render('login', { message: "please verify your mail..." })
                } else {
                    req.session.use_id = UserData._id;
                    return res.redirect('/home');
                }

            } else {
                return res.render('login', { message: "email and password is incorect" });
            }


        } else {
            return res.render('login', { message: "email and password is incorect" })
        }
    } catch (error) {
        console.log(error.message)
    }
}


const loadHome = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.use_id })
        return res.render('home', { user: userData })
    } catch (error) {
        console.log(error.message)
    }
}

const userLogout = (req, res) => {
    try {
        req.session.destroy();
        return res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
}



//forget password 
const forgetLoad = async (req, res) => {
    try {
        res.render('forget')
    } catch (error) {
        console.log(err.messsage)
    }
}
const forgetVerify = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        // console.log(userData)
        if (userData) {

            if (userData.is_verified === 0) {
                return res.render('forget', { message: "please verify your mail..." })
            } else {
                const radomString = radomstring.generate();
                const upadateData = await User.updateOne({ email: email }, { $set: { token: radomString } })
                sendResetPasswordMail(userData.name, userData.email, radomString);
                return res.render('forget', { message: 'Please check your mail to reset your password...' })
            }

        } else {
            return res.render('forget', { message: 'User email is incorrect' })
        }
    } catch (error) {
        console.log(error.message)
    }
}


const forgetPasswordLoad = async (req, res) => {
    try {

        const token = req.querry.token;
        const tokenData = await User.findOne({
            token: token
        })
        if (tokenData) {
            res.render('forget-password', { use_id: tokenData._id })
        }
        res.render('404', { message: "page Not found" })

    } catch (error) {
        console.log(error.message)
    }
}

const resetPassword = async (req, res) => {
    try {
        const password = req.body.password;
        const user_id = req.body.user_id
        const sercure_password = await securePassword(password);
        const updateData = await User.findById({ _id: user_id }, { $set: { password: sercure_password, token: '' } })
        res.render('/')
    } catch (error) {
        console.log(error.message)
    }
}

//verification resend link

const verifyLoad = async (req, res) => {
    try {
        res.render('verification')
    } catch (error) {
        console.log(error.message)
    }
}


const sendVerification = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {
            sendResetPasswordMail(userData.name, userData.email, userData.user_id)
            res.render('verification', { message: "Reset verification link is send in your mail Id please check" })
        } else {
            res.render('verification', { message: "This email is not exist" })
        }

    } catch (error) {
        console.log(error.message)
    }
}

//user profile and update
const editLoad = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({ _id: id });
        if (userData) {
            res.render('edit', { user: userData })
        } else[
            res.redirect('/home')
        ]



    } catch (error) {
        console.log(error.message)
    }
}

const updateProfile = async(req, res) => {
    try {
        if (req.file) {
            const userData = await User.findByIdAndUpdate({ _id: req.body.use_id }, { $set: { name: req.body.name, email: req.body.email, mobile: req.body.mobile, image:req.file.filename} })
        } else {
            const userData = await User.findByIdAndUpdate({ _id: req.body.use_id }, { $set: { name: req.body.name, email: req.body.email, mobile: req.body.mobile } })
        }


    res.redirect('/home');
    } catch (error) {
        console.log(error.message)
    }
}
module.exports = { loadRegister, inserUser, verifymail, loginload, verifyLogin, loadHome, userLogout, forgetLoad, forgetVerify, forgetPasswordLoad, resetPassword, verifyLoad, sendVerification, editLoad, updateProfile }