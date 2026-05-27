import React, { useState } from 'react';
import { login, changePassword, isLoggedIn } from './auth';

export default function LoginModal({ onLogin, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }
    
    const result = await login(username, password);
    if (result.success) {
      if (onLogin) onLogin();
    } else {
      setError(result.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPass !== confirmPass) {
      setError('New passwords do not match.');
      return;
    }
    
    if (newPass.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    
    const result = await changePassword(oldPass, newPass);
    if (result.success) {
      setSuccess(result.message);
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setShowChangePassword(false), 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{
      position:'fixed', top:0, left:0, right:0, bottom:0,
      background:'rgba(5,10,25,0.85)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:1000
    }}>
      <div style={{
        background:'#0f1f3d', border:'1px solid #1a3a6c',
        borderRadius:'20px', padding:'36px', width:'380px',
        maxWidth:'92vw', boxShadow:'0 20px 60px rgba(0,0,0,0.5)'
      }}>
        {!showChangePassword ? (
          <>
            {/* Lock icon */}
            <div style={{textAlign:'center',marginBottom:'20px'}}>
              <div style={{
                width:'64px', height:'64px', borderRadius:'50%',
                background:'rgba(212,168,67,0.1)', border:'2px solid #d4a843',
                display:'flex', alignItems:'center', justifyContent:'center',
                margin:'0 auto 12px', fontSize:'28px'
              }}>🔐</div>
              <div style={{fontWeight:700,fontSize:'18px',color:'#fff'}}>Admin Access</div>
              <div style={{fontSize:'12px',color:'#8899bb',marginTop:'4px'}}>
                Sign in to configure SafePulse
              </div>
            </div>

            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{
                  width:'100%', padding:'12px 14px', marginBottom:'10px',
                  background:'#1a2a4a', border:'1px solid #2a3a5a',
                  borderRadius:'10px', color:'#e8edf5', fontSize:'14px',
                  outline:'none', boxSizing:'border-box'
                }}
                autoFocus
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width:'100%', padding:'12px 14px', marginBottom:'12px',
                  background:'#1a2a4a', border:'1px solid #2a3a5a',
                  borderRadius:'10px', color:'#e8edf5', fontSize:'14px',
                  outline:'none', boxSizing:'border-box'
                }}
              />

              {error && (
                <div style={{fontSize:'12px',color:'#ff5555',marginBottom:'10px',padding:'8px 10px',background:'rgba(255,85,85,0.1)',borderRadius:'6px'}}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" style={{
                width:'100%', padding:'12px', background:'#d4a843',
                color:'#0a1628', border:'none', borderRadius:'10px',
                fontWeight:700, fontSize:'14px', cursor:'pointer',
                transition:'0.3s', marginBottom:'10px'
              }}
              onMouseEnter={e => e.target.style.background='#e0b850'}
              onMouseLeave={e => e.target.style.background='#d4a843'}
              >
                🔑 Sign In
              </button>

              <button type="button" onClick={() => setShowChangePassword(true)}
                style={{
                  width:'100%', padding:'10px', background:'transparent',
                  color:'#8899bb', border:'1px solid #2a3a5a',
                  borderRadius:'10px', fontSize:'12px', cursor:'pointer',
                  transition:'0.3s'
                }}
                onMouseEnter={e => {e.target.style.borderColor='#d4a843';e.target.style.color='#d4a843'}}
                onMouseLeave={e => {e.target.style.borderColor='#2a3a5a';e.target.style.color='#8899bb'}}
              >
                🔄 Change Password
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{textAlign:'center',marginBottom:'20px'}}>
              <div style={{fontWeight:700,fontSize:'18px',color:'#fff'}}>🔄 Change Password</div>
              <div style={{fontSize:'12px',color:'#8899bb',marginTop:'4px'}}>
                Must be at least 8 characters
              </div>
            </div>

            <form onSubmit={handleChangePassword}>
              <input
                type="password"
                placeholder="Current Password"
                value={oldPass}
                onChange={e => setOldPass(e.target.value)}
                style={{
                  width:'100%', padding:'12px 14px', marginBottom:'10px',
                  background:'#1a2a4a', border:'1px solid #2a3a5a',
                  borderRadius:'10px', color:'#e8edf5', fontSize:'14px',
                  outline:'none', boxSizing:'border-box'
                }}
                autoFocus
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                style={{
                  width:'100%', padding:'12px 14px', marginBottom:'10px',
                  background:'#1a2a4a', border:'1px solid #2a3a5a',
                  borderRadius:'10px', color:'#e8edf5', fontSize:'14px',
                  outline:'none', boxSizing:'border-box'
                }}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                style={{
                  width:'100%', padding:'12px 14px', marginBottom:'12px',
                  background:'#1a2a4a', border:'1px solid #2a3a5a',
                  borderRadius:'10px', color:'#e8edf5', fontSize:'14px',
                  outline:'none', boxSizing:'border-box'
                }}
              />

              {error && (
                <div style={{fontSize:'12px',color:'#ff5555',marginBottom:'10px',padding:'8px 10px',background:'rgba(255,85,85,0.1)',borderRadius:'6px'}}>
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div style={{fontSize:'12px',color:'#50fa7b',marginBottom:'10px',padding:'8px 10px',background:'rgba(80,250,123,0.1)',borderRadius:'6px'}}>
                  ✅ {success}
                </div>
              )}

              <button type="submit" style={{
                width:'100%', padding:'12px', background:'#50fa7b',
                color:'#0a1628', border:'none', borderRadius:'10px',
                fontWeight:700, fontSize:'14px', cursor:'pointer',
                transition:'0.3s', marginBottom:'10px'
              }}
              onMouseEnter={e => e.target.style.background='#6aff9a'}
              onMouseLeave={e => e.target.style.background='#50fa7b'}
              >
                ✅ Save New Password
              </button>

              <button type="button" onClick={() => {setShowChangePassword(false);setError('');setSuccess('')}}
                style={{
                  width:'100%', padding:'10px', background:'transparent',
                  color:'#8899bb', border:'1px solid #2a3a5a',
                  borderRadius:'10px', fontSize:'12px', cursor:'pointer',
                  transition:'0.3s'
                }}
                onMouseEnter={e => {e.target.style.borderColor='#94a3b8';e.target.style.color='#94a3b8'}}
                onMouseLeave={e => {e.target.style.borderColor='#2a3a5a';e.target.style.color='#8899bb'}}
              >
                ← Back to Sign In
              </button>
            </form>
          </>
        )}

        {/* Powered by */}
        <div style={{textAlign:'center',marginTop:'16px',fontSize:'10px',color:'#556688',fontFamily:"'Orbitron',monospace",letterSpacing:'1px'}}>
          SafePulse — Powered by Frantz Enterprise
        </div>
      </div>
    </div>
  );
}
