const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");

const reviewModel = require("../models/reviewModel");

//==============================create book====================================//

const createBook = async (req, res) => {
  try {
    let newBookCreated = await bookModel.create(req.body);
    res.status(201).send({
      status: true,
      message: "Book created successfully",
      data: newBookCreated,
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//===============================get books==========================================//

const getBooks = async function (req, res) {
  try {
    let { userId, category, subcategory } = req.query;
    let filter = {};

    if (Object.keys(req.query).length) {
      if (userId) {
        filter.userId = userId;
      }
      if (category) {
        filter.category = category;
      }
      if (subcategory) {
        filter.subcategory = subcategory;
      }
      //------if user provide any other filter any these---------//
      if (!Object.keys(filter).length) {
        return res.status(404).send({
          status: false,
          msg: "No Book Found!!",
        });
      }
    }

    filter.isDeleted = false;
    let allBooks = await bookModel
      .find({ $and: [filter] })
      .select({
        title: 1,
        excerpt: 1,
        userId: 1,
        category: 1,
        releasedAt: 1,
        reviews: 1,
      })
      .sort({ title: 1 });
    //-----if no book found--------//
    if (!allBooks.length) {
      return res.status(404).send({
        status: false,
        msg: "No Book Found!!",
      });
    }
    res.status(200).send({
      status: true,
      msg: "Books List !!",
      data: allBooks,
    });
  } catch (err) {
    res.status(500).send({
      status: false,
      msg: err.message,
    });
  }
};

//=============================get book by bookID===============================//
let getBookById = async (req, res) => {
  try {
    let bookId = req.params.bookId;
    let bookData = await bookModel.findOne({ _id: bookId, isDeleted: false });
    //----------if no Data found -------//
    if (!isValid(bookData)) {
      return res.status(404).send({
        status: false,
        message: `Book is not found with this ID: ${bookId}`,
      });
    }
    //getting the data from review Model
    let reviews = await reviewModel
      .find({ bookId: bookId, isDeleted: false })
      .select({
        _id: 1,
        bookId: 1,
        reviewedBy: 1,
        reviewedAt: 1,
        rating: 1,
        review: 1,
      });

    let bookReviews = {
      bookData,
      reviewsData: reviews,
    };

    return res
      .status(200)
      .send({ status: true, message: "Books list", data: bookReviews });
  } catch (error) {
    return res.status(500).send({ status: false, Error: error.message });
  }
};

//============================update book========================================//

const updateBook = async (req, res) => {
  try {
    let requestBody = req.body;
    if (!isvalidRequestBody(requestBody)) {
      res
        .status(400)
        .send({ statua: false, msg: `Request body can't be empty` });
      return;
    }
    let bookId = req.params.bookId;
    if (!isvalidObjectId(bookId)) {
      res
        .status(400)
        .send({ status: false, message: `${bookId} is not a valid book id ` });
      return;
    }

    let uniqueTitleAndIsbn = await bookModel.find({
      $or: [{ title: requestBody.title }, { ISBN: requestBody.ISBN }],
    });
    if (uniqueTitleAndIsbn.length !== 0) {
      if (uniqueTitleAndIsbn[0].title == requestBody.title)
        return res
          .status(400)
          .send({
            status: false,
            data: "Title is Already Exists,Please Input Another title",
          });
      else {
        return res
          .status(400)
          .send({
            status: false,
            data: "ISBN Number Already Exists,Please Input Another ISBN Number",
          });
      }
    }

    const book = await bookModel.findOne({ _id: bookId });
    if (book.isDeleted === false) {
      let updatedBookData = await bookModel.findByIdAndUpdate(
        bookId,
        {
          title: requestBody.title,
          excerpt: requestBody.excerpt,
          releasedAt: requestBody.releasedAt,
          ISBN: requestBody.ISBN,
        },
        { new: true }
      );
      res.status(200).send({ status: true, data: updatedBookData });
    } else {
      res.status(404).send("File is not present or Deleted");
    }
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

module.exports = { createBook, getBooks, getBookById, updateBook };
