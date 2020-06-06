
const express = require("express");
const QuestionController = require("./question_controller.js");
const QuestionValidator = require("./question_validator.js");
const QuestionRouter = express.Router();
const questionController = new QuestionController();
const questionValidator = new QuestionValidator();

QuestionRouter.route("/")
  .get(questionController.index.bind(questionController))
  .post(questionValidator.validate.bind(questionValidator), questionController.create.bind(questionController));

QuestionRouter.route("/:id")
  .get(questionController.read.bind(questionController))
  .put(questionValidator.validate.bind(questionValidator), questionController.update.bind(questionController))
  .delete(questionController.delete.bind(questionController));

module.exports ={
  router:QuestionRouter
}
