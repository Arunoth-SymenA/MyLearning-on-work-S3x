import express from "express";

// This will help us connect to the database
import getDB from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const router = express.Router();

// Helper function to check if database is ready
const ensureDbReady = async (req, res, next) => {
  try {
    const db = await getDB();
    if (!db) {
      return res.status(503).json({ error: "Database connection not ready" });
    }
    req.db = db; // Attach db to request object
    next();
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(503).json({ error: "Database connection error" });
  }
};

// This section will help you get a list of all the records.
router.get("/", ensureDbReady, async (req, res) => {
  try {
    let collection = await req.db.collection("records");
    let results = await collection.find({}).toArray();
    res.status(200).send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching records");
  }
});

// This section will help you get a single record by id
router.get("/:id", ensureDbReady, async (req, res) => {
  try {
    let collection = await req.db.collection("records");
    let query = { _id: new ObjectId(req.params.id) };
    let result = await collection.findOne(query);

    if (!result) {
      res.status(404).send("Not found");
    } else {
      res.status(200).send(result);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching record");
  }
});

// This section will help you create a new record.
router.post("/", ensureDbReady, async (req, res) => {
  try {
    let newDocument = {
      name: req.body.name,
      position: req.body.position,
      level: req.body.level,
    };
    let collection = await req.db.collection("records");
    let result = await collection.insertOne(newDocument);
    res.status(201).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding record");
  }
});

// This section will help you update a record by id.
router.patch("/:id", ensureDbReady, async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
      $set: {
        name: req.body.name,
        position: req.body.position,
        level: req.body.level,
      },
    };

    let collection = await req.db.collection("records");
    let result = await collection.updateOne(query, updates);
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating record");
  }
});

// This section will help you delete a record
router.delete("/:id", ensureDbReady, async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };

    const collection = await req.db.collection("records");
    let result = await collection.deleteOne(query);

    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting record");
  }
});

export default router;