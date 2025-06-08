import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;

export const connectToDatabase = async () => {
  const client = await MongoClient.connect(
    uri
  );  
  return client;
}; 