let mongoose = require("mongoose");

let aetMotorsportSchema = new mongoose.Schema({
    url: String,
});

module.exports = mongoose.model("AetMotorsport", aetMotorsportSchema);
