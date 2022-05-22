const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

//care-parts
//rx4IuqKGJCYNLaew

//car-parts
//tools

//middel tair

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.3mesu.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const carCollection = client.db("car-parts").collection("tools");
    console.log("db connected");

    //get tools

    app.get("/tools", async (req, res) => {
      const result = await carCollection.find({}).toArray();
      res.send(result);
    });

    //get by id

    app.get("/tools/:id", async (req, res) => {
      const id = req.params;
      console.log(id);
      const querry = { _id: ObjectId(id) };
      const result = await carCollection.find(querry).toArray();
      res.send(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello ami calu aci");
});

app.listen(port, () => {
  console.log(`ami calu aci ${port}`);
});
