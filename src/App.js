import React, { useState, useEffect } from 'react';
import Home from './Home';
import Admin from './Admin';
import Profiles from './Profiles';
import ReviewSection from './ReviewSection';
import './index.css';

// Firebase Bağlantısı
import { db } from './firebase'; 
import { ref, onValue, set, update } from "firebase/database";

// REKLAM BİLEŞENİ
const GoogleAd = ({ slotId }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.log("Reklam yükleme hatası:", e);
    }
  }, []);

  return (
    <div className="ad-wrapper" style={{ margin: '20px 0', textAlign: 'center', minHeight: '90px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px' }}>
      <small style={{ color: '#555', display: 'block', marginBottom: '5px' }}>Sponsorlu İçerik</small>
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" 
           data-ad-slot={slotId}
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
};

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
  
  // Veriler artık Firebase'den gelecek
  const [users, setUsers] = useState([]);
  const [animes, setAnimes] = useState([]);
  const [hero, setHero] = useState(null);

  const [selectedAnime, setSelectedAnime] = useState(null);
  const [currentSeasonIdx, setCurrentSeasonIdx] = useState(0);
  const [currentEpIndex, setCurrentEpIndex] = useState(0);
  const [adTimer, setAdTimer] = useState(5);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'info' });

  const showMsg = (msg, type = 'info') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'info' }), 3000);
  };

  // --- FIREBASE VERİLERİNİ CANLI ÇEK ---
  useEffect(() => {
    // Animeleri Çek
    onValue(ref(db, 'animes'), (snapshot) => {
      const data = snapshot.val();
      if (data) setAnimes(data);
      else set(ref(db, 'animes'), DEFAULT_ANIMES);
    });

    // Kullanıcıları Çek (Admin Panelinde herkesi görmen için şart)
    onValue(ref(db, 'users'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase objesini diziye çeviriyoruz
        const userList = Object.values(data);
        setUsers(userList);
      }
    });

    // Hero Çek
    onValue(ref(db, 'hero'), (snapshot) => {
      const data = snapshot.val();
      if (data) setHero(data);
    });
  }, []);

  // Oturum Yönetimi
  useEffect(() => {
    if(activeUser) localStorage.setItem('activeUser', JSON.stringify(activeUser));
    if(selectedProfile) localStorage.setItem('selectedProfile', JSON.stringify(selectedProfile));
  }, [activeUser, selectedProfile]);

  // Firebase Kullanıcı Güncelleme Yardımcısı
  const saveUserToFirebase = (userObj) => {
    const safeEmail = userObj.email.replace(/\./g, '_'); // Firebase '.' kabul etmez
    set(ref(db, `users/${safeEmail}`), userObj);
  };

  const handleUpdateUser = (updatedUser) => {
    setActiveUser(updatedUser);
    saveUserToFirebase(updatedUser);
    if (selectedProfile) {
      const currentP = updatedUser.profiles.find(p => p.name === selectedProfile.name);
      if (currentP) setSelectedProfile(currentP);
    }
  };

  const handleLogin = (e, p) => {
    const existing = users.find(x => x.email === e && x.password === p);
    
    // Admin Sabit Girişi
    if (e === "rojhatdonenn@gmail.com" && p === "rdXhejsNfu21") {
      const adminData = existing || {
        email: e, password: p, role: 'admin', username: 'Rojhat', isBanned: false,
        profiles: [{name: 'Admin', img: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png', history: []}]
      };
      if (!existing) saveUserToFirebase(adminData);
      setActiveUser(adminData); setPage('profiles'); showMsg("Hoş geldin Admin!", "success");
    } 
    else if (existing) {
      if (existing.isBanned) return showMsg("Hesabınız yasaklanmıştır!", "error");
      setActiveUser(existing); setPage('profiles'); showMsg("Giriş başarılı!", "success");
    } 
    else { showMsg("Hatalı e-posta veya şifre!", "error"); }
  };

  const handleRegister = (u) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!u.username || u.username.length < 3) return showMsg("Kullanıcı adı en az 3 harf!", "error");
    if (!emailRegex.test(u.email)) return showMsg("Geçersiz e-posta formatı!", "error");
    if (u.password.length < 8) return showMsg("Şifre en az 8 haneli olmalı!", "error");
    if (users.some(x => x.email === u.email)) return showMsg("Bu e-posta zaten kullanımda!", "error");

    const newUser = { ...u, role: 'user', isBanned: false };
    saveUserToFirebase(newUser);
    showMsg("Kayıt başarılı! Giriş yapabilirsiniz.", "success");
    setPage('login');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  // --- DİĞER FONKSİYONLAR (Watch, Review vs.) ---
  const handleWatch = (anime) => {
    let playAnime = { ...anime };
    let hasSeasons = anime.seasons && anime.seasons.length > 0;
    if (!hasSeasons) return showMsg("Bölüm bulunamadı!", "error");

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
    setPage('watch');
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

      {page === 'login' && <AuthView type="login" onAction={handleLogin} onSwitch={() => setPage('register')} />}
      {page === 'register' && <AuthView type="register" onAction={handleRegister} onSwitch={() => setPage('login')} />}
      
      {page === 'profiles' && activeUser && <Profiles user={activeUser} onSelect={(p) => {setSelectedProfile(p); setPage('home');}} onUpdateUser={handleUpdateUser} />}
      
      {page === 'home' && (
        <>
          <Home hero={hero} animeList={animes} onWatch={handleWatch} history={selectedProfile?.history || []} onRemoveHistory={() => {}} />
          <div className="container" style={{maxWidth:'1200px', margin:'0 auto'}}>
             <GoogleAd slotId="7777777777" />
          </div>
        </>
      )}
      
      {page === 'admin' && (
        <Admin 
          allUsers={users} 
          setUsers={(newList) => {
             // Admin panelinde birini banladığında Firebase'e gönderir
             newList.forEach(u => saveUserToFirebase(u));
          }} 
          animeList={animes} 
          setAnimes={(newList) => set(ref(db, 'animes'), newList)}
          setHero={(h) => set(ref(db, 'hero'), h)} 
          goToHome={() => setPage('home')} 
        />
      )}

      {page === 'watch' && selectedAnime && (
        <div className="modern-watch">
          <div className="watch-nav">
            <button className="back-btn" onClick={() => setPage('home')}>← Geri</button>
            <div className="watch-info">
              <h3>{selectedAnime.title}</h3>
              <p>S{currentSeason?.seasonNumber} - Bölüm {currentEpisode?.number}</p>
            </div>
          </div>
          <div className="video-section">
            <iframe src={currentEpisode?.url} allowFullScreen title="v"></iframe>
          </div>
        </div>
      )}
    </div>
  );
}

