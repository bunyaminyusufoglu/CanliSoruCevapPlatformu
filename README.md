# Canlı Soru-Cevap Platformu

Canlı ders ve soru-cevap platformu, öğrenciler ve öğretmenler için gerçek zamanlı etkileşim imkanı sunan bir web uygulaması.

## Özellikler

- Kullanıcı kimlik doğrulama ve yetkilendirme
- Canlı ders yayınları
- Gerçek zamanlı soru-cevap
- Bildirim sistemi
- Ders kayıtları ve arşiv
- Mesajlaşma sistemi

## Teknolojiler

- Backend: Node.js, Express.js
- Frontend: React.js
- Veritabanı: MongoDB
- Gerçek zamanlı iletişim: Socket.io
- Kimlik doğrulama: JWT

## Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/yourusername/canli-soru-cevap-platformu.git
cd canli-soru-cevap-platformu
```

2. Bağımlılıkları yükleyin:
```bash
# Backend bağımlılıkları
npm install

# Frontend bağımlılıkları
cd client
npm install
```

3. `.env` dosyasını oluşturun:
```bash
cp .env.example .env
# .env dosyasını düzenleyin
```

4. MongoDB'yi başlatın:
```bash
# MongoDB'nin yüklü ve çalışır durumda olduğundan emin olun
```

5. Uygulamayı başlatın:
```bash
# Geliştirme modu (backend + frontend)
npm run dev:full

# Sadece backend
npm run dev

# Sadece frontend
npm run client
```

## API Dokümantasyonu

API endpoint'leri ve kullanımları için [API.md](API.md) dosyasına bakın.

## Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.
