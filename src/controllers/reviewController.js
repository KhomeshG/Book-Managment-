const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");

//first Checking Book (Present?/Not) || (Deleted?/Not)
exports.reviews = async function (req, res) {
  try {
    let checkBook = await bookModel.findOne({ _id: req.body.bookId });
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

    let reviewsData = await reviewModel.create(req.body);
    //let result = { checkBook, reviewsData };

    return res.status(201).send({ data: reviewsData });
  } catch (err) {
    return res.send({
      status: false,
      msg: "Server Error",
      errMessage: err.message,
    });
  }
};
