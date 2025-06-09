const mongoose = require('mongoose');

const AfkSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  guildId: { type: String, required: true },
  reason: { type: String, default: 'AFK' },
  startedAt: { type: Date, default: Date.now },
  oldNickname: { type: String }
});

module.exports = mongoose.model('Afk', AfkSchema);
