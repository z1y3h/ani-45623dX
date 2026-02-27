import React, { useEffect } from 'react';

const AdSlot = ({ adSlotId }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Adsbygoogle hatası:", e);
    }
  }, []);

  return (
    <div className="ad-container" style={{ textAlign: 'center', margin: '20px 0', overflow: 'hidden' }}>
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Kendi ID'ni buraya yaz
           data-ad-slot={adSlotId}
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
};

export default AdSlot;