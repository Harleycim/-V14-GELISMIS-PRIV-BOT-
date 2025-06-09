const mongoose = require('mongoose');

const engelAyar = new mongoose.Schema({
  guildID: String,
  resimEngel: { type: Boolean, default: false },
  urlEngel: { type: Boolean, default: false }
});

module.exports = mongoose.model("EngelAyar", engelAyar);
