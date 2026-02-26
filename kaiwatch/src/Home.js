import React from 'react';

function Home({ hero, animeList, onWatch, history = [], onRemoveHistory }) {
  return (
    <div className="home">
      {/* ÖNE ÇIKAN AFİŞ (HERO) */}
      <header className="hero" style={{backgroundImage: `linear-gradient(to right, #141414 10%, transparent), url(${hero.img})`}}>
        <div className="hero-content">
          <h1 style={{fontSize: '4rem', marginBottom: '10px'}}>{hero.title}</h1>
          <p style={{fontSize: '1.2rem', maxWidth: '600px', marginBottom: '20px'}}>{hero.desc}</p>
          <div style={{display: 'flex', gap: '10px'}}>
            <button className="btn-red" onClick={() => onWatch(hero)}>▶ Oynat</button>
            <button className="btn-gray" style={{background: 'rgba(109, 109, 110, 0.7)', color: 'white'}}>ⓘ Daha Fazla Bilgi</button>
          </div>
        </div>
      </header>

      {/* İZLEMEYE DEVAM ET SEKSİYONU */}
      {history.length > 0 && (
        <div className="section" style={{paddingBottom: '0'}}>
          <h3 style={{marginBottom: '20px', fontSize: '1.5rem'}}>İzlemeye Devam Et</h3>
          <div className="grid">
            {history.map((a, i) => (
              <div key={i} className="card" style={{position: 'relative', borderBottom: '3px solid #E50914'}}>
                {/* Geçmişten Kaldır (X) Butonu */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation(); // Kartın tıklanıp videonun açılmasını engeller
                    onRemoveHistory(a.title);
                  }}
                  style={{
                    position: 'absolute', top: '8px', right: '8px', zIndex: '10',
                    background: 'rgba(0,0,0,0.8)', color: 'white', width: '28px', height: '28px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '14px', border: '1px solid #444'
                  }}
                  title="Geçmişten Kaldır"
                >✕</div>
                
                <div onClick={() => onWatch(a)}>
                  <img src={a.imageUrl} alt={a.title} />
                  {/* Fansub Etiketi (Eğer varsa) */}
                  {a.fansub && (
                    <div style={{
                      position:'absolute', top:'10px', left:'10px', 
                      background:'#E50914', color:'white', padding:'2px 8px', 
                      fontSize:'10px', fontWeight:'bold', borderRadius:'2px', zIndex:5
                    }}>
                      {a.fansub.toUpperCase()}
                    </div>
                  )}
                  <div className="card-info">
                    <h4>{a.title}</h4>
                    <span>Bölüm {a.episode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TÜM ANİMELER SEKSİYONU */}
      <div className="section">
        <h3 style={{marginBottom: '20px', fontSize: '1.5rem'}}>Tüm Animeler</h3>
        <div className="grid">
          {animeList.length > 0 ? animeList.map((a, i) => (
            <div key={i} className="card" style={{position: 'relative'}} onClick={() => onWatch(a)}>
              <img src={a.imageUrl} alt={a.title} />
              
              {/* Fansub Etiketi (Sei Code vb.) */}
              {a.fansub && (
                <div style={{
                  position:'absolute', top:'10px', left:'10px', 
                  background:'#E50914', color:'white', padding:'2px 8px', 
                  fontSize:'10px', fontWeight:'bold', borderRadius:'2px', zIndex:5
                }}>
                  {a.fansub.toUpperCase()}
                </div>
              )}

              <div className="card-info">
                <h4>{a.title}</h4>
                <span>{a.season}. Sezon {a.episode}. Bölüm</span>
              </div>
            </div>
          )) : (
            <p style={{color: '#666', padding: '20px'}}>Henüz anime eklenmedi. Admin panelinden ekleyebilirsiniz!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;