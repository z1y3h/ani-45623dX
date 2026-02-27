import React, { useState } from 'react';

function Profiles({ user, onSelect, onUpdateUser }) {
  const [editing, setEditing] = useState(null);

  const addP = () => {
    if (user.profiles.length >= 4) return alert("Limit 4!");
    const u = {...user};
    u.profiles.push({name: 'Yeni Profil', img: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png', history: [], reviews: []});
    onUpdateUser(u);
  };

  const removeP = (idx) => {
    if (user.profiles.length <= 1) return alert("En az 1 profil!");
    if (window.confirm("Silinsin mi?")) {
      const u = {...user}; u.profiles.splice(idx, 1);
      onUpdateUser(u); setEditing(null);
    }
  };

  const handleImageChange = (e) => {
    const r = new FileReader();
    r.onload = () => {
      const updatedUser = { ...user };
      updatedUser.profiles[editing].img = r.result;
      onUpdateUser(updatedUser); // İşte burada kalıcı kaydediyoruz
    };
    r.readAsDataURL(e.target.files[0]);
  };

  return (
    <div className="profile-screen" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh'}}>
      <h1 style={{fontSize:'3.5rem', marginBottom:'50px'}}>Kim izliyor?</h1>
      <div style={{display:'flex', gap:'30px'}}>
        {user.profiles.map((p, i) => (
          <div key={i} style={{textAlign:'center', width:'170px'}}>
            <div style={{position:'relative'}}>
              <img src={p.img} onClick={() => onSelect(p)} style={{width:'170px', height:'170px', borderRadius:'4px', cursor:'pointer', border:'3px solid transparent', objectFit:'cover'}} onMouseOver={e => e.target.style.borderColor='white'} onMouseOut={e => e.target.style.borderColor='transparent'} alt="p" />
              <div onClick={() => setEditing(i)} style={{position:'absolute', bottom:10, right:10, background:'rgba(0,0,0,0.85)', padding:'10px', borderRadius:'50%', cursor:'pointer', border:'1px solid #444'}}>✎</div>
            </div>
            <p style={{marginTop:'15px', color:'#808080', fontSize:'1.2rem'}}>{p.name}</p>
          </div>
        ))}
        {user.profiles.length < 4 && (
          <div onClick={addP} style={{textAlign:'center', cursor:'pointer'}}>
            <div style={{width:'170px', height:'170px', background:'#111', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'60px', color:'#444', borderRadius:'4px'}}>+</div>
            <p style={{marginTop:'15px', color:'#808080', fontSize:'1.2rem'}}>Ekle</p>
          </div>
        )}
      </div>

      {editing !== null && (
        <div className="modal-overlay">
          <div className="modal" style={{padding:'40px', width:'400px'}}>
            <h2>Profili Düzenle</h2>
            <div style={{margin:'20px 0'}}>
                <img src={user.profiles[editing].img} width="100" height="100" style={{borderRadius:'4px', marginBottom:'10px', objectFit:'cover'}} alt="e" />
                <input type="file" accept="image/*" style={{fontSize:'12px'}} onChange={handleImageChange} />
            </div>
            <input className="admin-input" value={user.profiles[editing].name} onChange={e => {const u={...user}; u.profiles[editing].name=e.target.value; onUpdateUser(u);}} />
            <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
              <button className="btn-red" style={{flex:1}} onClick={() => setEditing(null)}>Tamam</button>
              <button className="btn-gray" style={{flex:1, background:'#b20710'}} onClick={() => removeP(editing)}>Profili Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Profiles;