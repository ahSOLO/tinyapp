// Generates string for use as IDs for shortURLs and users
const generateRandomString = function(object) {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let redo = true;
  while(redo) {
    for ( let i = 0; i < 6; i++ ) {
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

module.exports = { 
  generateRandomString,
  getUserByEmail,
  getUrlsByUserId,
 }