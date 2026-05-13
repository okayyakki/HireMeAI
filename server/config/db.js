import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const resolveSrv = (host) =>
  new Promise((resolve, reject) => {
    dns.resolveSrv(`_mongodb._tcp.${host}`, (err, addresses) => {
      if (err) reject(err);
      else resolve(addresses.sort((a, b) => a.priority - b.priority).map(a => `${a.name}:${a.port}`));
    });
  });

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error("MONGO_URI not set in environment");
      process.exit(1);
    }

    const srvMatch = mongoUri.match(/^mongodb\+srv:\/\/(.+@)?(.+?)(\/.*)?$/);
    if (srvMatch) {
      const hosts = await resolveSrv(srvMatch[2]);
      const creds = srvMatch[1] || "";
      const dbPath = srvMatch[3] || "";
      const queryChar = dbPath.includes("?") ? "&" : "?";
      mongoUri = `mongodb://${creds}${hosts.join(",")}${dbPath}${queryChar}ssl=true&authSource=admin`;
    }

    await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`MongoDB connection failed - ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;