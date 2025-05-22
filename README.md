# CanliSoruCevapPlatformu
Canlı yayın ve anlık soru-cevap destekli eğitim platformu.

## MongoDB Kurulumu ve Başlatılması

1. MongoDB'nin kurulu olduğundan emin olun. [MongoDB Community Download](https://www.mongodb.com/try/download/community)
2. MongoDB servisini başlatın:
   - Windows: `net start MongoDB`
   - macOS/Linux: `mongod` veya `brew services start mongodb-community`
   - Docker: `docker run -d -p 27017:27017 --name mongo mongo`
3. `.env` dosyanızda şu satır olduğundan emin olun:
   ```
   MONGO_URI=mongodb://localhost:27017/canlisoru
   ```

## Projeyi Başlatma

1. Sunucuyu başlatın:
   ```
   cd server
   npm install
   npm start
   ```
2. Frontend'i başlatın:
   ```
   cd client
   npm install
   npm start
   ```
