const bodyParser = require('body-parser');
const express = require('express');
const route_User = express();
const session=require("express-session")

const config=require("../config/config.js")
route_User.use(session({secret:config.sessionSecret}))

const auth=require('../middleware/auth')

//express is runing in ejs engine
route_User.set("view engine","ejs");
route_User.set("views", "./views/users")//path

//body parser
route_User.use(bodyParser.json())
route_User.use(bodyParser.urlencoded({extended:true}))



//image path 
route_User.use(express.static('public'))


//multer import 
const multer=require("multer");
const path=require("path")


//destination to store multer file
const storage=multer.diskStorage({
    destination:function(req,file,cb){
cb(null,path.join(__dirname,'../public/userImages'))
    },//file name 
    filename:function(req,file,cb){
cb(null,String(Date.now())+'-'+file.originalname);
// cb(null,name);
    }
})
//uploading 
const upload=multer({storage:storage})


//userControler imports
const userControlers = require("../controllers/userController");
//get request
 route_User.get("/register",auth.isLoginout,userControlers.loadRegister);

//post request 
route_User.post('/register',upload.single('image'),userControlers.inserUser)

route_User.get('/verify',userControlers.verifymail);
//export route


//login
route_User.get('/',auth.isLoginout,userControlers.loginload);
route_User.get('/login',auth.isLoginout,userControlers.loginload)
route_User.post('/login',userControlers.verifyLogin)
route_User.get('/home',auth.isLogin,userControlers.loadHome)


//logout
route_User.get('/logout',auth.isLogin,userControlers.userLogout);

route_User.get('/forget',auth.isLoginout,userControlers.forgetLoad)

route_User.post('/forget',userControlers.forgetVerify)

route_User.get('/forget-password',auth.isLoginout,userControlers.forgetPasswordLoad)
route_User.post('/forget-password',userControlers.resetPassword)

route_User.get('/Verification',userControlers.verifyLoad);
 route_User.post('/verification',userControlers.sendVerification)

//user route

route_User.get('/edit',auth.isLogin,userControlers.editLoad);
route_User.post('/edit',upload.single('image'),userControlers.updateProfile)



module.exports = route_User