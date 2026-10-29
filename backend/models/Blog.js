const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    tag: { type: String, default: 'Wellness', trim: true },
    blurb: { type: String, default: '', trim: true }, // short summary shown on the card
    content: { type: String, required: true }, // full article text
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
