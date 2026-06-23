const mongoose = require('mongoose');
const { getStore, setStore } = require('./store');

const StoreSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: Object
});

const StoreModel = mongoose.models.Store || mongoose.model('Store', StoreSchema);

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.log("⚠️ MONGODB_URI not found. Running in volatile memory mode.");
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
  if (!process.env.MONGODB_URI) return;
  try {
    const currentData = getStore();
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
