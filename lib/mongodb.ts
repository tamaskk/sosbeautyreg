// import { MongoClient, MongoClientOptions } from "mongodb";

// if (!process.env.MONGODB_URI) {
//   throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
// }

// const uri = process.env.MONGODB_URI;
// const options: MongoClientOptions = {
//   ssl: true,
//   tls: true,
//   tlsAllowInvalidCertificates: false,
//   tlsAllowInvalidHostnames: false,
//   maxPoolSize: 10,
//   minPoolSize: 5,
//   maxIdleTimeMS: 60000,
//   connectTimeoutMS: 10000,
//   socketTimeoutMS: 45000,
// };

// // This is needed because in development we don't want to restart
// // the server with every change, but we want to make sure we don't
// // create a new connection to the DB with every change either.
// // In production we'll have a single connection to the DB.
// declare global {
//   var _mongoClientPromise: Promise<MongoClient> | undefined;
// }

// let client: MongoClient;
// let clientPromise: Promise<MongoClient>;

// if (process.env.NODE_ENV === 'development') {
//   // In development mode, use a global variable so that the value
//   // is preserved across module reloads caused by HMR (Hot Module Replacement).
//   if (!global._mongoClientPromise) {
//     client = new MongoClient(uri, options);
//     global._mongoClientPromise = client.connect();
//   }
//   clientPromise = global._mongoClientPromise;
// } else {
//   // In production mode, it's best to not use a global variable.
//   client = new MongoClient(uri, options);
//   clientPromise = client.connect();
// }

// // Export a module-scoped MongoClient promise. By doing this in a
// // separate module, the client can be shared across functions.
// export default clientPromise;

// export async function connectToDatabase() {
//   try {
//     const client = await clientPromise;
//     // Ping the database to verify the connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Connected successfully to MongoDB.");
//     return client;
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//     throw error;
//   }
// }

// // Handle application shutdown
// process.on('SIGINT', async () => {
//   if (client) {
//     await client.close();
//     console.log('MongoDB connection closed');
//   }
//   process.exit(0);
// });

// process.on('SIGTERM', async () => {
//   if (client) {
//     await client.close();
//     console.log('MongoDB connection closed');
//   }
//   process.exit(0);
// }); 

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || '';

export const connectToDatabase = async () => {
    const client = await MongoClient.connect(
      uri
    );
    return client;
  };