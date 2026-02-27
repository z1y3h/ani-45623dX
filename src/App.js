import React, { useState, useEffect } from 'react';
import Home from './Home';
import Admin from './Admin';
import Profiles from './Profiles';
import ReviewSection from './ReviewSection';
import './index.css';

// 1. ADIM: SİTENİN BOŞ GÖRÜNMEMESİ İÇİN VARSAYILAN VERİLERİ TANIMLIYORUZ
const DEFAULT_ANIMES = [
  {
    title: "Solo Leveling",
    desc: "Jinwoo'nun yükselişi ve dünyayı kurtarma mücadelesi...",
    img: "https://images.alphacoders.com/132/1322554.jpeg",
    fansub: "KAI-SUB",
    rating: "9.8",
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { number: 1, url: "https://www.youtube.com/embed/dQw4w9WgXcQ", title: "1. Bölüm" } 
        ]
      }
    ],
    reviews: []
  }
];

function App() {
  const [activeUser, setActiveUser] = useState(JSON.parse(localStorage.getItem('activeUser')) || null);
  const [selectedProfile, setSelectedProfile] = useState(JSON.parse(localStorage.getItem('selectedProfile')) || null);
  const [page, setPage] = useState(activeUser ? (selectedProfile ? 'home' : 'profiles') : 'login');
  const [users, setUsers] = useState(JSON.parse(localStorage.getItem('kaiUsers')) || []);
  
  // 2. ADIM: EĞER LOCALSTORAGE BOŞSA VARSAYILAN LİSTEYİ GETİRİYORUZ
  const [animes, setAnimes] = useState(JSON.parse(localStorage.getItem('kaiAnimes')) || DEFAULT_ANIMES);
  
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [currentSeasonIdx, setCurrentSeasonIdx] = useState(0);
  const [currentEpIndex, setCurrentEpIndex] = useState(0);
  const [adTimer, setAdTimer] = useState(5);
  const [hero, setHero] = useState(JSON.parse(localStorage.getItem('kaiHero')) || DEFAULT_ANIMES[0]);

  const [toast, setToast] = useState({ show: false, msg: '', type: 'info' });
  const showMsg = (msg, type = 'info') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'info' }), 3000);
  };

  useEffect(() => {
    localStorage.setItem('kaiUsers', JSON.stringify(users));
    localStorage.setItem('kaiAnimes', JSON.stringify(animes));
    localStorage.setItem('kaiHero', JSON.stringify(hero));
    if(activeUser) localStorage.setItem('activeUser', JSON.stringify(activeUser));
    if(selectedProfile) localStorage.setItem('selectedProfile', JSON.stringify(selectedProfile));
  }, [users, animes, hero, activeUser, selectedProfile]);

  const handleUpdateUser = (updatedUser) => {
    setActiveUser(updatedUser);
    const updatedUsers = users.map(u => u.email === updatedUser.email ? updatedUser : u);
    setUsers(updatedUsers);
    if (selectedProfile) {
      const currentP = updatedUser.profiles.find(p => p.name === selectedProfile.name);
      if (currentP) setSelectedProfile(currentP);
    }
  };

  const handleRemoveHistory = (animeTitle) => {
    if (!selectedProfile || !activeUser) return;
    const updatedHistory = (selectedProfile.history || []).filter(a => a.title !== animeTitle);
    const updatedProfile = { ...selectedProfile, history: updatedHistory };
    setSelectedProfile(updatedProfile);
    const updatedUser = { 
      ...activeUser, 
      profiles: activeUser.profiles.map(p => p.name === selectedProfile.name ? updatedProfile : p) 
    };
    handleUpdateUser(updatedUser);
    showMsg("Geçmişten kaldırıldı", "info");
  };

  const handleWatch = (anime) => {
    let playAnime = { ...anime };
    let hasSeasons = anime.seasons && anime.seasons.length > 0 && anime.seasons[0].episodes?.length > 0;
    let hasOldEps = anime.episodes && anime.episodes.length > 0;

    if (!hasSeasons && !hasOldEps) return showMsg("Bu animenin henüz bölümü yok!", "error");

    if (!hasSeasons && hasOldEps) {
      playAnime.seasons = [{ seasonNumber: 1, episodes: anime.episodes }];
    }

    const adUrl = localStorage.getItem('kaiAdUrl');
    setSelectedAnime(playAnime);
    setCurrentSeasonIdx(0);
    setCurrentEpIndex(0);

    if (selectedProfile && activeUser) {
      const updatedProfile = { ...selectedProfile };
      if (!updatedProfile.history) updatedProfile.history = [];
      updatedProfile.history = updatedProfile.history.filter(a => a.title !== anime.title);
      updatedProfile.history.unshift(playAnime);
      if (updatedProfile.history.length > 12) updatedProfile.history.pop();
      setSelectedProfile(updatedProfile);
      const updatedUser = { 
        ...activeUser, 
        profiles: activeUser.profiles.map(p => p.name === selectedProfile.name ? updatedProfile : p) 
      };
      handleUpdateUser(updatedUser);
    }

    if (adUrl && adUrl !== "") {
      setPage('ad-screen');
      setAdTimer(5);
      const timer = setInterval(() => {
        setAdTimer((prev) => {
          if (prev <= 1) { clearInterval(timer); setPage('watch'); return 5; }
          return prev - 1;
        });
      }, 1000);
    } else { setPage('watch'); }
  };

  const handleAddReview = (animeTitle, reviewText, rating) => {
    const newReview = { 
      username: selectedProfile.name, 
      userImg: selectedProfile.img, 
      text: reviewText, 
      rating: Number(rating), 
      date: new Date().toLocaleDateString() 
    };
    const updatedAnimes = animes.map(a => {
      if (a.title === animeTitle) {
        const currentReviews = [newReview, ...(a.reviews || [])];
        const total = currentReviews.reduce((sum, r) => sum + r.rating, 0);
        const avg = (total / currentReviews.length).toFixed(1);
        return { ...a, reviews: currentReviews, rating: avg };
      }
      return a;
    });
    setAnimes(updatedAnimes);
    setSelectedAnime(prev => ({
      ...prev, 
      reviews: [newReview, ...(prev.reviews || [])],
      rating: updatedAnimes.find(x => x.title === animeTitle).rating
    }));
    showMsg("Yorumun eklendi!", "success");
  };

  const handleLogout = () => {
    localStorage.removeItem('activeUser');
    localStorage.removeItem('selectedProfile');
    window.location.reload();
  };

  const currentSeason = selectedAnime?.seasons?.[currentSeasonIdx];
  const currentEpisode = currentSeason?.episodes?.[currentEpIndex];

  return (
    <div className="app">
      {toast.show && <div className={`toast-box ${toast.type}`}>{toast.msg}</div>}

      {selectedProfile && !['login', 'watch', 'ad-screen', 'register'].includes(page) && (
        <nav className="navbar">
          <div className="logo" onClick={() => setPage('home')}>KAIWATCH</div>
          <div className="nav-right">
            {activeUser?.role === 'admin' && <span onClick={() => setPage('admin')} style={{cursor:'pointer', color:'#E50914', fontWeight:'bold'}}>YÖNETİM</span>}
            <div onClick={() => {setSelectedProfile(null); setPage('profiles');}} style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'10px'}}>
              <img src={selectedProfile.img} width="35" height="35" style={{borderRadius:'4px', objectFit:'cover'}} alt="p" />
              <span>{selectedProfile.name}</span>
            </div>
            <span onClick={handleLogout} style={{cursor:'pointer', color:'#888', fontSize:'13px'}}>Çıkış</span>
          </div>
        </nav>
      )}

      {page === 'login' && <AuthView type="login" onAction={(e,p) => {
        const existing = users.find(x => x.email === e && x.password === p);
        if (e === "rojhatdonenn@gmail.com" && p === "rdXhejsNfu21") {
          const adminUser = existing || {
            email: e, role: 'admin', username: 'Rojhat', 
            profiles: [{name: 'Admin', img: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png', history: []}]
          };
          if(!existing) setUsers([...users, adminUser]);
          setActiveUser(adminUser); setPage('profiles'); showMsg("Hoş geldin Admin!", "success");
        } else if (existing) {
          if (existing.isBanned) return showMsg("Yasaklı hesap!", "error");
          setActiveUser(existing); setPage('profiles'); showMsg("Giriş başarılı!", "success");
        } else { showMsg("Hatalı bilgiler!", "error"); }
      }} onSwitch={() => setPage('register')} />}

      {page === 'register' && <AuthView type="register" onAction={(u) => {
        if(users.some(x => x.email === u.email)) return showMsg("Bu email kayıtlı!", "error");
        setUsers([...users, {...u, role:'user', isBanned:false}]); 
        showMsg("Kayıt başarılı!", "success"); setPage('login');
      }} onSwitch={() => setPage('login')} />}
      
      {page === 'profiles' && activeUser && <Profiles user={activeUser} onSelect={(p) => {setSelectedProfile(p); setPage('home');}} onUpdateUser={handleUpdateUser} />}
      
      {page === 'home' && (
        <Home hero={hero} animeList={animes} onWatch={handleWatch} history={selectedProfile?.history || []} onRemoveHistory={handleRemoveHistory} />
      )}
      
      {page === 'admin' && <Admin allUsers={users} setUsers={setUsers} animeList={animes} setAnimes={setAnimes} onAnimeDelete={(idx) => setAnimes(animes.filter((_, i) => i !== idx))} setHero={setHero} goToHome={() => setPage('home')} />}

      {page === 'watch' && selectedAnime && (
        <div className="modern-watch">
          <div className="watch-nav">
            <button className="back-btn" onClick={() => setPage('home')}>← Geri</button>
            <div className="watch-info">
              <h3>{selectedAnime.title}</h3>
              <p>S{currentSeason?.seasonNumber} - Bölüm {currentEpisode?.number}</p>
            </div>
            <div className="nav-btns">
              <button disabled={currentEpIndex === 0 && currentSeasonIdx === 0} onClick={() => {
                   if(currentEpIndex > 0) setCurrentEpIndex(currentEpIndex - 1);
                   else if(currentSeasonIdx > 0) {
                      const prevSIdx = currentSeasonIdx - 1;
                      setCurrentSeasonIdx(prevSIdx);
                      setCurrentEpIndex(selectedAnime.seasons[prevSIdx].episodes.length - 1);
                   }
                }}>Önceki</button>
              <button disabled={currentEpIndex === (currentSeason?.episodes.length - 1) && currentSeasonIdx === (selectedAnime.seasons.length - 1)} onClick={() => {
                    if(currentEpIndex < currentSeason.episodes.length - 1) setCurrentEpIndex(currentEpIndex + 1);
                    else if(currentSeasonIdx < selectedAnime.seasons.length - 1) {
                        setCurrentSeasonIdx(currentSeasonIdx + 1);
                        setCurrentEpIndex(0);
                    }
                }}>Sonraki</button>
            </div>
          </div>
          
          <div className="video-section">
            <iframe src={currentEpisode?.url} allowFullScreen referrerPolicy="no-referrer" title="v"></iframe>
          </div>

          <div className="watch-content">
            <div className="seasons-nav" style={{display:'flex', gap:'10px', marginBottom:'20px', overflowX:'auto', paddingBottom:'10px'}}>
                {selectedAnime.seasons?.map((s, idx) => (
                    <button key={idx} className={`btn-gray ${currentSeasonIdx === idx ? 'active-season' : ''}`}
                        style={{minWidth:'100px', border: currentSeasonIdx === idx ? '2px solid #E50914' : 'none', background: currentSeasonIdx === idx ? '#E50914' : '#222'}}
                        onClick={() => { setCurrentSeasonIdx(idx); setCurrentEpIndex(0); }}>
                        {s.seasonNumber}. Sezon
                    </button>
                ))}
            </div>
            <div className="episodes-list">
               <h4>Sezon {currentSeason?.seasonNumber} Bölümleri</h4>
               <div className="ep-grid">
                  {currentSeason?.episodes.map((ep, i) => (
                    <button key={i} className={currentEpIndex === i ? 'active' : ''} onClick={() => setCurrentEpIndex(i)}>{ep.number}</button>
                  ))}
               </div>
            </div>
            <div className="details-card">
               <div className="meta">
                 <span className="rating-tag">⭐ {selectedAnime.rating || "0.0"}</span>
                 <span className="fansub-tag">{selectedAnime.fansub || "KAI-SUB"}</span>
               </div>
               <ReviewSection anime={selectedAnime} onAddReview={handleAddReview} />
            </div>
          </div>
        </div>
      )}

      {page === 'ad-screen' && (
        <div className="modal-overlay" style={{background:'#000', flexDirection:'column'}}>
            <img src={localStorage.getItem('kaiAdUrl')} style={{maxWidth:'80%', borderRadius:'10px'}} alt="ad" />
            <h2 style={{marginTop:'20px'}}>Reklam Geçiliyor: {adTimer}sn</h2>
        </div>
      )}
    </div>
  );
}

function AuthView({ type, onAction, onSwitch }) {
  const [e, setE] = useState(''); const [p, setP] = useState(''); const [u, setU] = useState('');
  return (
    <div className="modal-overlay" style={{background:'#000'}}>
      <div className="modal">
        <h1>{type === 'login' ? 'Giriş' : 'Kayıt'}</h1>
        {type === 'register' && <input className="admin-input" placeholder="Kullanıcı Adı" onChange={x => setU(x.target.value)} />}
        <input className="admin-input" placeholder="E-posta" onChange={x => setE(x.target.value)} />
        <input className="admin-input" type="password" placeholder="Şifre" onChange={x => setP(x.target.value)} />
        <button className="btn-red" style={{width:'100%'}} onClick={() => type === 'login' ? onAction(e, p) : onAction({username:u, email:e, password:p, profiles:[{name:u, img:'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png', history:[]}]})}>
          {type === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
        </button>
        <p onClick={onSwitch} style={{cursor:'pointer', marginTop:'15px', fontSize:'14px', color:'#888'}}>
          {type === 'login' ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten üye misin? Giriş Yap'}
        </p>
      </div>
    </div>
  );
}

export default App;