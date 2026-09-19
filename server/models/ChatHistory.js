const mongoose = require('mongoose'); 

const ChatHistorySchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  villageId: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  intents: [{ type: String }],
  aiSource: { type: String, default: 'gemini' },
  language: { type: String, default: 'en' }
}, { timestamps: true });

 const ChatHistoryModel = mongoose.model('ChatHistory', ChatHistorySchema);

 module.exports = ChatHistoryModel;
