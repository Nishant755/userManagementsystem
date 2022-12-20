const User = require('../models/userModel.js');
const bcrypt = require("bcrypt");
const randomstring = require('randomstring');
const config = require('../config/config')
const nodemailer = require('nodemailer')

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
            html: '<p>hii' + name + ',please click here to forget <a href=http://localhost:3000/admin/forget-password?token=' + token + '">reset</a>reset Your password..</p>'
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

const addUserMail = async (name, email, password, user_id) => {
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
            html: '<p>hii' + name + ',please click here to verify <a href=http://localhost:3000/register/verify?id=' + user_id + '">verify</a>verify Your mail..</p><br><b>Email:-</b>' + email + '<br><b>password:-</br>' + password
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
const loadlogin = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}


const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {
                if (userData.is_admin === 0) {
                    return res.render("login", { message: "email and password is incorrect " })
                }
                else {
                    req.session.user_id = userData._id;
                    return res.redirect("/admin/home");
                }
            }
            else {
                return res.render("login", { message: "email and password is incorrect " })
            }
        } else {
            return res.render("login", { message: "email and password is incorrect" })
        }



    } catch (error) {
        console.log(error.message)
    }
}



const loadDashboard = async (req, res) => {
    try {
        const userData = await User.findById({ _d: req.session.user_id })
        res.render('home')
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async (req, res) => {
    try {
        req.session.destroy();
        return res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}

const forgetLoad = async (req, res) => {
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message)
    }
}




const forgetVerify = async (req, res) => {
    try {
        const email = req.body.email
        const userData = await User.findOne({ emai: email });
        if (userData) {
            if (userData.is_admin === 0) {
                res.render('forget', { message: 'email is incorrect' });

            }
            else {
                const randomstring = randomstring.generate();
                const updateData = await User.updateOne({ email: email }, { $set: { token: randomstring } });
                sendResetPasswordMail(userData.name, userData.email, randomstring);
                res.render('forget', { message: "please check your mail to reset your password" })

            }
        } else {
            res.render('forget', { message: "email is correct" });
        }
    } catch (error) {
        console.log(error.message)
    }
}




const forgetPasswordLoad = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await user.findOne({ token: token });
        if (tokenData) {
            res.render('forget-password', { user_id: tokenData._id });
        } else {
            res.render('404', { message: 'Invalid link' })
        }
    } catch (error) {
        console.log(error.message);
    }
}



const resetPassword = async (req, res) => {
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;
        const secure_Password = await securePassword(password)
        const updateData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_Password, token: '' } })
        res.render('/admin');
    } catch (error) {

        console.log(error.message)
    }
}


const adminDashbord = async (req, res) => {
    try {
        const userData = await User.find({ is_admin: 0 })
        res.render('dashboard', { users: userData })
    } catch (error) {
        console.log(error.message)
    }
}
//add new user 
const newUserLoad = async (req, res) => {
    try {
        res.render('new-user');

    } catch (error) {
        console.log(error.message)
    }
}



const addUser = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const mobile = req.body.mobile;
        const image = req.file.filename;
        const password = randomstring.generate(8);
        const spassword = await securePassword(password)
        const user = new User({
            name: name,
            email: email,
            mobile: mobile,
            image: image,
            password: spassword,
            is_admin:0
        })
        const UserData = await user.save();
        if (UserData) {
            addUserMail(name, email, password, UserData._id)
            res.redirect('/admin/dashboard')
        } else {
            res.render('new-user', { message: 'somthing wrong' });
        }
    } catch (error) {
        console.log(error.message)
    }
}
module.exports = { loadlogin, verifyLogin, loadDashboard, logout, forgetLoad, forgetVerify, forgetPasswordLoad, resetPassword, adminDashbord, newUserLoad, addUser }