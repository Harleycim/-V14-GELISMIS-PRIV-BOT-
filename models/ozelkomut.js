const mongoose = require('mongoose');

const OzelKomutSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  roleId: { type: String, required: true }
});

module.exports = mongoose.model('OzelKomut', OzelKomutSchema);
