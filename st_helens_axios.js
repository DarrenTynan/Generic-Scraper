const axios = require('axios');
const cheerio = require('cheerio');
const proxyGenerator = require("./modules/proxyGenerator");
const mongoose = require('mongoose');
const StHelens = require('./model/StHelens');

const targetURL = "https://www.sthelenschryslerdodgejeepram.com/cars-for-sale-warren-or.html";

/**
 * Connect to mongoDB
 * 
 * @returns {db} database pointer
 */
function connectToMongoDB()
{
    mongoose.connect("mongodb://127.0.0.1:27017/sthelens", { useNewUrlParser: true, useUnifiedTopology: true });
    let db = mongoose.connection;
    db.once('open', () => { console.log("Connected to mongoDB") });
    return db;
}


/**
 * Scrape vehicle listing from parent page.
 * 
 * @param  {mongoDB} database
 */
async function scrapeVehicleListings(database)
{
    console.log('Scraping vehicle listings...');
    await axios.get(targetURL, { proxy: proxyGenerator() })
    .then( (response) =>
    {
        // console.log(response);
        if(response.status === 200)
        {
            const $ = cheerio.load(response.data);

            // Iterate over car section on page and log data elements.
            $('.row.srpVehicle.hasVehicleInfo').each((index, element) =>
            {
                let newCollection = new StHelens();
                scrapeVehicleDetails($, newCollection);
                
                database.collection('vehicle').insertOne(newCollection);  
            });

        }
        else
        {
            console.log("Response error: " + response.status);
        }
    })
    .catch( (error) =>
    {
        // Handle error.
        console.log("Error scraping site: " + error);
    });
}


/**
 * Scrape the vehicle details from parent page.
 * 
 * @param  {cheerio} $
 * @param  {model} collection
 */
function scrapeVehicleDetails($, collection)
{
    $('.row.srpVehicle.hasVehicleInfo').map( (index, element) =>
    {
        collection.vin = $(element).data().vin;
        collection.make = $(element).data().make;
        collection.model = $(element).data().model;
        collection.year = $(element).data().year;
        collection.trim = $(element).data().trim;
        collection.extcolor = $(element).data().extcolor;
        collection.intcolor = $(element).data().intcolor;
        collection.trans = $(element).data().trans;
        collection.price = $(element).data().price;
        collection.vehicleid = $(element).data().vehicleid;
        collection.engine = $(element).data().engine;
        collection.fueltype = $(element).data().fueltype;
        collection.vehicletype = $(element).data().vehicletype;
        collection.bodystyle = $(element).data().bodystyle;
        collection.modelcode = $(element).data().modelcode;
        collection.msrp = $(element).data().msrp;
        collection.name = $(element).data().name;
        collection.cpo = $(element).data().cpo;
        collection.stocknum = $(element).data().stocknum;
        collection.mpgcity = $(element).data().mpgcity;
        collection.mpghwy = $(element).data().mpghwy;
    });
    
}


/**
 * Initialisation
 */
async function main()
{
    // Call to connect to database.
    let database = connectToMongoDB();

    // Scrape the parent page.
    // await scrapeVehicleListings(database);

    // This will also exit after 1 seconds, and print its (killed) PID
    setTimeout(( () => { return process.kill(process.pid); }), 1000);
}



main();