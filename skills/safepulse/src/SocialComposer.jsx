import React, { useState, useRef, useEffect, useCallback } from 'react';

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: '📘', color: '#1877F2', ratio: '1.91:1', maxW: 1200, maxH: 630 },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0A66C2', ratio: '1.91:1', maxW: 1200, maxH: 627 },
  { id: 'twitter', label: 'X / Twitter', icon: '🐦', color: '#1DA1F2', ratio: '16:9', maxW: 1600, maxH: 900 },
  { id: 'instagram', label: 'Instagram', icon: '📸', color: '#E4405F', ratio: '1:1', maxW: 1080, maxH: 1080 },
  { id: 'youtube', label: 'YouTube', icon: '▶️', color: '#FF0000', ratio: '16:9', maxW: 1920, maxH: 1080 },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: '#000000', ratio: '9:16', maxW: 1080, maxH: 1920 }
];

const PRESET_RATIOS = [
  { id:'free', label:'Free', value:null },
  { id:'sq', label:'1:1', value:1 },
  { id:'landscape', label:'16:9', value:16/9 },
  { id:'portrait', label:'9:16', value:9/16 },
  { id:'fb', label:'1.91:1', value:1.91 }
];

/* ──────── Simple Crop Modal (tap-to-crop, slider to adjust) ──────── */
function CropModal({ src, aspectRatio, platforms, onSave, onClose }) {
  const [img, setImg] = useState(null);
  const [dim, setDim] = useState({ nw:0, nh:0 });       // natural dimensions
  const canvasRef = useRef(null);
  const [currentRatio, setCurrentRatio] = useState(aspectRatio);
  const [offset, setOffset] = useState(0);                // 0-100 scroll
  const [direction, setDirection] = useState('none');     // 'h' or 'v' for scroll axis

  useEffect(() => {
    const i = new Image();
    i.onload = () => {
      setImg(i);
      const nw = i.naturalWidth, nh = i.naturalHeight;
      setDim({ nw, nh });
      // Determine scroll direction based on image vs ratio
      const r = aspectRatio || 16/9;
      const imgR = nw / nh;
      setDirection(imgR > r ? 'h' : 'v');
    };
    i.src = src;
  }, [src, aspectRatio]);

  const applyCrop = () => {
    if (!img) return;
    const { nw, nh } = dim;
    const r = currentRatio || (nw / nh); // free = no crop

    let sx, sy, sw, sh;
    if (!currentRatio) {
      // Free = use full image
      sx = 0; sy = 0; sw = nw; sh = nh;
    } else if (direction === 'h') {
      // Image wider than ratio: crop horizontally, scroll offset
      sh = nh;
      sw = nh * r;
      const maxOff = nw - sw;
      sx = Math.round(maxOff * (offset / 100));
      sy = 0;
    } else {
      // Image taller than ratio: crop vertically, scroll offset
      sw = nw;
      sh = nw / r;
      const maxOff = nh - sh;
      sx = 0;
      sy = Math.round(maxOff * (offset / 100));
    }

    // Output size
    let outW, outH;
    if (platforms && platforms.length === 1) {
      const p = PLATFORMS.find(x => x.id === platforms[0]);
      if (p) { outW = p.maxW; outH = p.maxH; }
    }
    if (!outW) {
      const max = Math.max(sw, sh);
      const s = Math.min(1, 1920 / max);
      outW = Math.round(sw * s); outH = Math.round(sh * s);
    }

    const canvas = document.createElement('canvas');
    canvas.width = outW; canvas.height = outH;
    canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
    onSave(canvas.toDataURL('image/jpeg', 0.92));
  };

  const getRatioLabel = () => {
    if (platforms?.length === 1) {
      const p = PLATFORMS.find(x => x.id === platforms[0]);
      return p ? `${p.icon} ${p.ratio} (${p.maxW}×${p.maxH})` : null;
    }
    return null;
  };

  if (!img) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="text-white text-sm">Loading image...</div>
    </div>
  );

  const { nw, nh } = dim;
  const previewW = Math.min(340, window.innerWidth - 40);
  const previewH = previewW * (nh / nw);
  const showPreview = previewH < previewW * 1.3; // only show if not too tall

  // Preview crop overlay
  const r = currentRatio || (nw / nh);
  let boxStyle = {};
  if (currentRatio) {
    if (direction === 'h') {
      const boxW = previewH * r;
      const maxOff = previewW - boxW;
      const left = Math.round(maxOff * (offset / 100));
      boxStyle = { left, top: 0, width: boxW, height: previewH };
    } else {
      const boxH = previewW / r;
      const maxOff = previewH - boxH;
      const top = Math.round(maxOff * (offset / 100));
      boxStyle = { left: 0, top, width: previewW, height: boxH };
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'#1a2a4a', borderRadius:'16px', padding:'16px', width:'92%', maxWidth:'380px',
        border:'1px solid #3a4a6a'
      }}>
        <h3 className="font-bold mb-2 text-center" style={{color:'#e8edf5',fontSize:'16px'}}>✂️ Crop Image</h3>
        {getRatioLabel() && (
          <div className="text-center mb-2" style={{color:'#d4a843',fontSize:'12px'}}>{getRatioLabel()}</div>
        )}

        {/* Preview image with crop overlay */}
        <div style={{position:'relative',width:previewW,height:previewH,margin:'0 auto',overflow:'hidden',borderRadius:'10px',background:'#0a1628'}}>
          <img src={src} style={{width:previewW,height:previewH,objectFit:'cover',display:'block'}} alt="" draggable={false} />
          {currentRatio && (
            <>
              {/* Darken outside crop box */}
              <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)',pointerEvents:'none'}} />
              <div style={{
                position:'absolute', ...boxStyle,
                background:'transparent', border:'2px solid #d4a843',
                boxShadow:'0 0 0 999px rgba(0,0,0,0.55)',
                pointerEvents:'none', borderRadius:'3px'
              }} />
            </>
          )}
        </div>

        {/* Ratio selector */}
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {PRESET_RATIOS.map(pr => {
            const active = currentRatio === pr.value || (!pr.value && !currentRatio);
            return (
              <button key={pr.id} onClick={() => {
                setCurrentRatio(pr.value);
                setOffset(50); // center
              }}
                style={{
                  padding:'5px 14px', borderRadius:'8px', fontSize:'12px', fontWeight: active ? 700 : 400,
                  background: active ? '#d4a843' : '#2a3a5a',
                  border: active ? 'none' : '1px solid #3a4a6a',
                  color: active ? '#0a1628' : '#94a3b8', cursor:'pointer'
                }}>
                {pr.label}
              </button>
            );
          })}
        </div>

        {/* Slider to move crop box */}
        {currentRatio && (
          <div className="mt-3">
            <label className="text-xs" style={{color:'#6272a4'}}>
              {direction === 'h' ? '↔ Move left/right' : '↕ Move up/down'}:
            </label>
            <input type="range" min="0" max="100" value={offset}
              onChange={e => setOffset(Number(e.target.value))}
              style={{width:'100%',accentColor:'#d4a843',height:'32px'}} />
            <div className="flex justify-between text-xs" style={{color:'#6272a4'}}>
              <span>{direction === 'h' ? 'Left' : 'Top'}</span>
              <span>Center</span>
              <span>{direction === 'h' ? 'Right' : 'Bottom'}</span>
            </div>
          </div>
        )}

        {/* Output info */}
        <div className="mt-2 text-center" style={{color:'#6272a4',fontSize:'11px'}}>
          {currentRatio
            ? `📐 ${currentRatio.toFixed(2)} ratio`
            : '📐 Full image (no crop)'}
        </div>

        <div className="flex gap-2 mt-3">
          <button onClick={onClose} style={{flex:1,padding:'12px',background:'#2a3a5a',border:'none',borderRadius:'10px',color:'#94a3b8',cursor:'pointer',fontSize:'14px'}}>Cancel</button>
          <button onClick={applyCrop} style={{flex:1,padding:'12px',background:'#d4a843',border:'none',borderRadius:'10px',color:'#0a1628',fontWeight:700,cursor:'pointer',fontSize:'14px'}}>Apply Crop</button>
        </div>
      </div>
    </div>
  );
}

