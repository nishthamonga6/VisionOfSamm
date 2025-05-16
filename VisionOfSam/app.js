require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const hbs = require('hbs');
const exphbs = require('express-handlebars');

const app = express();

const users = []; // simple in-memory user store for demo only

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultSecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public/images')));

// View engine setup
app.engine('hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// Register helper for active link
hbs.registerHelper('ifActive', function (link, options) {
  const currentPath = options.data.root.currentPath || '/';
  return link === currentPath ? 'active' : '';
});

// Middleware to set currentPath and currentUser for all templates
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.currentUser = req.session.userId || null;
  next();
});

// Routes

app.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

// Combined login & signup page
app.get('/auth', (req, res) => {
  res.render('login-signup', { title: 'Login or Sign Up' });
});

// Login handler
app.post('/auth/login', (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    req.session.userId = user.email;
    return res.redirect('/');
  } else {
    return res.render('login-signup', { title: 'Login or Sign Up', error: 'Invalid email or password' });
  }
});

// Signup handler
app.post('/auth/signup', (req, res) => {
  const name = req.body.name.trim();
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  if (users.find(u => u.email === email)) {
    return res.render('login-signup', { title: 'Login or Sign Up', error: 'Email already registered' });
  }
  users.push({ name, email, password });
  req.session.userId = email;
  return res.redirect('/');
});

// Logout
app.get('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Start server
const PORT = process.env.PORT || 1508;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
