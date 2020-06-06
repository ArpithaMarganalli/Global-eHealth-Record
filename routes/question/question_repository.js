
const BaseRepository = require("../../commons/base_repository");
const QuestionSchema = require("./question_schema");

module.exports = class QuestionRepository extends BaseRepository {
  constructor() {
    super("question", QuestionSchema.getSchema());
  }
};
