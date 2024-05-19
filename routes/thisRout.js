const express = require('express')
const mongoose=require('mongoose');
const path=require('path');
const router=express.Router();
const multer=require('multer');
const session=require('express-session');
const { type } = require('os');
const { create } = require('domain');
const { title } = require('process');
const fs = require('fs');
const uri='mongodb+srv://collegedb:collegedb123@cluster0.yubriwt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

router.get('/add',(req, res)=>{
    res.render('adduser',{title:'adduser'});
})

//schema
const userSchema=mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    email:{
        type:String,
        required:true,
    },
    phone:{
        type:Number,
        required:true,
    },
    image:{
        type:String,
        require:true,
    },
    create:{
        type:Date,
        required:true,
        default:Date.now,
    },
})

//compile or model
const userModel=mongoose.model('demo2',userSchema);

//run/ connection
async function run() {
    try{
        const dboptions={
            dbname:'learn',
        }
        await mongoose.connect(uri, dboptions);
        console.log('connected Db');
    } catch(err) {
        console.log(err);
    }
}

run();

const upload=multer({
    storage:multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null,path.join(__dirname,'..','uploads'));
        },
        filename: function(req, file, cb) {
            cb(null, file.originalname+Date.now()+'.jpg');
        }
    })
})

//RETRIEVE USERS
router.get('/', async (req, res) => {
    try {
        const users = await userModel.find().exec();
        res.render('home', {
            title: 'home page',
            users: users,
        });
    } catch (err) {
        res.json({ message: "error to retrieve" });
    }
});

//ADD USER
router.post('/add',upload.single('image'), async (req, res)=>{
    const {name, userEmail, phone}=req.body;
    try{
        const createUser=userModel({
            name:name,
            email:userEmail,
            phone:phone,
            image:req.file.filename,
        });
        try{
            await createUser.save();
            res.status(200).redirect('/');
        } catch(err) {
            console.log(err);
            res.status(500).send('server err');
        }
    } catch(err) {
        console.log(err);
        res.status(200),send('server error');
    }
})

//edit/update

router.get('/edit/:id', async (req, res) => {
    let id = req.params.id;
    try{
        const user=await userModel.findById(id);
        if(!user) {
            res.redirect('/');
        } else {
            res.render('edituser',{
                title:'edit page',
                user:user,
            })
        }
    } catch(err) {
        res.redirect('/');
    }
});


router.get('/delete/:id', async (req, res)=>{
    let id=req.params.id;
    try{
       await userModel.findByIdAndDelete(id);
       res.redirect('/');
    } catch(err) {
        res.redirect('/');
    }
})
router.post('/update/:id', upload.single('image'), async (req, res) => {
    let id = req.params.id.trim();
    const { name, userEmail, phone, old_image } = req.body;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + old_image);
        } catch (err) {
            console.error('Error deleting old image:', err);
        }
    } else {
        new_image = old_image;
    }

    try {
        const userToUpdate = await userModel.findById(id);
        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        await userModel.findByIdAndUpdate(id, {
            name: name,
            email: userEmail,
            phone: phone,
            image: new_image,
        });

        res.redirect('/');
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Error updating user' });
    }
});


module.exports=router;