import React, { useState } from 'react';

function Admin({ allUsers, setUsers, animeList, onAnimeDelete, setAnimes, setHero, goToHome }) {
  // 1. Ekleme ve Düzenleme State'leri
  const [ani, setAni] = useState({ title: '', imageUrl: '', fansub: '', seasons: [], desc: '' });
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempLink, setTempLink] = useState(''); 
  const [selectedSeasonNum, setSelectedSeasonNum] = useState(1); // O an işlem yapılan sezon

  // 2. Afiş (Hero) State'i
  const [hr, setHr] = useState({ title: '', desc: '', img: '' });

  // --- 🚀 OTOMATİK AKTARICI (ANİMECİX JSON) ---
  const handleAutoImport = (rawData) => {
    try {
      if (!rawData.trim()) return;
      const data = JSON.parse(rawData);
      const source = data.data || data.props?.pageProps?.anime || data;

      const episodes = (source.episodes || source.video_list || []).map(ep => ({
        number: ep.number || ep.episode_number,
        url: ep.videos?.[0]?.url || ep.url || "" 
      }));

      const formattedAnime = {
        title: source.name || source.title || ani.title,
        desc: source.description || source.desc || "",
        imageUrl: source.poster || source.image || source.imageUrl || ani.imageUrl,
        fansub: source.fansub || "Otomatik Aktarım",
        rating: "0.0",
        // Eski sistemden gelenleri sezona çeviriyoruz (Varsayılan Sezon 1)
        seasons: [{ seasonNumber: 1, episodes: episodes }],
        reviews: []
      };

      if (episodes.length === 0) return alert("Bölüm bulunamadı!");

      setAni(formattedAnime);
      alert(`Başarıyla Sezon 1 olarak ${episodes.length} bölüm eklendi!`);
    } catch (err) {
      alert("JSON hatası!");
    }
  };

  // --- ⚡ SEICODE HIZLI KURULUM ---
  const handleSeicodeImport = () => {
    const id = document.getElementById('sei-id').value.trim();
    const season = parseInt(document.getElementById('sei-season').value) || 1;
    const count = parseInt(document.getElementById('sei-count').value);

    if(!id || !count) return alert("Lütfen ID ve Bölüm Sayısı girin!");

    const newEpisodes = [];
    for (let i = 1; i <= count; i++) {
      newEpisodes.push({
        number: i,
        url: `https://animecix.tv/titles/${id}/${season}/${i}`, 
        title: `Bölüm ${i}`
      });
    }

    // Mevcut sezonlar içinde bu sezon var mı kontrol et
    let currentSeasons = [...(ani.seasons || [])];
    const sIdx = currentSeasons.findIndex(s => s.seasonNumber === season);

    if (sIdx > -1) {
      currentSeasons[sIdx].episodes = newEpisodes;
    } else {
      currentSeasons.push({ seasonNumber: season, episodes: newEpisodes });
    }

    setAni({ ...ani, seasons: currentSeasons.sort((a,b) => a.seasonNumber - b.seasonNumber) });
    alert(`${id} - Sezon ${season} için ${count} bölüm oluşturuldu!`);
  };

  // Manuel Bölüm Ekleme
  const handleAddEpisode = () => {
    if (!tempLink) return alert("Link yapıştırın!");
    
    let currentSeasons = [...(ani.seasons || [])];
    let sIdx = currentSeasons.findIndex(s => s.seasonNumber === selectedSeasonNum);

    if (sIdx === -1) {
      currentSeasons.push({ seasonNumber: selectedSeasonNum, episodes: [] });
      sIdx = currentSeasons.length - 1;
    }

    const newEp = { 
      number: currentSeasons[sIdx].episodes.length + 1, 
      url: tempLink,
      title: `Bölüm ${currentSeasons[sIdx].episodes.length + 1}` 
    };

    currentSeasons[sIdx].episodes.push(newEp);
    setAni({ ...ani, seasons: currentSeasons });
    setTempLink('');
  };

  // Anime Kaydetme
  const saveAnime = () => {
    if (!ani.title || !ani.imageUrl) return alert("Başlık ve Kapak Resmi zorunlu!");
    
    if (editingIndex !== null) {
      const updatedList = [...animeList];
      updatedList[editingIndex] = ani;
      setAnimes(updatedList);
      setEditingIndex(null);
    } else {
      setAnimes([...animeList, ani]);
    }
    setAni({ title: '', imageUrl: '', fansub: '', seasons: [], desc: '' });
    alert("Kaydedildi!");
  };

  const updateUser = (email, field, val) => {
    const updated = allUsers.map(u => u.email === email ? { ...u, [field]: val } : u);
    setUsers(updated);
  };

  return (
    <div className="section" style={{ marginTop: '100px', paddingBottom: '100px' }}>
      <h1>{editingIndex !== null ? '📝 Seri Düzenleniyor' : '⚙️ Yönetim Paneli'}</h1>
      
      <div className="grid">
        {/* BOTLAR */}
        <div className="card" style={{ gridColumn: '1 / -1', padding: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ borderRight: '1px solid #333', paddingRight: '20px' }}>
            <h3 style={{color: '#f1c40f'}}>⚡ Seicode Hızlı Kurulum</h3>
            <input className="admin-input" id="sei-id" placeholder="ID (örn: jujutsu-kaisen)" />
            <div style={{display:'flex', gap:'5px'}}>
              <input className="admin-input" id="sei-season" type="number" placeholder="Sezon" style={{flex:1}} />
              <input className="admin-input" id="sei-count" type="number" placeholder="Bölüm Sayısı" style={{flex:2}} />
            </div>
            <button className="btn-red" style={{width: '100%', background: '#f1c40f', color: '#000'}} onClick={handleSeicodeImport}>Sezonu Oluştur</button>
          </div>

          <div>
            <h3 style={{color: '#E50914'}}>🚀 JSON Aktarıcı</h3>
            <textarea className="admin-input" placeholder="JSON buraya..." style={{ minHeight: '85px' }} onChange={(e) => handleAutoImport(e.target.value)} />
          </div>
        </div>

        {/* ANİME FORMU */}
        <div className="card" style={{ padding: '25px' }}>
          <h3>🎬 Anime Bilgileri</h3>
          <input className="admin-input" placeholder="Anime Adı" value={ani.title} onChange={e => setAni({ ...ani, title: e.target.value })} />
          <input className="admin-input" placeholder="Kapak Resmi URL" value={ani.imageUrl} onChange={e => setAni({ ...ani, imageUrl: e.target.value })} />
          <input className="admin-input" placeholder="Fansub" value={ani.fansub} onChange={e => setAni({ ...ani, fansub: e.target.value })} />
          
          <div style={{marginTop: '15px', background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid #333'}}>
            <h4 style={{margin: '0 0 10px 0'}}>🎞️ Bölüm Ekleme (Sezon Bazlı)</h4>
            <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
               <input type="number" className="admin-input" style={{width:'80px', marginBottom:0}} value={selectedSeasonNum} onChange={e => setSelectedSeasonNum(parseInt(e.target.value))} title="Hangi sezona eklenecek?" />
               <input className="admin-input" style={{flex:1, marginBottom:0}} placeholder="Video Linki" value={tempLink} onChange={e => setTempLink(e.target.value)} />
               <button className="btn-red" style={{width:'auto', padding:'0 15px'}} onClick={handleAddEpisode}>+</button>
            </div>
            
            <div style={{maxHeight: '200px', overflowY: 'auto'}}>
              {(ani.seasons || []).map((s, si) => (
                <div key={si} style={{marginBottom:'10px', border:'1px solid #222', borderRadius:'4px'}}>
                  <div style={{background:'#222', padding:'5px 10px', fontSize:'12px', display:'flex', justifyContent:'space-between'}}>
                    <span>Sezon {s.seasonNumber}</span>
                    <span style={{color:'gray'}}>{s.episodes.length} Bölüm</span>
                  </div>
                  {s.episodes.map((ep, ei) => (
                    <div key={ei} style={{padding:'5px 10px', fontSize:'11px', display:'flex', justifyContent:'space-between', borderTop:'1px solid #1a1a1a'}}>
                      <span>{ep.number}. Bölüm</span>
                      <span style={{color:'#E50914', cursor:'pointer'}} onClick={() => {
                        const newSeasons = [...ani.seasons];
                        newSeasons[si].episodes = newSeasons[si].episodes.filter((_, idx) => idx !== ei);
                        setAni({...ani, seasons: newSeasons});
                      }}>Sil</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <button className="btn-red" style={{ width: '100%', marginTop: '15px' }} onClick={saveAnime}>Kaydet / Yayınla</button>
        </div>

        {/* KULLANICI YÖNETİMİ */}
        <div className="card" style={{ padding: '25px' }}>
          <h3>👥 Kullanıcılar</h3>
          <table style={{ width: '100%', fontSize: '13px' }}>
            <tbody>
              {allUsers.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '10px 0' }}>{u.username}</td>
                  <td><button className="btn-red" style={{ padding: '3px 8px' }} onClick={() => updateUser(u.email, 'isBanned', !u.isBanned)}>{u.isBanned ? 'Aç' : 'Ban'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AFİŞ AYARLARI */}
        <div className="card" style={{ padding: '25px' }}>
          <h3>🖼️ Görünüm</h3>
          <input className="admin-input" placeholder="Afiş Başlık" onChange={e => setHr({ ...hr, title: e.target.value })} />
          <input className="admin-input" placeholder="Afiş Resim URL" onChange={e => setHr({ ...hr, img: e.target.value })} />
          <button className="btn-gray" style={{ width: '100%' }} onClick={() => { setHero(hr); goToHome(); }}>Afişi Değiştir</button>
        </div>

        {/* LİSTE */}
        <div className="card" style={{ gridColumn: '1 / -1', padding: '25px' }}>
          <h3>📚 Yayındaki Seriler ({animeList.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {animeList.map((a, i) => (
              <div key={i} style={{ background: '#111', padding: '10px', borderRadius: '4px', border: '1px solid #222' }}>
                <img src={a.imageUrl} style={{width:'100%', height:'100px', objectFit:'cover'}} alt="a" />
                <div style={{marginTop: '10px', fontSize: '14px'}}>{a.title}</div>
                <div style={{display: 'flex', gap: '5px', marginTop: '10px'}}>
                  <button className="btn-gray" style={{flex: 1}} onClick={() => { setAni(a); setEditingIndex(i); window.scrollTo(0,0); }}>✏️</button>
                  <button className="btn-red" style={{flex: 1}} onClick={() => onAnimeDelete(i)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;