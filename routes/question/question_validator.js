
const BaseValidator = require("../../commons/base_validator");
const QuestionSchema = require("./question_schema");

module.exports = class QuestionValidator extends BaseValidator {
    constructor() {
        super("question", QuestionSchema.getSchema());
    }
};
