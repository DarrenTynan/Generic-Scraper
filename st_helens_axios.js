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


async function scrapeVehicleListings()
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
    });
}

//////////////////////////////////////////
async function axiosTest()
{
    try
    {
        const { data:response } = await axios.get(url, { proxy: proxyGenerator() })
        return response;
    }
    catch (error)
    {
        console.log("Error scraping site: " + error);
    }
}

function scrapeVehicleDetails(response)
{
    const $ = cheerio.load(response);

    console.log("length: " + response.length);

    // const details = $('.row.srpVehicle.hasVehicleInfo').map( (index, element) =>
    // {
    //     const vin = $(element).data().vin;
    //     const make = $(element).data().make;
    //     const model = $(element).data().model;
    //     const year = $(element).data().year;
    //     const trim = $(element).data().trim;
    //     const extcolor = $(element).data().extcolor;
    //     const intcolor = $(element).data().intcolor;
    //     const trans = $(element).data().trans;
    //     const price = $(element).data().price;
    //     const vehicleid = $(element).data().vehicleid;
    //     const engine = $(element).data().engine;
    //     const fueltype = $(element).data().fueltype;
    //     const vehicletype = $(element).data().vehicletype;
    //     const bodystyle = $(element).data().bodystyle;
    //     const modelcode = $(element).data().modelcode;
    //     const msrp = $(element).data().msrp;
    //     const name = $(element).data().name;
    //     const cpo = $(element).data().cpo;
    //     const stocknum = $(element).data().stocknum;
    //     const mpgcity = $(element).data().mpgcity;
    //     const mpghwy = $(element).data().mpghwy;
    
    //     return { vin, make, model, year, trim, extcolor, intcolor, trans, price, vehicleid, engine, fueltype, vehicletype, bodystyle, modelcode, msrp, name, cpo, stocknum, mpgcity, mpghwy };
    // });
    
    // return details;
    
}
//////////////////////////////////////////

/**
 * Initialisation
 */
async function main()
{
    // Call to connect to database.
    // await connectToMongoDB();
    // await scrapeVehicleListings();
    // const collection = new StHelens();

    const response = await axiosTest();
    // console.log(response);

    // scrapeVehicleDetails(response);

    // This will also exit after 1 seconds, and print its (killed) PID
    setTimeout(( () => { return process.kill(process.pid); }), 1000);
}



main();