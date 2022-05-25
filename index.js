const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const port = process.env.PORT || 5000;

//care-parts
//rx4IuqKGJCYNLaew

//car-parts
//tools

//middel tair

app.use(cors());
app.use(express.json());

//custom middeltair

function veriFyjwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized user" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden" });
    }
    req.decoded = decoded;
    next();
  });
}

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
    const orderCollection = client.db("car-parts").collection("order");
    const reviewCollection = client.db("car-parts").collection("review");
    const userewCollection = client.db("car-parts").collection("users");
    const paymentCollection = client.db("car-parts").collection("paymnet");

    console.log("db connected");

    //tools start
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

    //post api

    app.post("/tools", async (req, res) => {
      const orders = req.body;
      const result = await carCollection.insertOne(orders);
      res.send(result);
    });

    //delete

    app.delete("/tools/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const querry = { _id: ObjectId(id) };
      const result = await carCollection.deleteOne(querry)
      res.send(result);
    });

    //tootls end

    //order start
    //post api order

    app.post("/order", async (req, res) => {
      const orders = req.body;
      const result = await orderCollection.insertOne(orders);
      res.send(result);
    });

    //get api order

    app.get("/order/:email", async (req, res) => {
      const email = req.params;
      const querry = email;
      const authHeader = req.headers.authorization;

      const result = await orderCollection.find(querry).toArray();
      res.send(result);
    });

    //order patch for payment

    app.put('/order/:id', async(req, res) => {
      const id = req.params.id;
      const payment = req.body;
      const options = { upsert: true };
      const filter = {_id: ObjectId(id)};
      const updateDoc = {
        $set: {
          paid: true,
          transactionId : payment.transactionId
        }
      }
      const result = await paymentCollection.insertOne(payment);
      const updatedOrder = await orderCollection.updateOne(filter, updateDoc, options);
      res.send(updateDoc)
    })

    //get order by id

    //get all order

    app.get("/order", async (req, res) => {
      const querry = {};

      const result = await orderCollection.find(querry).toArray();
      res.send(result);
    });

    //delete order

    app.delete("/order/:id", async (req, res) => {
      const { id } = req.params;
      const querry = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(querry);
      res.send(result);
    });

    //order end

    //review start

    //post api

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    //get api

    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.send(result);
    });

    //review end

    //make admin role

    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const querry = { _id: ObjectId(id) };
      const result = await userewCollection.deleteOne(querry)
      res.send(result);
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const options = { upsert: true };
      const filter = { email: email };
      const updateDoc = {
        $set: user,
      };
      const result = await userewCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      res.send({ result, token });
    });

    //make admin

    app.put("/user/admin/:email", veriFyjwt, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const acount = await userewCollection.findOne({ email: requester });
      if (acount.role === "admin") {
        const filter = { email: email };
        const updateDoc = {
          $set: { role: "admin" },
        };
        const result = await userewCollection.updateOne(filter, updateDoc);
        res.send(result);
      } else {
        res.status(403).send({ message: "you are not admin" });
      }
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userewCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });

    //user get api

    app.get("/users", async (req, res) => {
      const result = await userewCollection.find({}).toArray();
      res.send(result);
    });

    app.get("/profile/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const querry = { email: email };

      const result = await userewCollection.find(querry).toArray();
      res.send(result);
    });

    app.put("/profile/:id", async (req, res) => {
      const id = req.params;
      const user = req.body;
      const options = { upsert: true };
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: user,
      };
      const result = await userewCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //payment
    //payment
    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const querry = { _id: ObjectId(id) };

      const result = await orderCollection.findOne(querry);
      res.send(result);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const service = req.body;
      const price = service.total;
      const amount = parseInt(price) * 100;
      console.log("amout", amount);
      if (!isNaN(amount)) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method_types: ["card"],
        });
        res.send({ clientSecret: paymentIntent.client_secret });
      }
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
