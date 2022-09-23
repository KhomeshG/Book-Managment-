const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");

module.exports = {
  ////Reviews API

  reviews: async function (req, res) {
    //first Checking Book (Present?/Not) || (Deleted?/Not)
    try {
      let checkBook = await bookModel.findOne({ _id: req.params.bookId });
      if (checkBook == null) {
        return res
          .status(404)
          .send({ status: false, msg: "book-Not Found !!" });
      }
      //Checking Book (Deleted?/Not)
      if (checkBook.isDeleted == true) {
        return res
          .status(400)
          .send({ status: false, msg: "This Book is Deleted" });
      }
      //adding reviewsData Or We Can Say That adding reviewsData Section in Books

      let reviewsData = await reviewModel.create(req.body);
      let addReview = await bookModel.findByIdAndUpdate(
        req.params.bookId,
        {
          $inc: { reviews: 1 },
        },
        { new: true }
      );
      let result = {
        _id: checkBook._id,
        title: checkBook.title,
        excerpt: checkBook.excerpt,
        userId: checkBook.userId,
        ISBN: checkBook.ISBN,
        category: checkBook.category,
        subcategory: checkBook.subcategory,
        reviews: checkBook.reviews,
        deletedAt: checkBook.deletedAt,
        isDeleted: checkBook.isDeleted,
        releasedAt: checkBook.releasedAt,
        reviewsData: reviewsData,
      };
      return res.status(201).send({
        status: true,
        msg: "Review created Successfully",
        data: result,
      });
    } catch (err) {
      return res.send({
        status: false,
        msg: "Server Error",
        errMessage: err.message,
      });
    }
  },

  ////update reviews API
  updateReviews: async function (req, res) {
    //Checking BookId from params
    try {
      let checkBookId = await bookModel.findOne({ _id: req.params.bookId });
      if (checkBookId == null) {
        return res.status(404).send({ status: false, msg: "Book Not Found" });
      }
      if (checkBookId.isDeleted == true) {
        return res
          .status(400)
          .send({ status: false, msg: "this Book is Already Deleted" });
      }
      let checkReviewId = await reviewModel.findOne({
        _id: req.params.reviewId,
      });
      if (checkReviewId == null) {
        return res.status(404).send({ status: false, msg: "review Not Found" });
      }

      //checking review (deleted?/not)
      if (checkReviewId.isDeleted == true) {
        return res
          .status(400)
          .send({ status: false, msg: "this review is Already Deleted" });
      }

      //Checking that reviewId Is Matching with BookID

      if (checkBookId._id.toString() != checkReviewId.bookId) {
        return res.status(400).send({
          status: false,
          msg: "Your review Id is Not Matching with BookId that we have Written",
        });
      }

      //Updating that review
      let updatedReviewData = await reviewModel
        .findByIdAndUpdate(
          req.params.reviewId,
          {
            reviewedBy: req.body.reviewedBy,
            review: req.body.review,
            rating: req.body.rating,
          },
          { new: true }
        )
        .select({ __v: 0 });
      //finding that pertical book reviews book reviews
      // let allReviews = await reviewModel.find({ bookId: req.params.bookId });

      //destucturing
      // let result = { checkBookId, allReviews };

      let result = {
        _id: checkBookId._id,
        title: checkBookId.title,
        excerpt: checkBookId.excerpt,
        userId: checkBookId.userId,
        ISBN: checkBookId.ISBN,
        category: checkBookId.category,
        subcategory: checkBookId.subcategory,
        reviews: checkBookId.reviews,
        deletedAt: checkBookId.deletedAt,
        isDeleted: checkBookId.isDeleted,
        releasedAt: checkBookId.releasedAt,
        reviewsData: [updatedReviewData],
      };
      //
      return res.status(200).send({ status: true, data: result });
    } catch (err) {
      return res.status(500).send({ err: err.message, msg: "Server error!!!" });
    }
  },

  //
  //Delete review API

  deleteReview: async (req, res) => {
    try {
      let reviewID = req.params.reviewId;
      let bookID = req.params.bookId;
      let reviewsData = await reviewModel.findOne({
        bookId: bookID,
        _id: reviewID,
        isDeleted: false,
      });
      if (!reviewsData) {
        return res.status(404).send({
          status: false,
          message: " review not found",
        });
      }

      let deletedData = await reviewModel.findOneAndUpdate(
        { _id: reviewID },
        { $set: { isDeleted: true } },
        { new: true }
      );
      let decReviewData = await bookModel.findByIdAndUpdate(
        bookID,
        {
          $inc: { reviews: -1 },
        },
        { new: true }
      );
      res.status(200).send({
        status: true,
        message: "review deleted successfully ",
        data: deletedData,
      });
    } catch (error) {
      res.status(500).send({ status: false, message: error.message });
    }
  },
};
