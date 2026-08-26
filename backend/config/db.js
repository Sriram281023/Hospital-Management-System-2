const mongoose = require("mongoose");

// Connect with retries and clearer error guidance for SRV (Atlas) DNS issues
const connectDB = async (retries = 5, delay = 5000) => {
  const uri = process.env.MONGO_URI || process.env.MONGO_URI_FALLBACK || "mongodb://127.0.0.1:27017/hospital_management";

  try {
    const conn = await mongoose.connect(uri, {
      // Mongoose v6+ sets sensible defaults; options kept here for clarity
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);

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
  2) Try switching your DNS to 8.8.8.8 or 1.1.1.1 and re-run the server.
  3) In Atlas, add your IP under Network Access (or use 0.0.0.0/0 for testing).
  4) If SRV lookups are blocked, use a non-SRV connection string (mongodb://) — Atlas can provide one under Connect → Drivers → "Standard connection string (mongodb://)".
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
