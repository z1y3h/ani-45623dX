import React, { useState } from 'react';

function ReviewSection({ anime, onAddReview }) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);

  const submit = () => {
    if(!text.trim()) return;
    // ÇÖKMEYİ DÜZELTEN SATIR: anime.title parametresini ekledik
    onAddReview(anime.title, text, rating); 
    setText('');
    setRating(5);
  };

  return (
    <div className="review-section" style={{ marginTop: '30px' }}>
      <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #333', pb: '10px' }}>Yorumlar ve Puanlama</h3>
      
      <div className="rating-input">
        {[1, 2, 3, 4, 5].map((num) => (
          <span 
            key={num} 
            className={`star-icon ${(hover || rating) >= num ? 'active' : ''}`}
            onClick={() => setRating(num)}
            onMouseEnter={() => setHover(num)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </span>
        ))}
        <span className="rating-num">{rating}/5 Puan Ver</span>
      </div>

      <textarea 
        className="review-area" 
        placeholder="Bu bölüm hakkında ne düşünüyorsun? Spoilersız yorum yapmayı unutma!"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="btn-red" onClick={submit} style={{ width: '100%', marginBottom: '30px' }}>Yorumu Gönder</button>

      <div className="reviews-list">
        {(anime.reviews || []).map((r, i) => (
          <div key={i} className="review-card">
            <img src={r.userImg} alt="user" />
            <div className="review-body" style={{ flex: 1 }}>
              <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{r.username}</strong>
                <span style={{ color: '#f1c40f' }}>⭐ {r.rating}</span>
              </div>
              <p style={{ color: '#ccc', margin: '8px 0', fontSize: '14px', lineHeight: '1.5' }}>{r.text}</p>
              <small style={{ color: '#666' }}>{r.date}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default ReviewSection;