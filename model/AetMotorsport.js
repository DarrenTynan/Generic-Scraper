const mongoose = require("mongoose");
const AetMotorsportSchema = new mongoose.Schema({
    url: String,
});

const AetMotorsport = mongoose.model("AetMotorsport", AetMotorsportSchema);

module.exports = AetMotorsport;
