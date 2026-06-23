const mongoose = require('mongoose');
const { getStore, setStore } = require('./store');

const StoreSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: Object
});

const StoreModel = mongoose.models.Store || mongoose.model('Store', StoreSchema);

const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, '..', 'data.json');

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.log("⚠️ MONGODB_URI not found. Running in local file mode.");
    try {
      if (fs.existsSync(DATA_FILE)) {
        const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
        setStore(JSON.parse(rawData));
        console.log("📥 Loaded store state from local data.json.");
      } else {
        fs.writeFileSync(DATA_FILE, JSON.stringify(getStore()));
        console.log("🌱 Created new initial store in local data.json.");
      }
    } catch (err) {
      console.error("❌ Local file DB error:", err);
    }
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB Atlas!");
    
    // Load store from DB into memory
    let doc = await StoreModel.findOne({ key: 'main' });
    if (doc && doc.data) {
      setStore(doc.data);
      console.log("📥 Loaded store state from MongoDB.");
    } else {
      // Initialize with default memory state
      const initial = getStore();
      await StoreModel.create({ key: 'main', data: initial });
      console.log("🌱 Created new initial store in MongoDB.");
    }
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

async function syncStoreToDB() {
  const currentData = getStore();
  if (!process.env.MONGODB_URI) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2));
    } catch (err) {
      console.error("❌ Failed to sync store to local data.json:", err);
    }
    return;
  }
  try {
    await StoreModel.updateOne(
      { key: 'main' },
      { data: currentData },
      { upsert: true }
    );
  } catch (err) {
    console.error("❌ Failed to sync store to MongoDB:", err);
  }
}

module.exports = { connectDB, syncStoreToDB };
