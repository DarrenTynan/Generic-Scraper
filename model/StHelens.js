const mongoose = require("mongoose");
const StHelensSchema = new mongoose.Schema({
    vin: String,
    make: String,
    model: String,
    year: String,
    trim: String,
    extcolor: String,
    intcolor: String,
    trans: String,
    price: Number,
    vehicleid: Number,
    engine: String,
    fueltype: String,
    vehicletype: String,
    bodystyle: String,
    modelcode: String,
    bodystyle: String,
    modelcode: String,
    msrp: Number,
    name: String,
    cpo: String,
    stocknum: String,
    mpgcity: String,
    mpghwy: String,
});

const StHelens = mongoose.model("StHelens", StHelensSchema);

module.exports = StHelens;
