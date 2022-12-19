const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());


mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://Nishant:Nishant123@cluster0.bqmrmhr.mongodb.net/student", {
    useNewUrlParser: false
})

    .then(() => console.log("Connected with Nishant's MongoDB"))
    .catch(err => console.log(err))



// import routes
let userRoute = require("./routes/routes")
//connect expree server to router
app.use('/', userRoute)


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});