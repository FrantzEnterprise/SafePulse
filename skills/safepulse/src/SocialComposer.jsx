import React, { useState, useRef } from 'react';

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: '📘', color: '#1877F2', ratio: '1.91:1', maxW: 1200, maxH: 630 },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0A66C2', ratio: '1.91:1', maxW: 1200, maxH: 627 },
  { id: 'twitter', label: 'X / Twitter', icon: '🐦', color: '#1DA1F2', ratio: '16:9', maxW: 1600, maxH: 900 },
  { id: 'instagram', label: 'Instagram', icon: '📸', color: '#E4405F', ratio: '1:1', maxW: 1080, maxH: 1080 },
  { id: 'youtube', label: 'YouTube', icon: '▶️', color: '#FF0000', ratio: '16:9', maxW: 1920, maxH: 1080 },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: '#000000', ratio: '9:16', maxW: 1080, maxH: 1920 }
];

export default function SocialComposer({ config }) {
  const [postText, setPostText] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [postImage, setPostImage] = useState(null);
  const [postVideo, setPostVideo] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [postHistory, setPostHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sp_social_history') || '[]');
    } catch { return []; }
  });
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const renderPlatformSizes = () => {
    const sel = PLATFORMS.filter(p => selectedPlatforms.includes(p.id));
    if (sel.length === 0) return null;
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {sel.map(p => (
          <span key={p.id} style={{fontSize:'11px',padding:'3px 8px',background:'#1a2a4a',borderRadius:'6px',border:'1px solid #2a3a5a',color:'#94a3b8'}}>
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
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
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

  const removeImage = () => {
    setPostImage(null);
    setImagePreview(null);
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
      image: imagePreview,
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

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4" style={{color:'#d4a843',fontFamily:'Orbitron,monospace',letterSpacing:'1px'}}>
        📢 Social Post Composer
      </h2>
      <p className="text-sm mb-6" style={{color:'#8899bb'}}>
        Create posts for your Beta Testers across platforms. Save as draft or schedule — live posting requires platform API keys.
      </p>

      {/* Platform Selection */}
      <div className="mb-4">
        <label className="text-sm font-semibold mb-2 block" style={{color:'#94a3b8'}}>Post to:</label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => togglePlatform(p.id)}
              style={{
                padding:'6px 14px', borderRadius:'8px', border: selectedPlatforms.includes(p.id) ? `2px solid ${p.color}` : '1px solid #2a3a5a',
                background: selectedPlatforms.includes(p.id) ? `${p.color}22` : 'transparent',
                color: selectedPlatforms.includes(p.id) ? p.color : '#94a3b8', fontSize:'13px', cursor:'pointer', transition:'0.2s'
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
        <div className="flex items-center gap-3">
          <button onClick={() => fileInputRef.current?.click()}
            style={{padding:'8px 16px', background:'#2a3a5a', border:'1px solid #3a4a6a', borderRadius:'8px', color:'#e8edf5', cursor:'pointer', fontSize:'13px'}}>
            📷 Choose Image
          </button>
          {imagePreview && (
            <div className="relative" style={{maxWidth:'280px',width:'100%'}}>
              <img src={imagePreview} alt="Preview" style={{width:'100%',maxHeight:'160px',objectFit:'contain',borderRadius:'8px',background:'#0a1628'}} />
              <button onClick={removeImage}
                style={{position:'absolute',top:-6,right:-6,background:'#ff5555',color:'#fff',border:'none',borderRadius:'50%',width:'20px',height:'20px',fontSize:'11px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                ×
              </button>
            </div>
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
            <div className="relative" style={{maxWidth:'280px',width:'100%'}}>
              <video src={videoPreview} style={{width:'100%',maxHeight:'160px',objectFit:'contain',borderRadius:'8px',background:'#0a1628'}} controls />
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
              padding:'12px', background:'#1a2a4a', border:'1px solid #2a3a5a',
              borderRadius:'10px'
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
                  {post.image && <img src={post.image} alt="" style={{maxWidth:'200px',maxHeight:'80px',objectFit:'contain',borderRadius:'6px',marginTop:'4px',background:'#0a1628'}} />}
                  {post.video && <video src={post.video} style={{maxWidth:'200px',maxHeight:'80px',objectFit:'contain',borderRadius:'6px',marginTop:'4px',background:'#0a1628'}} controls />}
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
