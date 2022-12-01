//Username Oliver
//To the TA reading this....steal my password and I will find you
//Password QbNvFsf7HvC9Rb9s


const {MongoClient} = require("mongodb");

// Connection URI
const uri =
    "mongodb+srv://Oliver:QbNvFsf7HvC9Rb9s@cluster0.r8myo9l.mongodb.net/?retryWrites=true&w=majority";

// Create a new MongoClient
const client = new MongoClient(uri);

async function run() {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Establish and verify connection
    await client.db("stock").command({ping: 1});
    console.log("Connected successfully to server");
}

//insert function
async function insert(name, ticker) {

    //select right collection/db
    const database = client.db("stock");
    const equities = database.collection("equities");
    //make a new doc
    const doc = {
        name: name,
        ticker: ticker,
    }
    //insert it
    const result = await equities.insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);

}

//read data from csv
async function readData() {
    //conenct to db
    await run()


    //get file
    var fs = require('fs'),
        path = './companies.csv';

    //read file
    await fs.readFile(path, {encoding: 'utf-8'}, async function (err, data) {
        var array = data.split("\n");
        for (let i = 1; i < array.length; i++) {
            var line = array[i].split(",")
            console.log(line)
            //insert the line
            await insert(line[0], line[1])
        }
        await client.close();

    });
}
//run it all
readData()