/* ──────── Main Component ──────── */
export default function SocialComposer({ config }) {
  const [postText, setPostText] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [postImage, setPostImage] = useState(null);
  const [postVideo, setPostVideo] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [postHistory, setPostHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sp_social_history') || '[]'); }
    catch { return []; }
  });
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const getActiveAspectRatio = () => {
    if (selectedPlatforms.length === 1) {
      const p = PLATFORMS.find(x => x.id === selectedPlatforms[0]);
      if (p) { const [w, h] = p.ratio.split(':').map(Number); return w / h; }
    }
    return null;
  };

  const renderPlatformSizes = () => {
    const sel = PLATFORMS.filter(p => selectedPlatforms.includes(p.id));
    if (sel.length === 0) return null;
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {sel.map(p => (
          <span key={p.id} className="text-xs" style={{padding:'3px 8px',background:'#1a2a4a',borderRadius:'6px',border:'1px solid #2a3a5a',color:'#94a3b8'}}>
            {p.icon} {p.label}: {p.ratio} ({p.maxW}×{p.maxH})
          </span>
        ))}
      </div>
    );
  };

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPostImage(file);
    setCroppedImage(null);
    const reader = new FileReader();
    reader.onload = () => { setImagePreview(reader.result); setShowCrop(true); };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPostVideo(file);
    const reader = new FileReader();
    reader.onload = () => setVideoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCropSave = (croppedDataUrl) => {
    setCroppedImage(croppedDataUrl);
    setShowCrop(false);
  };

  const removeImage = () => {
    setPostImage(null); setImagePreview(null); setCroppedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeVideo = () => {
    setPostVideo(null); setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handlePost = () => {
    if (!postText.trim()) { alert('Please write something for your post.'); return; }
    if (selectedPlatforms.length === 0) { alert('Select at least one platform to post to.'); return; }
    const post = {
      id: Date.now().toString(36), text: postText, platforms: selectedPlatforms,
      image: croppedImage || imagePreview, video: videoPreview,
      scheduled: scheduledDate && scheduledTime ? `${scheduledDate} ${scheduledTime}` : null,
      createdAt: new Date().toISOString(),
      status: scheduledDate && scheduledTime ? 'Scheduled' : 'Draft',
      company: config?.demoMode ? config.demoCompany : (config?.company?.name || 'SafePulse')
    };
    const updated = [post, ...postHistory];
    setPostHistory(updated);
    localStorage.setItem('sp_social_history', JSON.stringify(updated));
    setPostText(''); setSelectedPlatforms([]); removeImage(); removeVideo();
    setScheduledDate(''); setScheduledTime('');
    const msg = post.status === 'Scheduled' ? `✅ Post scheduled for ${post.scheduled}` : '✅ Post saved as draft.';
    alert(msg);
  };

  const deletePost = (id) => {
    const updated = postHistory.filter(p => p.id !== id);
    setPostHistory(updated);
    localStorage.setItem('sp_social_history', JSON.stringify(updated));
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {showCrop && imagePreview && (
        <CropModal src={imagePreview} aspectRatio={getActiveAspectRatio()}
          platforms={selectedPlatforms} onSave={handleCropSave} onClose={() => setShowCrop(false)} />
      )}

      <h2 className="text-xl font-bold mb-4" style={{color:'#d4a843',fontFamily:'Orbitron,monospace',letterSpacing:'1px'}}>
        📢 Social Post Composer
      </h2>
      <p className="text-sm mb-6" style={{color:'#8899bb'}}>Create posts. ✂️ Tap to crop!</p>

      <div className="mb-4">
        <label className="text-sm font-semibold mb-2 block" style={{color:'#94a3b8'}}>Post to:</label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => togglePlatform(p.id)}
              style={{
                padding:'6px 14px', borderRadius:'8px',
                border: selectedPlatforms.includes(p.id) ? `2px solid ${p.color}` : '1px solid #2a3a5a',
                background: selectedPlatforms.includes(p.id) ? `${p.color}22` : 'transparent',
                color: selectedPlatforms.includes(p.id) ? p.color : '#94a3b8', fontSize:'13px', cursor:'pointer'
              }}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm font-semibold mb-1 block" style={{color:'#94a3b8'}}>Post Content:</label>
        <textarea value={postText} onChange={e => setPostText(e.target.value)}
          placeholder="Write your post..."
          style={{width:'100%',minHeight:'100px',padding:'12px',borderRadius:'10px',background:'#1a2a4a',border:'1px solid #2a3a5a',color:'#e8edf5',fontSize:'14px',resize:'vertical',outline:'none',boxSizing:'border-box'}} />
      </div>

      {selectedPlatforms.length > 0 && (
        <div className="mb-3">
          <label className="text-xs font-semibold mb-1 block" style={{color:'#94a3b8'}}>📐 Recommended sizes:</label>
          {renderPlatformSizes()}
        </div>
      )}

      {/* Image Upload */}
      <div className="mb-4">
        <label className="text-sm font-semibold mb-1 block" style={{color:'#94a3b8'}}>Add Image:</label>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => fileInputRef.current?.click()}
            style={{padding:'8px 16px',background:'#2a3a5a',border:'1px solid #3a4a6a',borderRadius:'8px',color:'#e8edf5',cursor:'pointer',fontSize:'13px'}}>
            📷 Choose
          </button>
          {(croppedImage || imagePreview) && (
            <>
              <div className="relative" style={{maxWidth:'100px',width:'100%'}}>
                <img src={croppedImage || imagePreview} alt="" style={{width:'100%',maxHeight:'70px',objectFit:'contain',borderRadius:'6px',background:'#0a1628'}} />
                <button onClick={removeImage}
                  style={{position:'absolute',top:-5,right:-5,background:'#ff5555',color:'#fff',border:'none',borderRadius:'50%',width:'20px',height:'20px',fontSize:'10px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:5}}>
                  ×
                </button>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                <button onClick={() => setShowCrop(true)} style={{padding:'5px 10px',background:'#2a3a5a',border:'1px solid #d4a843',borderRadius:'8px',color:'#d4a843',cursor:'pointer',fontSize:'11px'}}>
                  ✂️ Re-crop
                </button>
                {croppedImage && (
                  <button onClick={() => { setCroppedImage(null); setShowCrop(false); }} style={{padding:'5px 10px',background:'transparent',border:'1px solid #6272a4',borderRadius:'8px',color:'#6272a4',cursor:'pointer',fontSize:'11px'}}>
                  ↩️ Original
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}} />
      </div>

      {/* Video */}
      <div className="mb-4">
        <label className="text-sm font-semibold mb-1 block" style={{color:'#94a3b8'}}>Add Video:</label>
        <div className="flex items-center gap-3">
          <button onClick={() => videoInputRef.current?.click()}
            style={{padding:'8px 16px',background:'#2a3a5a',border:'1px solid #3a4a6a',borderRadius:'8px',color:'#e8edf5',cursor:'pointer',fontSize:'13px'}}>
            🎬 Choose
          </button>
          {videoPreview && (
            <div className="relative" style={{maxWidth:'100px',width:'100%'}}>
              <video src={videoPreview} style={{width:'100%',maxHeight:'70px',objectFit:'contain',borderRadius:'6px',background:'#0a1628'}} controls />
              <button onClick={removeVideo}
                style={{position:'absolute',top:-5,right:-5,background:'#ff5555',color:'#fff',border:'none',borderRadius:'50%',width:'20px',height:'20px',fontSize:'10px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:5}}>
                  ×
              </button>
            </div>
          )}
        </div>
        <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} style={{display:'none'}} />
      </div>

      {/* Schedule */}
      <div className="mb-6 flex gap-3">
        <div className="flex-1">
          <label className="text-xs font-semibold mb-1 block" style={{color:'#94a3b8'}}>Date:</label>
          <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
            style={{width:'100%',padding:'8px',background:'#1a2a4a',border:'1px solid #2a3a5a',borderRadius:'8px',color:'#e8edf5',fontSize:'13px',outline:'none',boxSizing:'border-box'}} />
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold mb-1 block" style={{color:'#94a3b8'}}>Time:</label>
          <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
            style={{width:'100%',padding:'8px',background:'#1a2a4a',border:'1px solid #2a3a5a',borderRadius:'8px',color:'#e8edf5',fontSize:'13px',outline:'none',boxSizing:'border-box'}} />
        </div>
      </div>

      <button onClick={handlePost}
        style={{width:'100%',padding:'12px',background:'#d4a843',color:'#0a1628',border:'none',borderRadius:'10px',fontWeight:700,fontSize:'14px',cursor:'pointer',marginBottom:'24px'}}>
        {scheduledDate && scheduledTime ? '📅 Schedule Post' : '💾 Save Post'}
      </button>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold" style={{color:'#e8edf5'}}>📋 Post History</h3>
        <button onClick={() => {
          if (!confirm('Delete all unsent posts?')) return;
          setPostHistory([]);
          localStorage.setItem('sp_social_history', '[]');
        }} style={{padding:'4px 10px',background:'transparent',border:'1px solid #ff5555',borderRadius:'6px',color:'#ff5555',cursor:'pointer',fontSize:'11px'}}>
          🗑️ Clear All
        </button>
      </div>
      {postHistory.length === 0 ? (
        <p className="text-sm" style={{color:'#6272a4'}}>No posts yet.</p>
      ) : (
        <div className="space-y-3">
          {postHistory.map(post => (
            <div key={post.id} style={{padding:'10px',background:'#1a2a4a',border:'1px solid #2a3a5a',borderRadius:'10px'}}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex gap-1 flex-wrap mb-1">
                    {post.platforms?.map(p => { const pl = PLATFORMS.find(x => x.id === p); return pl ? <span key={p} style={{fontSize:'11px'}}>{pl.icon}</span> : null; })}
                    <span style={{fontSize:'10px',padding:'1px 6px',borderRadius:'4px',background: post.status === 'Scheduled' ? 'rgba(212,168,67,0.2)' : 'rgba(98,114,164,0.2)',color: post.status === 'Scheduled' ? '#d4a843' : '#6272a4'}}>{post.status}</span>
                  </div>
                  <p className="text-sm" style={{color:'#e8edf5',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{post.text.length > 100 ? post.text.slice(0,100) + '...' : post.text}</p>
                  {post.image && <img src={post.image} alt="" style={{maxWidth:'100px',maxHeight:'50px',objectFit:'contain',borderRadius:'4px',marginTop:'4px',background:'#0a1628'}} />}
                  <div className="text-xs mt-1" style={{color:'#6272a4'}}>{post.company} · {new Date(post.createdAt).toLocaleDateString()}{post.scheduled ? ` 📅 ${post.scheduled}` : ''}</div>
                </div>
                <button onClick={() => deletePost(post.id)} style={{background:'none',border:'none',color:'#ff5555',cursor:'pointer',fontSize:'14px',padding:'0 4px'}}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
