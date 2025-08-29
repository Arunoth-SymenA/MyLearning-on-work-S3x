import { MongoClient, ServerApiVersion } from "mongodb";

// Use the MongoDB container's IP address
const URI = "mongodb://172.19.0.3:27017";
const client = new MongoClient(URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db = null;

const connectWithRetry = async () => {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
    db = client.db("employees");
    console.log("Database connection established successfully!");
    return db;
  } catch (err) {
    console.error("Failed to connect to MongoDB, retrying in 5 seconds...", err.message);
    // Wait 5 seconds before retrying
    await new Promise(resolve => setTimeout(resolve, 5000));
    return connectWithRetry();
  }
};

// Initialize connection and wait for it to complete
const initializeDB = async () => {
  try {
    const database = await connectWithRetry();
    db = database; // Ensure db variable is set
    console.log("Database initialization complete!");
    return database;
  } catch (err) {
    console.error("Database initialization failed:", err);
    throw err;
  }
};

// Start the connection process and wait for it to complete
const dbPromise = initializeDB();

// Export a function that returns the database connection
const getDB = async () => {
  if (db) {
    return db;
  }
  // Wait for the connection to be established
  return await dbPromise;
};

export default getDB;