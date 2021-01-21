// Generates string for use as IDs for shortURLs and users
const generateRandomString = function(object) {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let redo = true;
  const len = 6; // Length of the random string
  while(redo) {
    for ( let i = 0; i < len; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    redo = false;
    // Check for duplicates
    if (object) { // skip if object is undefined - used in stretch assignment for generation of first visitor ID
      for (const key of Object.keys(object)) {
        if (key === result) redo = true;
      }
    }
  }
  return result;
}

const getUserByEmail = function(users, email) {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
}

const getUrlsByUserId = function(urls, id) {
  let output = {};
  for (let url in urls) {
    if (urls[url]["userId"] === id) {
      output[url] = urls[url];
    }
  }
  return output;
}

// Stretch Assignment - record analytics
const recordAnalytics = function (req, urlDatabase) {
  // Count visits
  urlDatabase[req.params.shortURL]["visitsCount"] = urlDatabase[req.params.shortURL]["visitsCount"] + 1 || 1;
  // Record unique visitors
  if (!urlDatabase[req.params.shortURL]["uniqueVisitors"]) {
    urlDatabase[req.params.shortURL]["uniqueVisitors"] = [];
  }
  if (!urlDatabase[req.params.shortURL]["uniqueVisitors"].includes(req.session.userId)) {
    urlDatabase[req.params.shortURL]["uniqueVisitors"].push(req.session.userId);
  }
  // Record individual visits
  if (!urlDatabase[req.params.shortURL]["visits"]) {
    urlDatabase[req.params.shortURL]["visits"] = [];
  }
  // Initially used the same random generation function as url ID and user ID to generate visitor ID, but I switched to a numeric count because it was more informative and there was no need for encryption here 
  urlDatabase[req.params.shortURL]["visits"].unshift({ timestamp: new Date(), visitor: urlDatabase[req.params.shortURL]["visitsCount"]}); 
}

module.exports = { 
  generateRandomString,
  getUserByEmail,
  getUrlsByUserId,
  recordAnalytics,
 }