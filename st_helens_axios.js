const fs = require('fs').promises;
const path = require('path');
const { parse } = require('json2csv');
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
 * Parse the json from database and convert to csv before writing file.
 * 
 * @param  {mongoDB} database
 */
async function writeOutCSV(database)
{
    // For unique file name.
    const filePath = path.join(__dirname, "/", "exports", "StHelens." + getCurrentTimeStamp() + ".csv");
    // CSV field headers.
    const fields = ['vin', 'make', 'model'];
    // Options to be passed.
    const opts = { fields };

    database.once('open', () =>
    {
        // Fetch data from collection.
        database.db.collection('vehicle', (error, collection) =>
        {
            collection.find({}).toArray( (error, data) =>
            {
                // console.log(data);

                // Attempt to parse json and write file.
                try
                {
                    const csv = parse(data, opts);
                    // console.log(csv);

                    fs.writeFile(filePath, csv, (error) =>
                    {
                        if (error) return console.log('error: ' + error);
                    });

                    console.log('File saved...');
                }
                catch (error)
                {
                    console.error(error);
                }
            });
        });
    });

}


/**
 * Read the file.
 * 
 * @param  {string} filePath
 */
async function readFile(filePath)
{
    try
    {
        const data = await fs.readFile(filePath);
        console.log(data.toString());
    }
    catch (error)
    {
        console.error(`Got an error trying to read the file: ${error.message}`);
    }
}

  
/**
 * Get the current date timestamp.
 * 
 * @returns {string} YYYY-MM-DD.HH:MM:SS
 */
function getCurrentTimeStamp()
{
    let dateObj = new Date();

    // Adjust 0 before single digit date.
    let date = ('0' + dateObj.getDate()).slice(-2);
    let month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    let year = dateObj.getFullYear();
    let hours = dateObj.getHours();
    let minutes = ('0' + dateObj.getMinutes()).slice(-2);
    let seconds = dateObj.getSeconds();

    return date + '-' + month + '-' + year + '.' + hours + ':' + minutes + ':' + seconds;
}


/**
 * Initialisation
 */
async function main()
{
    // Call to connect to database.
    let database = connectToMongoDB();

    // Test function working!
    // readFile('exports/test.txt');

    // Scrape the parent page and store in database.
    await scrapeVehicleListings(database);

    // Fetch data from database and export to csv file.
    writeOutCSV(database);

    // This will also exit after 1 seconds, and print its (killed) PID
    setTimeout(( () => { return process.kill(process.pid); }), 1000);
}



main();