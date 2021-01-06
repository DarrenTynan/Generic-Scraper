const axios = require('axios');
const cheerio = require('cheerio');
const proxyGenerator = require("./modules/proxyGenerator");
const mongoose = require('mongoose');
const StHelens = require('./model/StHelens');
const { collection } = require('./model/StHelens');

const url = "https://www.sthelenschryslerdodgejeepram.com/cars-for-sale-warren-or.html";

/**
 * Connect to mongoDB
 */
async function connectToMongoDB()
{
    await mongoose.connect("mongodb://127.0.0.1:27017/sthelens", { useNewUrlParser: true });
    console.log("Connected to mongo");
}

async function scrapeVehicleListings(collection)
{
    axios.get(url, { proxy: proxyGenerator() })
    .then( (response) =>
    {
        // handle success
        // console.log(response);
        if(response.status === 200)
        {
            const $ = cheerio.load(response.data);

            // Iterate over car section on page and log data elements.
            $('.row.srpVehicle.hasVehicleInfo').each((index, element) =>
            {
                console.log($(element).data().name);
            });
        }
    })
    .catch( (error) =>
    {
        // Handle error.
        console.log("Error scraping site: " + error);
    })
    .then( () =>
    {
        // Always executed.
    });

}

/**
 * Initialisation
 */
async function main()
{
    // Call to connect to database.
    await connectToMongoDB();
    const collection = new StHelens();
    await scrapeVehicleListings(collection);

    // This will also exit after 1 seconds, and print its (killed) PID
    setTimeout(( () => { return process.kill(process.pid); }), 1000);
}



main();