import React, { useState, useRef, useEffect, useCallback } from 'react';

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: '📘', color: '#1877F2', ratio: '1.91:1', maxW: 1200, maxH: 630 },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0A66C2', ratio: '1.91:1', maxW: 1200, maxH: 627 },
  { id: 'twitter', label: 'X / Twitter', icon: '🐦', color: '#1DA1F2', ratio: '16:9', maxW: 1600, maxH: 900 },
  { id: 'instagram', label: 'Instagram', icon: '📸', color: '#E4405F', ratio: '1:1', maxW: 1080, maxH: 1080 },
  { id: 'youtube', label: 'YouTube', icon: '▶️', color: '#FF0000', ratio: '16:9', maxW: 1920, maxH: 1080 },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: '#000000', ratio: '9:16', maxW: 1080, maxH: 1920 }
];

/* ──────── Image Crop Modal ──────── */
function CropModal({ src, aspectRatio, platforms, onSave, onClose }) {
  const imgRef = useRef(null);
  const [img, setImg] = useState(null);
  const containerRef = useRef(null);
  const [crop, setCrop] = useState({ x:0, y:0, w:100, h:100, nw:100, nh:100 });
  const [dragging, setDragging] = useState(null); // 'move'|'se'|'sw'|'ne'|'nw'
  const dragStart = useRef(null);

  useEffect(() => {
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = src;
  }, [src]);

  const displayW = 320;
  const scale = img ? displayW / img.naturalWidth : 1;
  const displayH = img ? Math.min(img.naturalHeight * scale, 320) : 240;

  const toRel = useCallback((clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const handlePointerDown = useCallback((e, handle) => {
    e.preventDefault();
    e.target.setPointerCapture(e.pointerId);
    setDragging(handle);
    dragStart.current = { ...toRel(e.clientX, e.clientY), ...crop };
  }, [toRel, crop]);

  const handlePointerMove = useCallback(e => {
    if (!dragging || !dragStart.current) return;
    const pt = toRel(e.clientX, e.clientY);
    const ds = dragStart.current;
    let { x, y, w, h } = crop;

    if (dragging === 'move') {
      const dx = pt.x - ds.x, dy = pt.y - ds.y;
      x = clamp(ds.lx + dx, 0, displayW - w);
      y = clamp(ds.ly + dy, 0, displayH - h);
    } else if (dragging === 'se') {
      w = clamp(pt.x - x, 20, displayW - x);
      h = aspectRatio ? w / aspectRatio : clamp(pt.y - y, 20, displayH - y);
    } else if (dragging === 'ne') {
      const newW = clamp(pt.x - x, 20, displayW - x);
      const newH = aspectRatio ? newW / aspectRatio : clamp(y + h - pt.y, 20, displayH);
      y = y + h - newH;
      w = newW; h = newH;
    } else if (dragging === 'sw') {
      const newW = clamp(x + w - pt.x, 20, displayW);
      const newH = aspectRatio ? newW / aspectRatio : clamp(pt.y - y, 20, displayH - y);
      x = x + w - newW;
      w = newW; h = newH;
    } else if (dragging === 'nw') {
      const newW = clamp(x + w - pt.x, 20, displayW);
      const newH = aspectRatio ? newW / aspectRatio : clamp(y + h - pt.y, 20, displayH);
      x = x + w - newW; y = y + h - newH;
      w = newW; h = newH;
    }
    setCrop({ x, y, w, h });
  }, [dragging, crop, displayW, displayH, aspectRatio, toRel]);

  const handlePointerUp = useCallback(() => {
    setDragging(null);
    dragStart.current = null;
  }, []);

  const applyCrop = () => {
    if (!img) return;
    const sx = crop.x / scale, sy = crop.y / scale;
    const sw = crop.w / scale, sh = crop.h / scale;

    // Output at exact platform dimensions
    if (aspectRatio && platforms && platforms.length === 1) {
      const p = PLATFORMS.find(x => x.id === platforms[0]);
      if (p) {
        const canvas = document.createElement('canvas');
        canvas.width = p.maxW; canvas.height = p.maxH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, p.maxW, p.maxH);
        onSave(canvas.toDataURL('image/jpeg', 0.92));
        return;
      }
    }

    // Multiple platforms or free crop: output at the crop's native resolution (max 1920px)
    const maxDim = Math.max(sw, sh);
    const scaleOut = Math.min(1, 1920 / maxDim);
    const canvas = document.createElement('canvas');
    const outW = Math.round(sw * scaleOut);
    const outH = Math.round(sh * scaleOut);
    canvas.width = outW; canvas.height = outH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
    onSave(canvas.toDataURL('image/jpeg', 0.92));
  };

  if (!img) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}><div className="text-white text-sm">Loading...</div></div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'#1a2a4a', borderRadius:'14px', padding:'16px', width:'360px',
        border:'1px solid #2a3a5a'
      }}>
        <h3 className="font-bold mb-3" style={{color:'#e8edf5',fontSize:'15px'}}>✂️ Crop Image</h3>

        {/* Crop Canvas */}
        <div ref={containerRef} style={{position:'relative',width:displayW,height:displayH,margin:'0 auto',cursor: dragging ? 'grabbing' : 'grab', touchAction:'none'}}
          onPointerDown={e => handlePointerDown(e, 'move')} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
          <img src={src} style={{width:displayW,height:displayH,objectFit:'cover',pointerEvents:'none',borderRadius:'8px'}} alt="" />

          {/* Overlay */}
          <div style={{position:'absolute',left:crop.x,top:crop.y,width:crop.w,height:crop.h,border:'2px solid #d4a843',background:'rgba(212,168,67,0.08)',pointerEvents:'none',borderRadius:'4px'}} />

          {/* Drag handles */}
          {['se','sw','ne','nw'].map(h => {
            const pos = {
              se: { left: crop.x + crop.w - 6, top: crop.y + crop.h - 6 },
              sw: { left: crop.x - 6, top: crop.y + crop.h - 6 },
              ne: { left: crop.x + crop.w - 6, top: crop.y - 6 },
              nw: { left: crop.x - 6, top: crop.y - 6 }
            };
            return (
              <div key={h} onPointerDown={e => handlePointerDown(e, h)}
                style={{position:'absolute',...pos[h],width:'12px',height:'12px',background:'#d4a843',borderRadius:'2px',cursor: h==='se'?'nwse-resize':h==='sw'?'nesw-resize':h==='ne'?'nesw-resize':'nwse-resize',zIndex:10}} />
            );
          })}
        </div>

        {/* Aspect ratio buttons */}
        {!aspectRatio && (
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {[1, 1.91, 16/9, 9/16].map(r => (
              <button key={r} onClick={() => setCrop(prev => {
                const newH = prev.w / r;
                return { ...prev, h: Math.min(newH, displayH - prev.y) };
              })} style={{padding:'3px 10px',background:'#2a3a5a',border:'1px solid #3a4a6a',borderRadius:'6px',color:'#94a3b8',fontSize:'11px',cursor:'pointer'}}>
                {r === 1 ? '1:1' : r === 1.91 ? '1.91:1' : r === 16/9 ? '16:9' : '9:16'}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button onClick={onClose} style={{flex:1,padding:'10px',background:'#2a3a5a',border:'none',borderRadius:'8px',color:'#94a3b8',cursor:'pointer',fontSize:'13px'}}>Cancel</button>
          <button onClick={applyCrop} style={{flex:1,padding:'10px',background:'#d4a843',border:'none',borderRadius:'8px',color:'#0a1628',fontWeight:700,cursor:'pointer',fontSize:'13px'}}>Apply Crop</button>
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
      if (p) {
        const [w, h] = p.ratio.split(':').map(Number);
        return w / h;
      }
    }
    return null; // free crop for multiple platforms
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
    reader.onload = () => {
      setImagePreview(reader.result);
      setShowCrop(true);
    };
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
    setPostImage(null);
    setImagePreview(null);
    setCroppedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeVideo = () => {
    setPostVideo(null);
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handlePost = () => {
    if (!postText.trim()) {
      alert('Please write something for your post.');
      return;
    }
    if (selectedPlatforms.length === 0) {
      alert('Select at least one platform to post to.');
      return;
    }

    const post = {
      id: Date.now().toString(36),
      text: postText,
      platforms: selectedPlatforms,
      image: croppedImage || imagePreview,
      video: videoPreview,
      scheduled: scheduledDate && scheduledTime ? `${scheduledDate} ${scheduledTime}` : null,
      createdAt: new Date().toISOString(),
      status: scheduledDate && scheduledTime ? 'Scheduled' : 'Draft',
      company: config?.demoMode ? config.demoCompany : (config?.company?.name || 'SafePulse')
    };

    const updated = [post, ...postHistory];
    setPostHistory(updated);
    localStorage.setItem('sp_social_history', JSON.stringify(updated));

    // Reset form
    setPostText('');
    setSelectedPlatforms([]);
    removeImage();
    removeVideo();
    setScheduledDate('');
    setScheduledTime('');

    const msg = post.status === 'Scheduled'
      ? `✅ Post scheduled for ${post.scheduled}`
      : '✅ Post saved as draft. (Live posting coming with API keys)';
    alert(msg);
  };

  const deletePost = (id) => {
    const updated = postHistory.filter(p => p.id !== id);
    setPostHistory(updated);
    localStorage.setItem('sp_social_history', JSON.stringify(updated));
  };

  const activeWidth = 320;
  const displayImage = croppedImage || imagePreview;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Crop Modal */}
      {showCrop && imagePreview && (
        <CropModal
          src={imagePreview}
          aspectRatio={getActiveAspectRatio()}
          platforms={selectedPlatforms}
          onSave={handleCropSave}
          onClose={() => setShowCrop(false)}
        />
      )}

      <h2 className="text-xl font-bold mb-4" style={{color:'#d4a843',fontFamily:'Orbitron,monospace',letterSpacing:'1px'}}>
        📢 Social Post Composer
      </h2>
      <p className="text-sm mb-6" style={{color:'#8899bb'}}>
        Create posts for your Beta Testers across platforms. ✂️ Crop tool auto-resizes to fit!
      </p>

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
                color: selectedPlatforms.includes(p.id) ? p.color : '#94a3b8',
                fontSize:'13px', cursor:'pointer', transition:'0.2s'
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
          style={{
            width:'100%', minHeight:'120px', padding:'12px', borderRadius:'10px',
            background:'#1a2a4a', border:'1px solid #2a3a5a', color:'#e8edf5',
            fontSize:'14px', resize:'vertical', outline:'none', boxSizing:'border-box'
          }}
        />
        <div className="text-right text-xs mt-1" style={{color:'#6272a4'}}>{postText.length} chars</div>
      </div>

      {/* Platform Size Hints */}
      {selectedPlatforms.length > 0 && (
        <div className="mb-3">
          <label className="text-xs font-semibold mb-1 block" style={{color:'#94a3b8'}}>📐 Recommended sizes for selected platforms:</label>
          {renderPlatformSizes()}
        </div>
      )}

      {/* Image Upload */}
      <div className="mb-4">
        <label className="text-sm font-semibold mb-1 block" style={{color:'#94a3b8'}}>Add Image:</label>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => fileInputRef.current?.click()}
            style={{padding:'8px 16px', background:'#2a3a5a', border:'1px solid #3a4a6a', borderRadius:'8px', color:'#e8edf5', cursor:'pointer', fontSize:'13px'}}>
            📷 Choose Image
          </button>
          {displayImage && (
            <>
              <div className="relative" style={{maxWidth:'200px',width:'100%'}}>
                <img src={displayImage} alt="Preview" style={{width:'100%',maxHeight:'140px',objectFit:'contain',borderRadius:'8px',background:'#0a1628'}} />
                <button onClick={removeImage}
                  style={{position:'absolute',top:-6,right:-6,background:'#ff5555',color:'#fff',border:'none',borderRadius:'50%',width:'20px',height:'20px',fontSize:'11px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  ×
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => setShowCrop(true)} style={{padding:'4px 10px',background:'#2a3a5a',border:'1px solid #d4a843',borderRadius:'6px',color:'#d4a843',cursor:'pointer',fontSize:'11px'}}>
                  ✂️ Crop
                </button>
                {selectedPlatforms.length === 1 && (
                  <span className="text-xs" style={{color:'#50fa7b'}}>Locked to {PLATFORMS.find(p => p.id === selectedPlatforms[0])?.ratio}</span>
                )}
                {croppedImage && <span className="text-xs" style={{color:'#50fa7b'}}>✓ Cropped</span>}
              </div>
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
            style={{padding:'8px 16px', background:'#2a3a5a', border:'1px solid #3a4a6a', borderRadius:'8px', color:'#e8edf5', cursor:'pointer', fontSize:'13px'}}>
            🎬 Choose Video
          </button>
          {videoPreview && (
            <div className="relative" style={{maxWidth:'200px',width:'100%'}}>
              <video src={videoPreview} style={{width:'100%',maxHeight:'140px',objectFit:'contain',borderRadius:'8px',background:'#0a1628'}} controls />
              <button onClick={removeVideo}
                style={{position:'absolute',top:-6,right:-6,background:'#ff5555',color:'#fff',border:'none',borderRadius:'50%',width:'20px',height:'20px',fontSize:'11px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
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
          <label className="text-xs font-semibold mb-1 block" style={{color:'#94a3b8'}}>Schedule Date (optional):</label>
          <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
            style={{width:'100%',padding:'8px',background:'#1a2a4a',border:'1px solid #2a3a5a',borderRadius:'8px',color:'#e8edf5',fontSize:'13px',outline:'none',boxSizing:'border-box'}} />
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold mb-1 block" style={{color:'#94a3b8'}}>Time:</label>
          <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
            style={{width:'100%',padding:'8px',background:'#1a2a4a',border:'1px solid #2a3a5a',borderRadius:'8px',color:'#e8edf5',fontSize:'13px',outline:'none',boxSizing:'border-box'}} />
        </div>
      </div>

      {/* Post Button */}
      <button onClick={handlePost}
        style={{
          width:'100%', padding:'12px', background:'#d4a843', color:'#0a1628',
          border:'none', borderRadius:'10px', fontWeight:700, fontSize:'14px',
          cursor:'pointer', transition:'0.3s', marginBottom:'24px'
        }}
        onMouseEnter={e => e.target.style.background='#e0b850'}
        onMouseLeave={e => e.target.style.background='#d4a843'}>
        {scheduledDate && scheduledTime ? '📅 Schedule Post' : '💾 Save Post'}
      </button>

      {/* Post History */}
      <h3 className="text-lg font-bold mb-3" style={{color:'#e8edf5'}}>📋 Post History</h3>
      {postHistory.length === 0 ? (
        <p className="text-sm" style={{color:'#6272a4'}}>No posts yet. Create your first one above.</p>
      ) : (
        <div className="space-y-3">
          {postHistory.map(post => (
            <div key={post.id} style={{
              padding:'12px', background:'#1a2a4a', border:'1px solid #2a3a5a', borderRadius:'10px'
            }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex gap-1 mb-1 flex-wrap">
                    {post.platforms?.map(p => {
                      const pl = PLATFORMS.find(x => x.id === p);
                      return pl ? <span key={p} style={{fontSize:'11px'}}>{pl.icon}</span> : null;
                    })}
                    <span style={{
                      fontSize:'10px', padding:'1px 6px', borderRadius:'4px',
                      background: post.status === 'Scheduled' ? 'rgba(212,168,67,0.2)' : 'rgba(98,114,164,0.2)',
                      color: post.status === 'Scheduled' ? '#d4a843' : '#6272a4'
                    }}>{post.status}</span>
                  </div>
                  <p className="text-sm" style={{color:'#e8edf5',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>
                    {post.text.length > 120 ? post.text.slice(0,120) + '...' : post.text}
                  </p>
                  {post.image && <img src={post.image} alt="" style={{maxWidth:'180px',maxHeight:'70px',objectFit:'contain',borderRadius:'6px',marginTop:'4px',background:'#0a1628'}} />}
                  {post.video && <video src={post.video} style={{maxWidth:'180px',maxHeight:'70px',objectFit:'contain',borderRadius:'6px',marginTop:'4px',background:'#0a1628'}} controls />}
                  <div className="text-xs mt-1" style={{color:'#6272a4'}}>
                    {post.company} · {new Date(post.createdAt).toLocaleDateString()}
                    {post.scheduled ? ` · 📅 ${post.scheduled}` : ''}
                  </div>
                </div>
                <button onClick={() => deletePost(post.id)}
                  style={{background:'none',border:'none',color:'#ff5555',cursor:'pointer',fontSize:'16px',padding:'0 4px'}}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
