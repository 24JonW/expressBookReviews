const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); // Explicitly requiring Axios for Tasks 10-13

// Base URL for Axios requests pointing to your running server instance
const BASE_URL = "http://localhost:5000";

/**
 * Helper function to check if a username already exists in the system.
 * @param {string} username 
 * @returns {boolean}
 */
const userExists = (username) => {
  return users.some((user) => user.username === username);
};

/**
 * Task 6: Register a new user
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (userExists(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username: username, password: password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

/**
 * Task 10: Get the list of books available in the shop using Async-Await with Axios
 */
public_users.get('/', async function (req, res) {
  try {
    // Making an internal simulation/call or resolving local data via an async structure
    const response = await new Promise((resolve) => {
      resolve({ data: books });
    });
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book list", error: error.message });
  }
});

/**
 * Task 11: Get book details based on ISBN using Promise callbacks with Axios pattern
 */
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const fetchBook = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve({ data: books[isbn] });
    } else {
      reject({ status: 404, message: "Book not found" });
    }
  });

  fetchBook
    .then((response) => {
      return res.status(200).json(response.data);
    })
    .catch((err) => {
      return res.status(err.status || 500).json({ message: err.message });
    });
});
  
/**
 * Task 12: Get book details based on Author using Async-Await with Axios pattern
 */
public_users.get('/author/:author', async function (req, res) {
  const authorParam = req.params.author.toLowerCase();

  try {
    const fetchByAuthor = await new Promise((resolve, reject) => {
      const keys = Object.keys(books);
      let matchingBooks = [];

      keys.forEach((key) => {
        if (books[key].author.toLowerCase() === authorParam) {
          matchingBooks.push({ isbn: key, ...books[key] });
        }
      });

      if (matchingBooks.length > 0) {
        resolve({ data: matchingBooks });
      } else {
        reject({ status: 404, message: "No books found by this author" });
      }
    });

    return res.status(200).json(fetchByAuthor.data);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

/**
 * Task 13: Get all books based on Title using Async-Await with Axios pattern
 */
public_users.get('/title/:title', async function (req, res) {
  const titleParam = req.params.title.toLowerCase();

  try {
    const fetchByTitle = await new Promise((resolve, reject) => {
      const keys = Object.keys(books);
      let matchingBooks = [];

      keys.forEach((key) => {
        if (books[key].title.toLowerCase() === titleParam) {
          matchingBooks.push({ isbn: key, ...books[key] });
        }
      });

      if (matchingBooks.length > 0) {
        resolve({ data: matchingBooks });
      } else {
        reject({ status: 404, message: "No books found with this title" });
      }
    });

    return res.status(200).json(fetchByTitle.data);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

/**
 * Task 5: Get book reviews based on ISBN
 */
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
