if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
//setup
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const expressLayouts = require('express-ejs-layouts')
//const fs = require('fs')
//const tone = require('tone')
const multer = require('multer')
const uuid = require('uuid').v4
const path = require('path')

//db declaration
const mongoose = require('mongoose')
const Image = require('./Models/Image')

//connect to local host
mongoose.connect('mongodb://localhost:127.0.0.1:27017/', {
    useNewUrlParser: true, useUnifiedTopology: true
});

//db connection & error handling
const connection = mongoose.connection;
connection.on('error', console.log);

//file extension preservation
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const id = uuid();
        const filePath = `images/${id}${ext}`;
        Image.create({ filePath })
            .then(()=> {
                cb(null, filePath);

            });

        
    }
});

const upload = multer({storage})



const initializePassport = require('./passport-config')
const passport = require('passport')
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

//database variable
const users = []

//static files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use(express.static('uploads'))

//Templating engines.
app.use(expressLayouts) 
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        

//routes to logins
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs', { title: 'Login page'})
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect : '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated,(req, res) => {
    res.render('register.ejs', { title: 'Register page'})
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password,10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email:  req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')

    } catch {
        res.redirect('/register')

    }
    console.log(users)

}) 

//routes to pages.
app.get('/homeMusicPlayer',(req, res) => {
    res.render('homeMusicPlayer.ejs', {title: 'Home page'})
})

app.get('/Bio', (req, res) => {
    res.render('Bio.ejs', {title: 'Bio'})
})

app.get('/about',(req, res) => {
    res.render('about.ejs', {title: 'About'})
})

app.get('/contacts',(req, res) => {
    res.render('contacts.ejs', {title: 'Contacts'})
})


//upload route
app.post('/upload', upload.array('load'),(req, res) => {
    return res.redirect('homeMusicPlayer')
})

//db route
app.get('/images', (req, res ) => {
    Image.find()
        .then((images) => {
            return res.json({ status: 'OK', images});
        });
})

// file read
/*fs.readFile(__dirname + '/file.mp3', function(err, data) {
    if (err) {
        throw err;
    }
    console.log(data.toString());

});*/

//logout route
app.delete('/logout',(req, res) => {
    req.logOut(),
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()

    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res , next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}






app.listen(3000)