import React, { useState, useRef, useEffect, useCallback } from 'react';

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: '📘', color: '#1877F2', ratio: '1.91:1', maxW: 1200, maxH: 630 },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0A66C2', ratio: '1.91:1', maxW: 1200, maxH: 627 },
  { id: 'twitter', label: 'X / Twitter', icon: '🐦', color: '#1DA1F2', ratio: '16:9', maxW: 1600, maxH: 900 },
  { id: 'instagram', label: 'Instagram', icon: '📸', color: '#E4405F', ratio: '1:1', maxW: 1080, maxH: 1080 },
  { id: 'youtube', label: 'YouTube', icon: '▶️', color: '#FF0000', ratio: '16:9', maxW: 1920, maxH: 1080 },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: '#000000', ratio: '9:16', maxW: 1080, maxH: 1920 }
];

/* ──────── Image Crop Modal (touch-friendly) ──────── */
function CropModal({ src, aspectRatio, platforms, onSave, onClose }) {
  const imgRef = useRef(null);
  const [img, setImg] = useState(null);
  const containerRef = useRef(null);
  const [crop, setCrop] = useState({ x:10, y:10, w:200, h:200 });
  const [dragging, setDragging] = useState(null);
  const dragStart = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const i = new Image();
    i.onload = () => { setImg(i); setImgLoaded(true); };
    i.src = src;
  }, [src]);

  const W = 300, H = 300;
  const scale = img ? W / img.naturalWidth : 1;
  const displayH = img ? Math.min(img.naturalHeight * scale, H) : H;
  // Center crop box initially
  useEffect(() => {
    if (imgLoaded && img) {
      const ch = Math.min(img.naturalHeight * scale, H);
      const cw = ch;
      setCrop({ x: (W - cw) / 2, y: (ch - cw) / 2, w: cw, h: cw });
    }
  }, [imgLoaded]);

  const getPos = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const startDrag = useCallback((e, handle) => {
    e.preventDefault();
    setDragging(handle);
    const pos = getPos(e);
    dragStart.current = { ...pos, ...crop };
  }, [getPos, crop]);

  const onMove = useCallback((e) => {
    if (!dragging || !dragStart.current) return;
    e.preventDefault();
    const pt = getPos(e);
    const ds = dragStart.current;
    let { x, y, w, h } = crop;

    if (dragging === 'move') {
      x = clamp(ds.lx + pt.x - ds.x, 0, W - w);
      y = clamp(ds.ly + pt.y - ds.y, 0, displayH - h);
    } else if (dragging === 'se') {
      w = clamp(pt.x - x, 30, W - x);
      h = aspectRatio ? w / aspectRatio : clamp(pt.y - y, 30, displayH - y);
    } else if (dragging === 'ne') {
      const nw = clamp(pt.x - x, 30, W - x);
      const nh = aspectRatio ? nw / aspectRatio : clamp(y + h - pt.y, 30, displayH);
      y = y + h - nh; w = nw; h = nh;
    } else if (dragging === 'sw') {
      const nw = clamp(x + w - pt.x, 30, W);
      const nh = aspectRatio ? nw / aspectRatio : clamp(pt.y - y, 30, displayH - y);
      x = x + w - nw; w = nw; h = nh;
    } else if (dragging === 'nw') {
      const nw = clamp(x + w - pt.x, 30, W);
      const nh = aspectRatio ? nw / aspectRatio : clamp(y + h - pt.y, 30, displayH);
      x = x + w - nw; y = y + h - nh;
      w = nw; h = nh;
    }
    setCrop({ x, y, w, h });
  }, [dragging, crop, W, displayH, aspectRatio, getPos]);

  const endDrag = useCallback(() => {
    setDragging(null);
    dragStart.current = null;
  }, []);

  // Bind global move/up for reliable capture
  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => { e.preventDefault(); onMove(e); };
    const handleUp = () => endDrag();
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleUp);
    };
  }, [dragging, onMove, endDrag]);

  const applyCrop = () => {
    if (!img) return;
    const sx = crop.x / scale; const sy = crop.y / scale;
    const sw = crop.w / scale; const sh = crop.h / scale;

    // Exact platform output
    if (aspectRatio && platforms && platforms.length === 1) {
      const p = PLATFORMS.find(x => x.id === platforms[0]);
      if (p) {
        const canvas = document.createElement('canvas');
        canvas.width = p.maxW; canvas.height = p.maxH;
        canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, p.maxW, p.maxH);
        onSave(canvas.toDataURL('image/jpeg', 0.92));
        return;
      }
    }

    const maxDim = Math.max(sw, sh);
    const scaleOut = Math.min(1, 1920 / maxDim);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(sw * scaleOut); canvas.height = Math.round(sh * scaleOut);
    canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    onSave(canvas.toDataURL('image/jpeg', 0.92));
  };

  if (!img) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}><div className="text-white text-sm p-4">Loading...</div></div>;

  const handleSize = 22; // Big touch targets

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'#1a2a4a', borderRadius:'16px', padding:'16px', width:'92%', maxWidth:'360px',
        border:'1px solid #3a4a6a'
      }}>
        <h3 className="font-bold mb-3" style={{color:'#e8edf5',fontSize:'16px',textAlign:'center'}}>✂️ Crop Image</h3>

        {/* Touch crop area */}
        <div ref={containerRef} style={{position:'relative',width:W,height:displayH,margin:'0 auto',touchAction:'none',userSelect:'none',WebkitUserSelect:'none'}}
          onMouseDown={e => startDrag(e, 'move')} onTouchStart={e => startDrag(e, 'move')}>
          <img src={src} style={{width:W,height:displayH,objectFit:'cover',pointerEvents:'none',borderRadius:'10px',display:'block'}} alt="" draggable={false} />

          {/* Dim overlay */}
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)',pointerEvents:'none',borderRadius:'10px'}} />
          {/* Clear crop window */}
          <div style={{position:'absolute',left:crop.x,top:crop.y,width:crop.w,height:crop.h,background:'transparent',border:'2px solid #d4a843',boxShadow:'0 0 0 999px rgba(0,0,0,0.55)',pointerEvents:'none',borderRadius:'4px'}} />

          {/* Corner handles (bigger for touch) */}
          {['se','sw','ne','nw'].map(h => {
            const off = Math.round(handleSize / 2);
            const cx = h.includes('e') ? crop.x + crop.w : crop.x;
            const cy = h.includes('s') ? crop.y + crop.h : crop.y;
            return (
              <div key={h}
                onMouseDown={e => { e.stopPropagation(); startDrag(e, h); }}
                onTouchStart={e => { e.stopPropagation(); startDrag(e, h); }}
                style={{
                  position:'absolute', left: cx - off, top: cy - off,
                  width: handleSize, height: handleSize,
                  background: '#d4a843', borderRadius: '50%',
                  zIndex: 20, cursor: 'pointer',
                  border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.5)'
                }} />
            );
          })}
        </div>

        {/* Size display */}
        <div className="mt-2 text-center" style={{color:'#6272a4',fontSize:'11px'}}>
          {aspectRatio && platforms?.length === 1
            ? `🖼️ Export: ${PLATFORMS.find(p => p.id === platforms[0])?.maxW}×${PLATFORMS.find(p => p.id === platforms[0])?.maxH}px`
            : '🖼️ Free crop (max 1920px)'}
        </div>

        {/* Aspect ratio quick buttons */}
        {!aspectRatio && (
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {[1, 1.91, 16/9, 9/16].map(r => {
              const label = r === 1 ? '1:1' : r === 1.91 ? '1.91:1' : r === 16/9 ? '16:9' : '9:16';
              return (
                <button key={r} onClick={() => setCrop(prev => {
                  const newH = Math.min(prev.w / r, displayH - prev.y);
                  return { ...prev, h: Math.max(newH, 30) };
                })}
                  style={{padding:'5px 12px',background:'#2a3a5a',border:'1px solid #3a4a6a',borderRadius:'8px',color:'#94a3b8',fontSize:'12px',cursor:'pointer'}}>
                  {label}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 mt-4">
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
    const msg = post.status === 'Scheduled' ? `✅ Post scheduled for ${post.scheduled}` : '✅ Post saved as draft. (Live posting coming with API keys)';
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
      <p className="text-sm mb-6" style={{color:'#8899bb'}}>Create posts for your Beta Testers. ✂️ Tap to crop!</p>

      {/* Platform Selection */}
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

      {/* Text Area */}
      <div className="mb-4">
        <label className="text-sm font-semibold mb-1 block" style={{color:'#94a3b8'}}>Post Content:</label>
        <textarea value={postText} onChange={e => setPostText(e.target.value)}
          placeholder="Write your post... Share a tip, testimonial, or promotion!"
          style={{width:'100%',minHeight:'120px',padding:'12px',borderRadius:'10px',background:'#1a2a4a',border:'1px solid #2a3a5a',color:'#e8edf5',fontSize:'14px',resize:'vertical',outline:'none',boxSizing:'border-box'}} />
        <div className="text-right text-xs mt-1" style={{color:'#6272a4'}}>{postText.length} chars</div>
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
            📷 Choose Image
          </button>
          {(croppedImage || imagePreview) && (
            <>
              <div className="relative" style={{maxWidth:'140px',width:'100%'}}>
                <img src={croppedImage || imagePreview} alt="Preview" style={{width:'100%',maxHeight:'90px',objectFit:'contain',borderRadius:'8px',background:'#0a1628'}} />
                <button onClick={removeImage}
                  style={{position:'absolute',top:-6,right:-6,background:'#ff5555',color:'#fff',border:'none',borderRadius:'50%',width:'22px',height:'22px',fontSize:'12px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:5}}>
                  ×
                </button>
              </div>
              <button onClick={() => setShowCrop(true)} style={{padding:'5px 12px',background:'#2a3a5a',border:'1px solid #d4a843',borderRadius:'8px',color:'#d4a843',cursor:'pointer',fontSize:'12px'}}>
                ✂️ Re-crop
              </button>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}} />
      </div>

      {/* Video Upload */}
      <div className="mb-4">
        <label className="text-sm font-semibold mb-1 block" style={{color:'#94a3b8'}}>Add Video / Short:</label>
        <div className="flex items-center gap-3">
          <button onClick={() => videoInputRef.current?.click()}
            style={{padding:'8px 16px',background:'#2a3a5a',border:'1px solid #3a4a6a',borderRadius:'8px',color:'#e8edf5',cursor:'pointer',fontSize:'13px'}}>
            🎬 Choose Video
          </button>
          {videoPreview && (
            <div className="relative" style={{maxWidth:'140px',width:'100%'}}>
              <video src={videoPreview} style={{width:'100%',maxHeight:'90px',objectFit:'contain',borderRadius:'8px',background:'#0a1628'}} controls />
              <button onClick={removeVideo}
                style={{position:'absolute',top:-6,right:-6,background:'#ff5555',color:'#fff',border:'none',borderRadius:'50%',width:'22px',height:'22px',fontSize:'12px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:5}}>
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
          <label className="text-xs font-semibold mb-1 block" style={{color:'#94a3b8'}}>Schedule Date:</label>
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

      {/* Post History */}
      <h3 className="text-lg font-bold mb-3" style={{color:'#e8edf5'}}>📋 Post History</h3>
      {postHistory.length === 0 ? (
        <p className="text-sm" style={{color:'#6272a4'}}>No posts yet.</p>
      ) : (
        <div className="space-y-3">
          {postHistory.map(post => (
            <div key={post.id} style={{padding:'12px',background:'#1a2a4a',border:'1px solid #2a3a5a',borderRadius:'10px'}}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex gap-1 mb-1 flex-wrap">
                    {post.platforms?.map(p => { const pl = PLATFORMS.find(x => x.id === p); return pl ? <span key={p} style={{fontSize:'11px'}}>{pl.icon}</span> : null; })}
                    <span style={{fontSize:'10px',padding:'1px 6px',borderRadius:'4px',background: post.status === 'Scheduled' ? 'rgba(212,168,67,0.2)' : 'rgba(98,114,164,0.2)',color: post.status === 'Scheduled' ? '#d4a843' : '#6272a4'}}>{post.status}</span>
                  </div>
                  <p className="text-sm" style={{color:'#e8edf5',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{post.text.length > 120 ? post.text.slice(0,120) + '...' : post.text}</p>
                  {post.image && <img src={post.image} alt="" style={{maxWidth:'140px',maxHeight:'60px',objectFit:'contain',borderRadius:'6px',marginTop:'4px',background:'#0a1628'}} />}
                  {post.video && <video src={post.video} style={{maxWidth:'140px',maxHeight:'60px',objectFit:'contain',borderRadius:'6px',marginTop:'4px',background:'#0a1628'}} controls />}
                  <div className="text-xs mt-1" style={{color:'#6272a4'}}>{post.company} · {new Date(post.createdAt).toLocaleDateString()}{post.scheduled ? ` · 📅 ${post.scheduled}` : ''}</div>
                </div>
                <button onClick={() => deletePost(post.id)} style={{background:'none',border:'none',color:'#ff5555',cursor:'pointer',fontSize:'16px',padding:'0 4px'}}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
