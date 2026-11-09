const dns = require('dns');

// Configure reliable DNS servers to prevent Windows querySrv ECONNREFUSED with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Use system default if setting custom servers is restricted
}

const mongoose = require('mongoose');
const mongooseModels = require('../models/mongooseModels');
const storageEngine = require('./storageEngine');

let useMongo = false;

function getSanitizedHost(uri) {
  try {
    if (!uri) return 'localhost';
    const atIndex = uri.lastIndexOf('@');
    if (atIndex !== -1) {
      const hostSection = uri.slice(atIndex + 1);
      const slashIndex = hostSection.indexOf('/');
      return slashIndex !== -1 ? hostSection.slice(0, slashIndex) : hostSection.split('?')[0];
    }
    const protoIndex = uri.indexOf('://');
    if (protoIndex !== -1) {
      const withoutProto = uri.slice(protoIndex + 3);
      const slashIndex = withoutProto.indexOf('/');
      return slashIndex !== -1 ? withoutProto.slice(0, slashIndex) : withoutProto.split('?')[0];
    }
    return uri.split('/')[0];
  } catch (err) {
    return 'mongodb-host';
  }
}

async function connectDB() {
  let mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/neighbourhelp';
  
  // Ensure database name is set if missing from SRV root
  if (mongoURI.includes('mongodb.net/') && !mongoURI.split('mongodb.net/')[1].split('?')[0]) {
    mongoURI = mongoURI.replace('mongodb.net/', 'mongodb.net/neighbourhelp');
  }

  const host = getSanitizedHost(mongoURI);
  
  try {
    console.log(`[Database] Attempting connection to MongoDB host: ${host}...`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[Database] Successfully connected to MongoDB database (${host}) via Mongoose.`);
    useMongo = true;
  } catch (err) {
    console.error(`\n======================================================`);
    console.error(`[Database CRITICAL ERROR] MongoDB Connection Failed!`);
    console.error(`Host: ${host}`);
    console.error(`Reason: ${err.message}`);
    console.error(`Check network access (IP Whitelist), credentials in server/.env.`);
    console.error(`======================================================\n`);

    if (process.env.STRICT_DB === 'true') {
      throw new Error(`MongoDB connection failed: ${err.message}`);
    }

    console.warn(`[Database WARNING] Operating in fallback offline mode using server/data/db.json. Real MongoDB Atlas was NOT reachable.`);
    useMongo = false;
  }
}

function getModels() {
  if (useMongo) {
    return {
      ...mongooseModels,
      isMongo: true
    };
  } else {
    return {
      User: storageEngine.User,
      Request: storageEngine.Request,
      VolunteerOffer: storageEngine.VolunteerOffer,
      Notification: storageEngine.Notification,
      Report: storageEngine.Report,
      isMongo: false
    };
  }
}

module.exports = {
  connectDB,
  getModels,
  get isMongo() {
    return useMongo;
  }
};
