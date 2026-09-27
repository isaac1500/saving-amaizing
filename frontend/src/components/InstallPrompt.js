// src/components/InstallPrompt.js
import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Zap, Shield, Wifi } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed === 'true') {
      setHasBeenDismissed(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show immediately when available
      setShowPrompt(true);
      console.log('✅ Install prompt ready to show');
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Also try to trigger it manually after page load
    setTimeout(() => {
      if (!deferredPrompt && !showPrompt) {
        // For browsers that don't fire beforeinstallprompt automatically
        setShowPrompt(true);
      }
    }, 2000);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      console.log('✅ App installed successfully');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [deferredPrompt, showPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted install');
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      // Show manual install instructions
      showManualInstructions();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setHasBeenDismissed(true);
    localStorage.setItem('installPromptDismissed', 'true');
    // Reset after 7 days
    setTimeout(() => {
      localStorage.removeItem('installPromptDismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  const showManualInstructions = () => {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    
    let message = '';
    if (isChrome) {
      message = 'To install this app:\n\n1. Click the menu (⋮) in top-right corner\n2. Click "Install App"\n3. Click "Install"';
    } else if (isSafari) {
      message = 'To install this app:\n\n1. Tap the Share button (📤)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"';
    } else if (isFirefox) {
      message = 'To install this app:\n\n1. Click the menu (☰)\n2. Click "Install" or "Add to Home Screen"';
    } else {
      message = 'To install this app, look for "Install App" or "Add to Home Screen" in your browser menu';
    }
    alert(message);
  };

  // Don't show if installed or dismissed
  if (isInstalled || hasBeenDismissed) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease'
    }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              transform: translateY(50px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
      
      <div style={{
        background: 'white',
        borderRadius: '32px',
        maxWidth: '450px',
        width: '90%',
        margin: '20px',
        overflow: 'hidden',
        animation: 'slideUp 0.4s ease',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        {/* Header with gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          padding: '32px 24px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <img src="/logo.png" alt="Logo" style={{ width: '70px', height: '70px' }} />
          </div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>Install Our App</h2>
          <p style={{ margin: '12px 0 0', opacity: 0.95, fontSize: '15px' }}>
            Get the best experience with our mobile app
          </p>
        </div>
        
        {/* Features */}
        <div style={{ padding: '28px 24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#333' }}>Why Install?</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#f0fdf4',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap size={20} color="#10b981" />
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>Lightning Fast</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Instant loading and smooth experience</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#eff6ff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Wifi size={20} color="#3b82f6" />
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>Works Offline</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Access your savings even without internet</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#fef3c7',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield size={20} color="#f59e0b" />
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>Secure & Private</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Your data is encrypted and safe</div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleInstall}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              border: 'none',
              borderRadius: '16px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(139,92,246,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Download size={18} />
            Install Now
          </button>
          
          <button
            onClick={handleDismiss}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              color: '#64748b',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Maybe Later
          </button>
          
          <p style={{
            textAlign: 'center',
            fontSize: '11px',
            color: '#94a3b8',
            marginTop: '16px',
            marginBottom: 0
          }}>
            No credit card required • Free to use • 11.5% annual interest
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;