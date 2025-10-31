const mongoose = require('mongoose');

const authoritySchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true }
});

module.exports = mongoose.model('Authority', authoritySchema);


