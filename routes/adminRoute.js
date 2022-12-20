const express = require('express');
const route_Admin = express();
const adminController = require('../controllers/adminController')


const auth = require('../middleware/adminAuth');
const session = require("express-session");

const config = require('../config/config');
route_Admin.use(session({ secret: config.sessionSecret }));



const bodyParser = require('body-parser');

route_Admin.use(bodyParser.json());
route_Admin.use(bodyParser.urlencoded({ extended: true }))
route_Admin.set('view engine', 'ejs');
route_Admin.set('views', './views/admin')//path





//multer import 
const multer = require("multer");
const path = require("path")


//destination to store multer file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/userImages'))
    },//file name 
    filename: function (req, file, cb) {
        cb(null, String(Date.now()) + '-' + file.originalname);
        // cb(null,name);
    }
})
//uploading 
const upload = multer({ storage: storage })

route_Admin.get('/', auth.isLogout, adminController.loadlogin)

route_Admin.post('/', adminController.verifyLogin)

route_Admin.get('/home', auth.isLogin, adminController.loadDashboard);
route_Admin.get("/logout", auth.isLogin, adminController.logout)
route_Admin.get('/forget', auth.isLogout, adminController.forgetLoad);

route_Admin.post('/forget', auth.isLogout, adminController.forgetVerify)

route_Admin.get('/forget-password',adminController.forgetPasswordLoad)
route_Admin.post('/forget-password',adminController.resetPassword)
route_Admin.get("/dashboard",auth.isLogin,adminController.adminDashbord);
route_Admin.get('/new-user',auth.isLogin,adminController.newUserLoad)
route_Admin.post('/new-user',upload.single('image'),adminController.addUser)


route_Admin.get("*", function (req, res) {
    res.redirect('/admin')
})




module.exports = route_Admin