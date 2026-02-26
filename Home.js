import React, { useState } from 'react';
import './Home.css'; // Stil dosyasını aşağıda vereceğim

function Home() {
  // Örnek veri (Normalde bu veriler Admin panelinden eklediğin veritabanından gelecek)
  const [animes, setAnimes] = useState([
    { id: 1, title: "Jujutsu Kaisen", image: "https://via.placeholder.com/200x300", season: 2 },
    { id: 2, title: "Demon Slayer", image: "https://via.placeholder.com/200x300", season: 3 },
    { id: 3, title: "One Piece", image: "https://via.placeholder.com/200x300", season: 1 },
    { id: 4, title: "Naruto", image: "https://via.placeholder.com/200x300", season: 1 },
  ]);

  return (
    <div className="home-container">
      {/* 1. Navigasyon Çubuğu */}
      <nav className="navbar">
        <h1 className="logo">KAIWATCH</h1>
        <div className="nav-links">
          <span>Ana Sayfa</span>
          <span>Diziler</span>
          <span>Filmler</span>
          <span>Listem</span>
        </div>
      </nav>

      {/* 2. Öne Çıkan Anime (Hero Section) */}
      <header className="hero">
        <div className="hero-content">
          <h1>Attack on Titan</h1>
          <p>İnsanlığın devlere karşı verdiği son büyük savaş başlıyor.</p>
          <button className="play-btn">▶ İzle</button>
          <button className="info-btn">ⓘ Daha Fazla Bilgi</button>
        </div>
      </header>

      {/* 3. Anime Satırları (Listeler) */}
      <div className="anime-row">
        <h2>Trend Olanlar</h2>
        <div className="anime-list">
          {animes.map(anime => (
            <div key={anime.id} className="anime-card">
              <img src={anime.image} alt={anime.title} />
              <div className="card-overlay">
                <h4>{anime.title}</h4>
                <p>{anime.season}. Sezon</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;