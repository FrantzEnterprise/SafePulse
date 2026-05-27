import React, { useState, useRef } from 'react';

export default function TestimonialGallery({ config }) {
  const [testimonials, setTestimonials] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sp_testimonials') || '[]');
    } catch { return []; }
  });
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [quote, setQuote] = useState('');
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [rating, setRating] = useState(5);
  const [activeTab, setActiveTab] = useState('submit');
  const fileVideoRef = useRef(null);
  const fileImageRef = useRef(null);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideo(file);
    const reader = new FileReader();
    reader.onload = () => setVideoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const submitTestimonial = () => {
    if (!name.trim() || !quote.trim()) {
      alert('Name and testimonial text are required.');
      return;
    }

    const t = {
      id: Date.now().toString(36),
      name: name.trim(),
      company: company.trim() || null,
      quote: quote.trim(),
      video: videoPreview,
      image: imagePreview,
      rating,
      createdAt: new Date().toISOString(),
      approved: false,
      featured: false
    };

    const updated = [t, ...testimonials];
    setTestimonials(updated);
    localStorage.setItem('sp_testimonials', JSON.stringify(updated));

    // Reset form
    setName('');
    setCompany('');
    setQuote('');
    setVideo(null);
    setVideoPreview(null);
    setImage(null);
    setImagePreview(null);
    setRating(5);

    alert('✅ Testimonial saved!');
  };

  const deleteTestimonial = (id) => {
    if (!confirm('Delete this testimonial?')) return;
    const updated = testimonials.filter(t => t.id !== id);
    setTestimonials(updated);
    localStorage.setItem('sp_testimonials', JSON.stringify(updated));
  };

  const toggleApproved = (id) => {
    const updated = testimonials.map(t =>
      t.id === id ? { ...t, approved: !t.approved } : t
    );
    setTestimonials(updated);
    localStorage.setItem('sp_testimonials', JSON.stringify(updated));
  };

  const toggleFeatured = (id) => {
    const updated = testimonials.map(t =>
      t.id === id ? { ...t, featured: !t.featured } : t
    );
    setTestimonials(updated);
    localStorage.setItem('sp_testimonials', JSON.stringify(updated));
  };

  const approved = testimonials.filter(t => t.approved);
  const pending = testimonials.filter(t => !t.approved);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4" style={{color:'#d4a843',fontFamily:'Orbitron,monospace',letterSpacing:'1px'}}>
        🎬 Video Testimonials
      </h2>
      <p className="text-sm mb-6" style={{color:'#8899bb'}}>
        Collect and manage customer testimonials with video, photos, and ratings. Approve, feature, or delete.
      </p>

      {/* Tab buttons */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('submit')}
          style={{
            padding:'8px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:600,
            background: activeTab === 'submit' ? '#d4a843' : '#2a3a5a',
            color: activeTab === 'submit' ? '#0a1628' : '#94a3b8',
            border:'none', cursor:'pointer'
          }}>
          📝 Submit
        </button>
        <button onClick={() => setActiveTab('gallery')}
          style={{
            padding:'8px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:600,
            background: activeTab === 'gallery' ? '#d4a843' : '#2a3a5a',
            color: activeTab === 'gallery' ? '#0a1628' : '#94a3b8',
            border:'none', cursor:'pointer'
          }}>
          🖼️ Gallery ({approved.length})
        </button>
        <button onClick={() => setActiveTab('pending')}
          style={{
            padding:'8px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:600,
            background: activeTab === 'pending' ? '#d4a843' : '#2a3a5a',
            color: activeTab === 'pending' ? '#0a1628' : '#94a3b8',
            border:'none', cursor:'pointer'
          }}>
          ⏳ Pending ({pending.length})
        </button>
      </div>

      {/* ─── SUBMIT ─── */}
      {activeTab === 'submit' && (
        <div style={{background:'#1a2a4a', borderRadius:'12px', padding:'16px', border:'1px solid #2a3a5a'}}>
          <div className="mb-3">
            <label className="text-xs font-semibold mb-1 block" style={{color:'#94a3b8'}}>Customer Name *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              style={{width:'100%',padding:'10px',background:'#0f1f3d',border:'1px solid #2a3a5a',borderRadius:'8px',color:'#e8edf5',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
              placeholder="John Doe" />
          </div>
          <div className="mb-3">
            <label className="text-xs font-semibold mb-1 block" style={{color:'#94a3b8'}}>Company (optional)</label>
            <input value={company} onChange={e => setCompany(e.target.value)}
              style={{width:'100%',padding:'10px',background:'#0f1f3d',border:'1px solid #2a3a5a',borderRadius:'8px',color:'#e8edf5',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
              placeholder="ABC Safe Company" />
          </div>
          <div className="mb-3">
            <label className="text-xs font-semibold mb-1 block" style={{color:'#94a3b8'}}>Testimonial *</label>
            <textarea value={quote} onChange={e => setQuote(e.target.value)}
              style={{width:'100%',minHeight:'80px',padding:'10px',background:'#0f1f3d',border:'1px solid #2a3a5a',borderRadius:'8px',color:'#e8edf5',fontSize:'14px',resize:'vertical',outline:'none',boxSizing:'border-box'}}
              placeholder='"They saved our safe after the fire..."' />
            <div className="text-right text-xs mt-1" style={{color:'#6272a4'}}>{quote.length} chars</div>
          </div>

          {/* Star Rating */}
          <div className="mb-3">
            <label className="text-xs font-semibold mb-1 block" style={{color:'#94a3b8'}}>Rating:</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating(n)}
                  style={{background:'none',border:'none',fontSize:'24px',cursor:'pointer',padding:'0 2px'}}>
                  {n <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          {/* Video Upload */}
          <div className="mb-3">
            <label className="text-xs font-semibold mb-1 block" style={{color:'#94a3b8'}}>Video Testimonial:</label>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => fileVideoRef.current?.click()}
                style={{padding:'8px 16px', background:'#2a3a5a', border:'1px solid #3a4a6a', borderRadius:'8px', color:'#e8edf5', cursor:'pointer', fontSize:'13px'}}>
                🎬 Upload Video
              </button>
              {videoPreview && (
                <div className="relative" style={{maxWidth:'200px',width:'100%'}}>
                  <video src={videoPreview} style={{width:'100%',maxHeight:'120px',objectFit:'contain',borderRadius:'8px',background:'#0a1628'}} controls />
                  <button onClick={() => { setVideo(null); setVideoPreview(null); }}
                    style={{position:'absolute',top:-6,right:-6,background:'#ff5555',color:'#fff',border:'none',borderRadius:'50%',width:'20px',height:'20px',fontSize:'11px',cursor:'pointer'}}>
                    ×
                  </button>
                </div>
              )}
            </div>
            <input ref={fileVideoRef} type="file" accept="video/*" onChange={handleVideoUpload} style={{display:'none'}} />
          </div>

          {/* Photo Upload */}
          <div className="mb-4">
            <label className="text-xs font-semibold mb-1 block" style={{color:'#94a3b8'}}>Photo (optional):</label>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => fileImageRef.current?.click()}
                style={{padding:'8px 16px', background:'#2a3a5a', border:'1px solid #3a4a6a', borderRadius:'8px', color:'#e8edf5', cursor:'pointer', fontSize:'13px'}}>
                📷 Upload Photo
              </button>
              {imagePreview && (
                <div className="relative" style={{maxWidth:'120px'}}>
                  <img src={imagePreview} alt="" style={{width:'100%',maxHeight:'80px',objectFit:'contain',borderRadius:'6px',background:'#0a1628'}} />
                  <button onClick={() => { setImage(null); setImagePreview(null); }}
                    style={{position:'absolute',top:-6,right:-6,background:'#ff5555',color:'#fff',border:'none',borderRadius:'50%',width:'20px',height:'20px',fontSize:'11px',cursor:'pointer'}}>
                    ×
                  </button>
                </div>
              )}
            </div>
            <input ref={fileImageRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}} />
          </div>

          <button onClick={submitTestimonial}
            style={{
              width:'100%', padding:'12px', background:'#d4a843', color:'#0a1628',
              border:'none', borderRadius:'10px', fontWeight:700, fontSize:'14px', cursor:'pointer'
            }}>
            💾 Save Testimonial
          </button>
        </div>
      )}

      {/* ─── GALLERY ─── */}
      {activeTab === 'gallery' && (
        <div>
          {approved.length === 0 ? (
            <p className="text-sm" style={{color:'#6272a4'}}>No approved testimonials yet. Approve from the Pending tab.</p>
          ) : (
            <div className="space-y-4">
              {approved.map(t => (
                <div key={t.id} style={{
                  padding:'14px', background:'#1a2a4a', border: t.featured ? '2px solid #d4a843' : '1px solid #2a3a5a',
                  borderRadius:'12px'
                }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{fontWeight:700,color:'#e8edf5',fontSize:'14px'}}>{t.name}</span>
                        {t.company && <span style={{color:'#6272a4',fontSize:'12px'}}>{t.company}</span>}
                        {t.featured && <span style={{fontSize:'11px',padding:'1px 6px',borderRadius:'4px',background:'rgba(212,168,67,0.2)',color:'#d4a843'}}>⭐ Featured</span>}
                      </div>
                      <div className="flex gap-0.5 mb-1">
                        {Array.from({length:5}).map((_, i) => (
                          <span key={i} style={{fontSize:'14px'}}>{i < t.rating ? '⭐' : '☆'}</span>
                        ))}
                      </div>
                      <p className="text-sm" style={{color:'#c8d0dc',whiteSpace:'pre-wrap',fontStyle:'italic'}}>"{t.quote}"</p>
                      {t.video && (
                        <video src={t.video} controls style={{maxWidth:'100%',maxHeight:'200px',borderRadius:'8px',marginTop:'8px',background:'#0a1628'}} />
                      )}
                      {t.image && !t.video && (
                        <img src={t.image} alt="" style={{maxWidth:'200px',maxHeight:'100px',objectFit:'contain',borderRadius:'6px',marginTop:'8px',background:'#0a1628'}} />
                      )}
                      <div className="text-xs mt-2" style={{color:'#6272a4'}}>
                        {new Date(t.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => toggleFeatured(t.id)}
                        style={{background:'none',border:'1px solid #d4a843',color:'#d4a843',borderRadius:'6px',padding:'3px 8px',fontSize:'11px',cursor:'pointer'}}>
                        {t.featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button onClick={() => deleteTestimonial(t.id)}
                        style={{background:'none',border:'1px solid #ff5555',color:'#ff5555',borderRadius:'6px',padding:'3px 8px',fontSize:'11px',cursor:'pointer'}}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── PENDING ─── */}
      {activeTab === 'pending' && (
        <div>
          {pending.length === 0 ? (
            <p className="text-sm" style={{color:'#6272a4'}}>No pending testimonials. Submit your first one above.</p>
          ) : (
            <div className="space-y-3">
              {pending.map(t => (
                <div key={t.id} style={{padding:'12px',background:'#1a2a4a',border:'1px solid #2a3a5a',borderRadius:'10px'}}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{fontWeight:700,color:'#e8edf5',fontSize:'13px'}}>{t.name}</span>
                        {t.company && <span style={{color:'#6272a4',fontSize:'11px'}}>{t.company}</span>}
                      </div>
                      <p className="text-sm" style={{color:'#c8d0dc',whiteSpace:'pre-wrap',fontStyle:'italic'}}>"{t.quote.length > 100 ? t.quote.slice(0,100) + '...' : t.quote}"</p>
                      <div className="text-xs mt-1" style={{color:'#6272a4'}}>{new Date(t.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => toggleApproved(t.id)}
                        style={{background:'#50fa7b',border:'none',color:'#0a1628',borderRadius:'6px',padding:'4px 10px',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>
                        ✅ Approve
                      </button>
                      <button onClick={() => deleteTestimonial(t.id)}
                        style={{background:'none',border:'1px solid #ff5555',color:'#ff5555',borderRadius:'6px',padding:'3px 8px',fontSize:'11px',cursor:'pointer'}}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
