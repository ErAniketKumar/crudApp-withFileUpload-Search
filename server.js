const express = require('express')
const app = express()
const port = 3000
const mongoose=require('mongoose');
const path=require('path');
const router=require('./routes/thisRout.js');
const multer=require('multer');
const session=require('express-session');
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(express.static('uploads'));
app.use(session({
    secret:'abc',
    saveUninitialized:true,
    resave:false,
}))

app.use((req, res, next)=>{
    res.locals.message=req.session.message;
    delete req.session.message;
    next();
})

app.set('views','./views');
app.set('view engine', 'ejs');

app.use('/', router);



app.listen(port, () => console.log(`Example app listening on port ${port}!`))