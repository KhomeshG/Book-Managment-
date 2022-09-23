const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");

exports.reviews = async function (req, res) {
  try {
    //first Checking Book (Present?/Not) || (Deleted?/Not)
    let checkBook = await bookModel
      .findOne({ _id: req.body.bookId })
      .select({ __v: 0 });
    if (checkBook == null) {
      return res.status(404).send({ status: false, msg: "book-Not Found !!" });
    }
    //Checking Book (Deleted?/Not)
    if (checkBook.isDeleted == true) {
      return res
        .status(400)
        .send({ status: false, msg: "This Book is Deleted" });
    }
    //adding reviewsData Or We Can Say That adding reviewsData Section in Books

    let reviewsData = await reviewModel.create([req.body]);
    let result = { checkBook, reviewsData };

    return res.send({ data: result });
  } catch (err) {
    return res.send({
      status: false,
      msg: "Server Error",
      errMessage: err.message,
    });
  }
};

//update reviews

exports.updateReviews = async function (req, res) {
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

    //Checking that reviewId Is Matching with BookID

    if (checkBookId._id.toString() != checkReviewId.bookId) {
      return res.status(400).send({
        status: false,
        msg: "Your review Id is Not Matching with BookId that we have Written",
      });
    }

    //Updating that review
    let updatedReviewData = await reviewModel.findByIdAndUpdate(
      req.params.reviewId,
      {
        reviewedBy: req.body.reviewedBy,
        review: req.body.review,
        rating: req.body.rating,
      },
      { new: true }
    );
    return res.status(200).send({ status: false, data: updatedReviewData });
  } catch (err) {
    return res.status(500).send({ err: err.message, Msg: "Server error!!!" });
  }
};
