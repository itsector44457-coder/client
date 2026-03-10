const mongoose = require("mongoose");

const FieldTemplateSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    fieldKey: { type: String, required: true, unique: true }, // normalized version
    subjects: [
      {
        name: { type: String, required: true },
        topics: [{ type: String }],
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("FieldTemplate", FieldTemplateSchema);
