require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Load .env from server/.env or root .env
const serverEnvPath = path.join(__dirname, '..', '.env');
const rootEnvPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(serverEnvPath)) {
  require('dotenv').config({ path: serverEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  require('dotenv').config({ path: rootEnvPath });
}

const listUsers = async () => {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB bağlantısı başarılı!\n');

    // Tüm kullanıcıları getir (şifre hariç)
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    if (users.length === 0) {
      console.log('❌ Hiç kullanıcı bulunamadı.');
      await mongoose.disconnect();
      return;
    }

    // Admin ve normal kullanıcıları ayır
    const admins = users.filter(user => user.isAdmin);
    const normalUsers = users.filter(user => !user.isAdmin);

    console.log('═'.repeat(80));
    console.log('📊 KULLANICI LİSTESİ');
    console.log('═'.repeat(80));
    console.log(`\n📈 Toplam Kullanıcı: ${users.length}`);
    console.log(`👑 Admin Sayısı: ${admins.length}`);
    console.log(`👤 Normal Kullanıcı Sayısı: ${normalUsers.length}\n`);

    // Admin kullanıcıları göster
    if (admins.length > 0) {
      console.log('═'.repeat(80));
      console.log('👑 ADMİN KULLANICILAR');
      console.log('═'.repeat(80));
      admins.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.ad} ${user.soyad} (${user.username})`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🆔 ID: ${user._id}`);
        console.log(`   📅 Kayıt Tarihi: ${new Date(user.createdAt).toLocaleString('tr-TR')}`);
        console.log(`   🌐 Online: ${user.isOnline ? '✅ Evet' : '❌ Hayır'}`);
        if (user.lastSeen) {
          console.log(`   👁️  Son Görülme: ${new Date(user.lastSeen).toLocaleString('tr-TR')}`);
        }
        if (user.unvan) {
          console.log(`   💼 Unvan: ${user.unvan}`);
        }
        if (user.bio) {
          console.log(`   📝 Bio: ${user.bio.substring(0, 50)}${user.bio.length > 50 ? '...' : ''}`);
        }
      });
    }

    // Normal kullanıcıları göster
    if (normalUsers.length > 0) {
      console.log('\n\n' + '═'.repeat(80));
      console.log('👤 NORMAL KULLANICILAR');
      console.log('═'.repeat(80));
      normalUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.ad} ${user.soyad} (${user.username})`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🆔 ID: ${user._id}`);
        console.log(`   📅 Kayıt Tarihi: ${new Date(user.createdAt).toLocaleString('tr-TR')}`);
        console.log(`   🌐 Online: ${user.isOnline ? '✅ Evet' : '❌ Hayır'}`);
        if (user.lastSeen) {
          console.log(`   👁️  Son Görülme: ${new Date(user.lastSeen).toLocaleString('tr-TR')}`);
        }
        if (user.unvan) {
          console.log(`   💼 Unvan: ${user.unvan}`);
        }
        if (user.bio) {
          console.log(`   📝 Bio: ${user.bio.substring(0, 50)}${user.bio.length > 50 ? '...' : ''}`);
        }
      });
    }

    console.log('\n' + '═'.repeat(80));
    console.log('✅ Liste tamamlandı!');
    console.log('═'.repeat(80) + '\n');

    // Bağlantıyı kapat
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
};

// Script'i çalıştır
listUsers();

