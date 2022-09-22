const express = require("express");
const router = express.Router();

//controller
const userController = require("../controllers/userController");
const loginController = require("../controllers/loginController");
const bookController = require("../controllers/bookcontroller");
const validator = require("../validations/validations");
const reviewController = require("../controllers/reviewController");

//middleware
const middleware = require("../middleware/auth");

//Create User API
router.post("/register", validator.createUser, userController.createUser);

//logIn API
router.post("/login", validator.userLogin, loginController.loginUser);

//Create book
router.post(
  "/books",
  middleware.authentication,
  middleware.autherization,
  validator.createBook,
  bookController.createBook
);

//Get Books
router.get("/books", middleware.authentication, bookController.getBooks);

//Get Book by BookID
router.get(
  "/books/:bookId",
  middleware.authentication,
  validator.getBookByID,
  bookController.getBookById
);

//Creating Reviews
router.post(
  "/books/:bookId/review",
  middleware.authentication,
  // middleware.autherization,
  validator.reviews,
  reviewController.reviews
);

//Update books by bookId
router.put("/books/:bookId", bookController.updateBook);

//=========================== if endpoint is not correct==========================================

router.all("/*", function (req, res) {
  res.status(400).send({
    status: false,
    message: "Make Sure Your Endpoint is Correct !!!",
  });
});

module.exports = router;
//