// GİRİŞ VE KAYIT EKRANI BİLEŞENİ
function AuthView({ type, onAction, onSwitch }) {
  const [e, setE] = useState(''); 
  const [p, setP] = useState(''); 
  const [u, setU] = useState('');

  const handleSubmit = () => {
    if (type === 'login') {
      onAction(e, p);
    } else {
      onAction({
        username: u, email: e, password: p, 
        profiles: [{ name: u, img: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png', history: [] }]
      });
    }
  };

  return (
    <div className="modal-overlay" style={{ background: '#000' }}>
      <div className="modal">
        <h1>{type === 'login' ? 'Giriş' : 'Kayıt'}</h1>
        {type === 'register' && <input className="admin-input" placeholder="Kullanıcı Adı" onChange={x => setU(x.target.value)} />}
        <input className="admin-input" placeholder="E-posta" onChange={x => setE(x.target.value)} />
        <input className="admin-input" type="password" placeholder="Şifre" onChange={x => setP(x.target.value)} />
        <button className="btn-red" style={{ width: '100%' }} onClick={handleSubmit}>
          {type === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
        </button>
        <p onClick={onSwitch} style={{ cursor: 'pointer', marginTop: '15px', fontSize: '14px', color: '#888' }}>
          {type === 'login' ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten üye misin? Giriş Yap'}
        </p>
      </div>
    </div>
  );
}

export default App;