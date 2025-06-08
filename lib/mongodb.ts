import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const options: MongoClientOptions = {
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

// Create a new MongoClient instance
const client = new MongoClient(uri, options);

// Variable to track connection state
let isConnected = false;

// Function to ensure connection
async function ensureConnection() {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      isConnected = false;
      throw error;
    }
  }
  return client;
}

// Export the connectToDatabase function
export const connectToDatabase = async () => {
  try {
    const connectedClient = await ensureConnection();
    return connectedClient;
  } catch (error) {
    console.error('Error in connectToDatabase:', error);
    throw error;
  }
};

// Handle application shutdown
process.on('SIGINT', async () => {
  if (isConnected) {
    await client.close();
    isConnected = false;
    console.log('MongoDB connection closed');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (isConnected) {
    await client.close();
    isConnected = false;
    console.log('MongoDB connection closed');
  }
  process.exit(0);
}); 