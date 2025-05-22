const mongoose = require('mongoose');
const connectDB = async (retryCount = 0) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB bağlantısı başarılı!");
  } catch (err) {
    console.error("❌ MongoDB bağlantı hatası:", err.message);
    if (retryCount < 5) {
      console.log(`Yeniden deneniyor... (${retryCount + 1}/5)`);
      setTimeout(() => connectDB(retryCount + 1), 3000);
    } else {
      console.error("MongoDB bağlantısı 5 kez denendi ve başarısız oldu. Lütfen MongoDB servisinin çalıştığından emin olun.");
      process.exit(1);
    }
  }
};

module.exports = connectDB;