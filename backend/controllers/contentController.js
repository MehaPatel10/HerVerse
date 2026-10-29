const Blog = require('../models/Blog');
const Faq = require('../models/Faq');

function pick(body, fields) {
  const out = {};
  fields.forEach((f) => { if (body[f] !== undefined) out[f] = body[f]; });
  return out;
}

// ---- Public ----
async function listPublishedBlogs(req, res) {
  res.json(await Blog.find({ isPublished: true }).sort({ createdAt: -1 }).limit(100));
}
async function listPublishedFaqs(req, res) {
  res.json(await Faq.find({ isPublished: true }).sort({ sortOrder: 1, createdAt: 1 }).limit(100));
}

// ---- Admin ----
async function listBlogsAdmin(req, res) {
  res.json(await Blog.find().sort({ createdAt: -1 }));
}
async function createBlog(req, res) {
  const { title, content } = req.body;
  if (!title || !title.trim() || !content || !content.trim()) return res.status(400).json({ message: 'title and content are required' });
  res.status(201).json(await Blog.create(pick(req.body, ['title', 'tag', 'blurb', 'content', 'isPublished'])));
}
async function updateBlog(req, res) {
  const item = await Blog.findByIdAndUpdate(req.params.id, pick(req.body, ['title', 'tag', 'blurb', 'content', 'isPublished']), { new: true });
  if (!item) return res.status(404).json({ message: 'Blog not found' });
  res.json(item);
}
async function deleteBlog(req, res) {
  const item = await Blog.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Blog not found' });
  res.json({ message: 'Deleted' });
}

async function listFaqsAdmin(req, res) {
  res.json(await Faq.find().sort({ sortOrder: 1, createdAt: 1 }));
}
async function createFaq(req, res) {
  const { question, answer } = req.body;
  if (!question || !question.trim() || !answer || !answer.trim()) return res.status(400).json({ message: 'question and answer are required' });
  const count = await Faq.countDocuments();
  res.status(201).json(await Faq.create({ ...pick(req.body, ['question', 'answer', 'isPublished']), sortOrder: count + 1 }));
}
async function updateFaq(req, res) {
  const item = await Faq.findByIdAndUpdate(req.params.id, pick(req.body, ['question', 'answer', 'isPublished', 'sortOrder']), { new: true });
  if (!item) return res.status(404).json({ message: 'FAQ not found' });
  res.json(item);
}
async function deleteFaq(req, res) {
  const item = await Faq.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'FAQ not found' });
  res.json({ message: 'Deleted' });
}

module.exports = {
  listPublishedBlogs, listPublishedFaqs,
  listBlogsAdmin, createBlog, updateBlog, deleteBlog,
  listFaqsAdmin, createFaq, updateFaq, deleteFaq
};
