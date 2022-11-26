var http = require('http');
var fs = require('fs');
var qs = require('querystring');
const {MongoClient} = require("mongodb");
const uri = "mongodb+srv://Oliver:QbNvFsf7HvC9Rb9s@cluster0.r8myo9l.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

http.createServer(async function (req, res) {

    if (req.url === "/") {
        file = 'index.html';
        fs.readFile(file, function (err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(txt);
            res.end();
        });
    } else if (req.url === "/process") {
        await connect();
        file = 'result.html';
        fs.readFile(file, async function (err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(txt);
            pdata = "";
            req.on('data', data => {
                pdata += data.toString();
            });
            req.on('end', () => {
                pdata = qs.parse(pdata);
                search(pdata['the_name'], res, pdata['user'] === "company");
            });
        });


    } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write("Unknown page request");
        res.end();
    }


}).listen(8080);


function search(query, res, comp) {
    const database = client.db("stock");
    const equities = database.collection("equities");

    equities.find(comp ? {"name": query} : {"ticker": query + "\r"}).toArray(async function (err, result) {
        if (err) throw err;

        console.log(result)

        if (result.length === 0) {
            res.write("No results for: " + query)
        }

        await client.close();
        for (let i = 0; i < result.length; i++) {
            res.write("Name: " + result[i].name);
            res.write("-----Ticker: " + result[i].ticker);
            res.write("<br>")
        }

        res.end();
    });

}

async function connect() {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Establish and verify connection
    await client.db("stocks").command({ping: 1});
    console.log("Connected successfully to server");
}