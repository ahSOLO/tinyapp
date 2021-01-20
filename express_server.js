const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Import utility functions
const { 
  generateRandomString,
  getUserByEmail,
 } = require("./utility");

// Set view engine
app.set("view engine", "ejs");

// body parser middleware
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// cookie parser middleware
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// pseudo-database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// users object
const users = {};

// Get Routes
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.userId] };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.userId] };
  res.render("urls_new", templateVars);
});

app.get("/urls/register", (req, res) => {
  const templateVars = { user: users[req.cookies.userId] };
  res.render("urls_register", templateVars);
});

app.get("/urls/login", (req, res) => {
  const templateVars = { user: users[req.cookies.userId] };
  res.render("urls_login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.userId] };
  res.render("urls_show", templateVars);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/400', (req, res) => {
  const templateVars = { user: users[req.cookies.userId] };
  res.statusCode('400');
  res.render('400', templateVars);
})

app.get('*', (req, res) => {
  const templateVars = { user: users[req.cookies.userId] };
  res.statusCode('404');
  res.render('404', templateVars);
})

// Post Routes

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(urlDatabase);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
});

app.post("/login", (req, res) => {
  const user = users[req.cookies.userId];
  res.cookie('userId', user);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const userId = generateRandomString(users);
  if (!(req.body.email) || !(req.body.password) ) {
    res.redirect('/400')
    return;
  }
  if (getUserByEmail(users, req.body.email)) {
    res.redirect('/400')
    return;
  }
  users[userId] = { id: userId, email: req.body.email, password: req.body.password };
  res.cookie('userId', userId);
  res.redirect('/urls');
});

// End Routes

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});