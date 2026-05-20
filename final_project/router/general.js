const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Helper function to check if username exists
const userExists = (username) => {
  return users.some((user) => user.username === username);
};

// Task 6: Register a new user
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

// Task 10: Get the book list available in the shop using Async-Await
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => {
      return new Promise((resolve) => {
        resolve(books);
      });
    };

    let bookList = await getBooks();
    return res.status(200).send(JSON.stringify({ books: bookList }, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});

// Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "Book not found" });
    }
  });

  getBookByISBN
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((err) => {
      return res.status(err.status || 500).json({ message: err.message });
    });
});
  
// Task 12: Get book details based on author using Async-Await
public_users.get('/author/:author', async function (req, res) {
  const authorParam = req.params.author.toLowerCase();

  try {
    const getBooksByAuthor = () => {
      return new Promise((resolve, reject) => {
        const keys = Object.keys(books);
        let matchingBooks = [];

        keys.forEach((key) => {
          if (books[key].author.toLowerCase() === authorParam) {
            matchingBooks.push({ isbn: key, ...books[key] });
          }
        });

        if (matchingBooks.length > 0) {
          resolve(matchingBooks);
        } else {
          reject({ status: 404, message: "No books found by this author" });
        }
      });
    };

    let matched = await getBooksByAuthor();
    return res.status(200).json(matched);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

// Task 13: Get all books based on title using Async-Await
public_users.get('/title/:title', async function (req, res) {
  const titleParam = req.params.title.toLowerCase();

  try {
    const getBooksByTitle = () => {
      return new Promise((resolve, reject) => {
        const keys = Object.keys(books);
        let matchingBooks = [];

        keys.forEach((key) => {
          if (books[key].title.toLowerCase() === titleParam) {
            matchingBooks.push({ isbn: key, ...books[key] });
          }
        });

        if (matchingBooks.length > 0) {
          resolve(matchingBooks);
        } else {
          reject({ status: 404, message: "No books found with this title" });
        }
      });
    };

    let matched = await getBooksByTitle();
    return res.status(200).json(matched);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

// Task 5: Get book review
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

