const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

// Use body-parser middleware to parse JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure express-session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Simulated in-memory user data
const users = [
  { id: 1, username: 'user1', password: 'abc1' },
  { id: 2, username: 'user2', password: 'abc2' },
];

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
  const user = users.find((user) => user.id === id);
  done(null, user);
});

// Configure local strategy for passport
passport.use(new LocalStrategy((username, password, done) => {
  const user = users.find((user) => user.username === username);
  console.log({"user": user})
  if (!user) {
    return done(null, false, { message: 'Incorrect username' });
  }
  if (user.password !== password) {
    return done(null, false, { message: 'Incorrect password' });
  }
  return done(null, user);
}));

// Serve static files
app.use(express.static('public'));

// Define routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/',
}));

// app.post('/login',(req,res)=>{
//     console.log(req.body)
// })

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dash.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
      return;
    }
    req.logout((error) => {
      if (error) {
        next(error);
        return;
      }

  })})
});

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
