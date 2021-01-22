const fs = require('fs').promises;
const path = require('path');
const { parse } = require('json2csv');
const axios = require('axios');
const cheerio = require('cheerio');
const proxyGenerator = require('./modules/proxyGenerator');
const mongoose = require('mongoose');
const AetMotorsport = require('./model/AetMotorsport');
const myData = [];
const baseURL = "https://www.aetmotorsport.com";


/**
 * Connect to mongoDB
 * 
 * @returns {db} database pointer
 */
function connectToMongoDB()
{
    mongoose.connect("mongodb://127.0.0.1:27017/aetmotorsport", { useNewUrlParser: true, useUnifiedTopology: true });
    let db = mongoose.connection;
    db.once('open', () => { console.log("Connected to mongoDB") });
    return db;
}


/**
 * Scrape links from parent page.
 * 
 * @param  {mongoDB} database
 * @param  {String} collectionName
 * @param  {String} url
 * @param  {String} elementTarget
 */
async function scrapePageLinks(database, collectionName, url, elementTarget)
{
    console.log('Scraping parent links...');
    await axios.get(url, { proxy: proxyGenerator() })
    .then( (response) =>
    {
        // console.log(response);
        if(response.status === 200)
        {
            const $ = cheerio.load(response.data);

            // Iterate over menu and log all links.
            $(elementTarget).each((index, element) =>
            {
                // console.log(targetURL +  $(element).attr('href'));

                let newCollection = new AetMotorsport();

                let endPoint = $(element).attr('href');
                let dbElement = baseURL +  endPoint;

                newCollection.url = dbElement;
                
                database.collection(collectionName).insertOne(newCollection);  
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
 * Retrieve the collection from database.
 * 
 * @param  {} database
 * @param  {} collectionName
 */
async function retrieveCollection(database, collectionName)
{ 
    
    database.once('open', () =>
    {
        // Fetch data from collection.
        database.db.collection(collectionName, async(error, collection) =>
        {
            await collection.find({}, { projection: { _id: 0, url: 1 } }).toArray( (error, data) =>
            {
                // console.log(data);
                for (let i = 0; i < data.length; i++)
                {
                    myData.push(data[i].url);
                }
            });
        });
    });

    console.log(myData);
    return myData;

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
//    await scrapePageLinks(database, 'all_menu_links', baseURL, '#AccessibleNav > li > a');

    // Retrieve links from collection.
    // const urls = await retrieveCollection(database, 'all_menu_links');
    // console.log(urls);
    await retrieveCollection(database, 'all_menu_links');
    // Fetch data from database and export to csv file.
    // writeOutCSV(database);

    // This will also exit after 1 seconds, and print its (killed) PID
    setTimeout(( () => { return process.kill(process.pid); }), 1000);
}



main();