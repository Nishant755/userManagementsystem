const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        require: true
    },
    image: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
   
    is_admin: {
        type: Number,
        require: true
    },
    is_verified: {
        type: Number,
        default: 0
    },
    token:
    {
        type: String,
        dafault: ''
    }
})

module.exports = mongoose.model("user", userSchema)
