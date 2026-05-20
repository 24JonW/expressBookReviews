const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
    //returns boolean
    //write code to check is the username is valid
    return username && !users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ 
    //returns boolean
    //write code to check if username and password match the one we have in records.
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    if (authenticatedUser(username, password)) {
      // Generate JWT Access Token
      let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });
  
      // Store access token and username in the session object
      req.session.authorization = {
        accessToken, username
      };
  
      return res.status(200).json({ message: "User successfully logged in" });
    } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
  });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review;
    const username = req.session.authorization['username']; // Retrieved from authenticated session
  
    if (!reviewText) {
      return res.status(400).json({ message: "Review content cannot be empty" });
    }
  
    if (books[isbn]) {
      // If reviews object doesn't exist for the book, initialize it
      if (!books[isbn].reviews) {
        books[isbn].reviews = {};
      }
      
      // Add or overwrite the review for the current logged-in user
      books[isbn].reviews[username] = reviewText;
      
      return res.status(200).json({ message: `The review for book with ISBN ${isbn} has been added/updated.` });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization['username']; // Retrieved from authenticated session
  
    if (books[isbn]) {
      if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: `Reviews for ISBN ${isbn} posted by user ${username} deleted.` });
      } else {
        return res.status(404).json({ message: "Review not found or you are not authorized to delete it." });
      }
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});




module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

