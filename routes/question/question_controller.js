
const { to } = require("await-to-js");
const BaseController = require("../../commons/base_controller");
const ErrorHandler = require('../../utils/error_handler');
const QuestionRepository = require("./question_repository");

module.exports = class QuestionController extends BaseController {
  constructor() {
    super("question", new QuestionRepository());
  }
};
