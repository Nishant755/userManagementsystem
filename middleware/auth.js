const isLogin = async (req, res, next) => {
    try {
        if (req.session.use_id) { }
        else {
            res.redirect('/')
        }
        next();

    } catch (error) {
        console.log(error.message)
    }
}
const isLoginout = async (req, res, next) => {
    try {
        if (req.session.use_id) {
            res.redirect('/home')
        }
        next()



    } catch (error) {
        console.log(error.message)
    }
}
module.exports = { isLogin, isLoginout }