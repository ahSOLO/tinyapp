const generateRandomString = function(object) {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let redo = true;
  while(redo) {
    for ( let i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    redo = false;
    for (const key of Object.keys(object)) {
      if (key === result) redo = true;
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

module.exports = { 
  generateRandomString,
  getUserByEmail,
 }