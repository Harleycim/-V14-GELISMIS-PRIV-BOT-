const mongoose = require('mongoose');

const snipeSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  message: {
    content: String,
    authorId: String,
    authorTag: String,
    authorAvatar: String,
    timestamp: Date
  }
});


const Snipe = mongoose.models.Snipe || mongoose.model('Snipe', snipeSchema);

module.exports = Snipe;
