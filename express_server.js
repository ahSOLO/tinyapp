// Express
const express = require("express");
const app = express();

// 3rd Party Packages
const bcrypt = require('bcrypt');

// Constants
const PORT = 8080;

// Import Helper Functions
const { 
  generateRandomString,
  getUserByEmail,
  getUrlsByUserId,
  recordAnalytics,
 } = require("./helper");

app.set("view engine", "ejs");

// Middleware: method-override, body-parser, cookie-parser
const methodOverride = require('method-override');
app.use(methodOverride('_method'))

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: 'session',
  keys: ["LighthouseLabs"],
}))

// Pseudo-database for URLs and users:
const urlDatabase = {};
const users = {};

// ROUTES - GET ROUTES

// URL display routes
app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  const urls = getUrlsByUserId(urlDatabase, userId);
  const templateVars = { urls: urls, user: users[userId] };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.userId] };
  if (!req.session.userId) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  // Check that short URL exists
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)){
    return res.status(404).redirect("/404");
  }
  let uniqueVisitorsTotal = 0;
  if (urlDatabase[req.params.shortURL]["uniqueVisitors"]) {
    uniqueVisitorsTotal = urlDatabase[req.params.shortURL]["uniqueVisitors"].length
  } 
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]["longURL"], 
    user: users[req.session.userId],
    visitsCount: urlDatabase[req.params.shortURL]["visitsCount"] || 0,
    uniqueVisitorsTotal: uniqueVisitorsTotal || 0,
    visits: urlDatabase[req.params.shortURL]["visits"] || [],
   };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // Check that short URL exists
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)){
    return res.status(404).redirect("/404");
  }
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  recordAnalytics(req, urlDatabase);
  res.redirect(longURL);
});

// Authentication routes
app.get("/register", (req, res) => {
  // Redirect if session id already exists
  if (Object.keys(users).includes(req.session.userId)) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.userId] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.userId] };
  res.render("urls_login", templateVars);
});

// Error Routes
app.get('/400', (req, res) => {
  const templateVars = { user: users[req.session.userId] };
  res.status('400');
  res.render('400', templateVars);
})

app.get('/403', (req, res) => {
  const templateVars = { user: users[req.session.userId] };
  res.status('403');
  res.render('403', templateVars);
})

app.get('/404', (req, res) => {
  const templateVars = { user: users[req.session.userId] };
  res.status('404');
  res.render('404', templateVars);
})

// Catch-all route
app.get('*', (req, res) => {
  const userId = req.session.userId;
  if (userId) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
})

// ROUTES - POST/DELETE/PUT ROUTES

// Delete URL
app.delete("/urls/:shortURL/delete", (req, res) => {
  // Authentication
  if (!req.session.userId) {
    return res.status('403').redirect('/403');
  }
  const shortURL = req.params.shortURL;
  // Authorization
  if (req.session.userId === urlDatabase[shortURL]["userId"]) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
  else {
    res.status('403').redirect('/403');
  }
});

// Create URL
app.post("/urls", (req, res) => {
  // Authentication
  if (!req.session.userId) {
    return res.status('403').redirect('/403');
  }
  const shortURL = generateRandomString(urlDatabase);
  urlDatabase[shortURL] = { longURL: req.body.longURL, userId: req.session.userId };
  res.redirect(`/urls/${shortURL}`);
});

// Update URL
app.put("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  if (req.session.userId === urlDatabase[shortURL]["userId"]) {
    urlDatabase[shortURL] = { longURL: req.body.longURL, userId: req.session.userId };
    res.redirect(`/urls`);
  }
  else {
    res.status('403').redirect('/403');
  }
});

// Authentication routes
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const userId = generateRandomString(users);
  if (!(req.body.email) || !(req.body.password) ) {
    res.status('403').redirect('/400');
    return;
  }
  if (getUserByEmail(users, req.body.email)) {
    res.status('403').redirect('/400');
    return;
  }
  const hashedPass = bcrypt.hashSync(req.body.password, 10);
  users[userId] = { id: userId, email: req.body.email, password: hashedPass };
  req.session.userId = userId;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const userId = getUserByEmail(users, req.body.email);
  if (!userId) {
    return res.status('403').redirect('/403');
  }
  if (bcrypt.compareSync(req.body.password, users[userId]["password"])) {
    req.session.userId = userId;
    res.redirect('/urls');
  }
  else {
    res.status('403').redirect('/403');
  }
});

// END OF ROUTES

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});