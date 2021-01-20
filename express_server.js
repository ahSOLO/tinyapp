const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Import utility functions
const { 
  generateRandomString,
  getUserByEmail,
  getUrlsByUserId,
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
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "1a1a1a" },
  "9sm5xK": { longURL: "http://www.google.com", userId: "1a1a1a" }
};

// users object
const users = {
  "1a1a1a": {
    id: "1a1a1a",
    email: 'example@user.com',
    password: '1234',
  }
};

// Get Routes
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies.userId;
  const urls = getUrlsByUserId(urlDatabase, userId);
  const templateVars = { urls: urls, user: users[userId] };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.userId] };
  if (!req.cookies.userId) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.userId] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies.userId] };
  res.render("urls_login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], user: users[req.cookies.userId] };
  res.render("urls_show", templateVars);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

app.get('/400', (req, res) => {
  const templateVars = { user: users[req.cookies.userId] };
  res.status('400');
  res.render('400', templateVars);
})

app.get('/403', (req, res) => {
  const templateVars = { user: users[req.cookies.userId] };
  res.status('403');
  res.render('403', templateVars);
})

app.get('*', (req, res) => {
  const templateVars = { user: users[req.cookies.userId] };
  res.status('404');
  res.render('404', templateVars);
})

// Post Routes

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies.userId === urlDatabase[shortURL]["userId"]) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
  else {
    res.redirect('/403');
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(urlDatabase);
  urlDatabase[shortURL] = { longURL: req.body.longURL, userId: req.cookies.userId };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = { longURL: req.body.longURL, userId: req.cookies.userId };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const userId = generateRandomString(users);
  if (!(req.body.email) || !(req.body.password) ) {
    res.redirect('/400');
    return;
  }
  if (getUserByEmail(users, req.body.email)) {
    res.redirect('/400');
    return;
  }
  users[userId] = { id: userId, email: req.body.email, password: req.body.password };
  res.cookie('userId', userId);
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const userId = getUserByEmail(users, req.body.email);
  if (!userId) {
    res.redirect('/403');
  }
  if (users[userId]["password"] === req.body.password){
    res.cookie('userId', userId);
    res.redirect('/urls');
  }
  else {
    res.redirect('/403');
  }
});

// End Routes

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});