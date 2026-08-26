const mongoose = require("mongoose");

// Connect with retries and clearer error guidance for SRV (Atlas) DNS issues
const connectDB = async (retries = 5, delay = 5000) => {
  const uri = process.env.MONGO_URI || process.env.MONGO_URI_FALLBACK || "mongodb://127.0.0.1:27017/hospital_management";
  const nonSrvEnv = process.env.MONGO_URI_STANDARD || process.env.MONGO_URI_NON_SRV || process.env.MONGO_URI_FALLBACK;

  try {
    const conn = await mongoose.connect(uri, {
      // Mongoose v6+ sets sensible defaults; options kept here for clarity
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return;
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);

    // If SRV lookup failed and a non-SRV connection string is provided via env, try it immediately
    if (err.message && err.message.includes("querySrv") && uri.startsWith("mongodb+srv://") && nonSrvEnv && !nonSrvEnv.startsWith("mongodb+srv://")) {
      console.log("Detected SRV/DNS error and found a non-SRV fallback in environment — attempting non-SRV connection...");
      try {
        const conn2 = await mongoose.connect(nonSrvEnv, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log(`✅ MongoDB Connected using non-SRV string: ${conn2.connection.host}/${conn2.connection.name}`);
        return;
      } catch (e2) {
        console.error(`❌ Non-SRV fallback connection failed: ${e2.message}`);
        // continue to the normal retry flow below
      }
    }

    // Helpful guidance for common DNS SRV errors from Atlas
    if (err.message && err.message.includes("querySrv") && uri.startsWith("mongodb+srv://")) {
      console.error(`
  Possible causes:
  - The Atlas cluster host in MONGO_URI is misspelled.
  - Your network or DNS is blocking SRV lookups.
  - Your IP isn't whitelisted in Atlas Network Access.

  Suggestions:
  1) Verify MONGO_URI in backend/.env (or your environment). Example (replace credentials):
     mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/hospital_management
  2) If SRV/DNS lookups are blocked, set a non-SRV connection string from Atlas in MONGO_URI_STANDARD (or MONGO_URI_NON_SRV) and restart the server. Example:
     mongodb://host1:27017,host2:27017,host3:27017/hospital_management?replicaSet=atlas-xxxxx&authSource=admin&retryWrites=true&w=majority
  3) Try switching your DNS to 8.8.8.8 or 1.1.1.1 and re-run the server.
  4) In Atlas, add your IP under Network Access (or use 0.0.0.0/0 for testing).
  5) As a temporary local fallback, set MONGO_URI to mongodb://127.0.0.1:27017/hospital_management and run a local MongoDB instance.
      `);
    }

    if (retries > 0) {
      console.log(`Retrying MongoDB connection in ${Math.round(delay/1000)}s... (${retries} attempts left)`);
      await new Promise((res) => setTimeout(res, delay));
      return connectDB(retries - 1, Math.min(delay * 2, 30000));
    }

    console.error("Failed to connect to MongoDB after multiple attempts.");
    console.error("If you intended to use a local MongoDB instance, make sure it's running and MONGO_URI is set accordingly.");

    // Exit process to avoid running without a database (optional)
    process.exit(1);
  }
};

module.exports = connectDB;
