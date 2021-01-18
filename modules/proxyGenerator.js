/**
 * You need to run OpenVPN before you scrape from sslproxies.org
 */
const request = require('request-promise');
const cheerio = require('cheerio');

function proxyGenerator() {
    let ip = [];
    let port = [];
    let proxy;

    request("https://sslproxies.org/", function (error, response, html)
    {
        if (! error && response.statusCode == 200) {
            const $ = cheerio.load(html);

            $("td:nth-child(1)").each(function (index, value) {
                ip[index] = $(this).text();
            });

            $("td:nth-child(2)").each(function (index, value) {
                port[index] = $(this).text();
            });
        }
        else
        {
            console.log("Error loading proxy, please try again");
        } 
        
        ip.join(", ");
        port.join(", ");

        // console.log("IP Addresses:", ip);
        // console.log("Port Numbers:", port);

        // Generate random int between 1 and 100.
        let randomNumber = Math.floor(Math.random() * 100);

        // console.log(ip[randomNumber]);
        // console.log(port[randomNumber]);

        let proxy = `http://${ip[randomNumber]}:${port[randomNumber]}`;

        console.log("Proxy: " + proxy);

    });
}

module.exports = proxyGenerator;
