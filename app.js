require('dotenv').config()
const express = require('express')
const app = express()
const passport = require('passport');
const cookieSession = require('cookie-session')
require('./passport-setup');
const mysql=require('mysql')


const db =mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'nodejsproject'
});
db.connect(function(err){
    if (err) throw err;

    console.log('connected')
})

app.use(cookieSession({
    name: 'tuto-session',
    keys: ['key1', 'key2']
  }))

  app.get('/comment', function (req, res, next) {
    res.render('pages/comment')
  })  


app.set('view engine','ejs')
app.use(express.urlencoded({extended:false}))

// Auth middleware that checks if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

// Initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());

// Example protected and unprotected routes
app.get('/', (req, res) => res.render('pages/index'))
app.get('/failed', (req, res) => res.send('You Failed to log in!'))

// In this route you can see that if the user is logged in u can acess his info in: req.user
app.get('/good', isLoggedIn, (req, res) =>{
    res.render("pages/profile",{name:req.user.displayName,pic:req.user.photos[0].value,email:req.user.emails[0].value})
})

// Auth Routes
app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/good');
  }
);

app.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})

app.post('/update',(req,res)=>{
 console.log(req.body)
 const sql ="insert in comment("+req.body.comment+")"
 db.query(sql,function(err){
     if (err) throw err
 })
 db.end()
})


app.listen(5000, () => console.log(`Example app listening on port ${5000}!`))