import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';

const AuthDebugger = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [apiStatus, setApiStatus] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try {
          const userToken = await user.getIdToken();
          setToken(userToken);
        } catch (error) {
          console.error('Error getting token:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const testApiConnection = async () => {
    try {
      setApiStatus('Testing connection...');
      const response = await fetch('http://localhost:3001/api/members', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiStatus(`✅ Success! Got ${data.length} members`);
      } else {
        setApiStatus(`❌ Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setApiStatus(`❌ Connection failed: ${error.message}`);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f5f5f5', 
      border: '1px solid #ccc',
      margin: '20px',
      borderRadius: '8px'
    }}>
      <h3>Auth & API Debugger</h3>
      <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
      <p><strong>Token:</strong> {token ? 'Present' : 'Missing'}</p>
      {token && (
        <>
          <p><strong>Token preview:</strong> {token.substring(0, 20)}...</p>
          <button onClick={testApiConnection} style={{ margin: '10px 0' }}>
            Test API Connection
          </button>
          <p><strong>API Status:</strong> {apiStatus}</p>
        </>
      )}
    </div>
  );
};

export default AuthDebugger;