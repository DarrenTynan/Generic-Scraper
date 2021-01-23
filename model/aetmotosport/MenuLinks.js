let mongoose = require("mongoose");

let menuLinksSchema = new mongoose.Schema({
    url: String,
});

module.exports = mongoose.model("MenuLinks", menuLinksSchema);
