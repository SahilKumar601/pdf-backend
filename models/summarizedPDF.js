const mongoose = require("mongoose");
const { Schema } = mongoose;
const SummarizedPdfSchema = new Schema({
  originalName: {
    type: String,
    required: [true, "originalName is required"],
  },
  summarizedName: {
    type: String,
    required: [true, "summarizedName is required"],
  },
  originalContent: {
    type: String,
    required: [true, "originalContent is required"],
  },
  summarizedContent: {
    type: String,
    default: "No summarized content available",
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "user" },
}, { timestamps: true });
module.exports = mongoose.model("summarizedPDF", SummarizedPdfSchema);
