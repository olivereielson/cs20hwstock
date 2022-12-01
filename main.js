
//define the vars
var http = require('http');
var fs = require('fs');
var qs = require('querystring');
const {MongoClient} = require("mongodb");
const uri = "mongodb+srv://Oliver:QbNvFsf7HvC9Rb9s@cluster0.r8myo9l.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);


//crete the http server
http.createServer(async function (req, res) {

    //set up the landing page
    if (req.url === "/") {
        file = 'index.html';
        //read in index.html file
        fs.readFile(file, function (err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(txt);
            res.end();
        });
        //set up the results page and process data
    } else if (req.url === "/process") {
        //connect to mongo
        await connect();
        file = 'result.html';
        //read in result.html file
        fs.readFile(file, async function (err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(txt);
            //get user input
            pdata = "";
            req.on('data', data => {
                pdata += data.toString();
            });

            req.on('end', () => {
                //parse user input
                pdata = qs.parse(pdata);
                //search for it in the db
                search(pdata['the_name'], res, pdata['user'] === "company");
            });
        });


    } else {
        //if something goes wrong
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write("Unknown page request");
        res.end();
    }


}).listen(8080);


// search db function
function search(query, res, comp) {
    //set up vars
    const database = client.db("stock");
    const equities = database.collection("equities");

    //either search for a name or a ticker
    equities.find(comp ? {"name": query} : {"ticker": query + "\r"}).toArray(async function (err, result) {
        if (err) throw err;

        console.log(result)

        //if no results tell the user they are stupid
        if (result.length === 0) {
            res.write("No results for: " + query)
        }

        //close the connection
        await client.close();
        //add the data to the page
        for (let i = 0; i < result.length; i++) {
            res.write("Name: " + result[i].name);
            res.write("-----Ticker: " + result[i].ticker);
            res.write("<br>")
        }
        //finish making the page
        res.end();
    });

}


//connect to db function
async function connect() {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Establish and verify connection
    await client.db("stocks").command({ping: 1});
    console.log("Connected successfully to server");
}