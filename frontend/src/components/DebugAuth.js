// Create src/components/DebugAuth.js
import React from 'react';
import { auth } from '../services/firebase';

const DebugAuth = () => {
  const [user, setUser] = React.useState(null);
  const [token, setToken] = React.useState('');

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const userToken = await user.getIdToken();
        setToken(userToken);
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshToken = async () => {
    if (user) {
      const newToken = await user.getIdToken(true); // Force refresh
      setToken(newToken);
    }
  };

  return (
    <div style={{ padding: '10px', background: '#f0f0f0', margin: '10px', borderRadius: '5px' }}>
      <h3>Auth Debug</h3>
      <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
      <p><strong>Token:</strong> {token ? 'Present' : 'Missing'}</p>
      {token && (
        <>
          <p><strong>Token preview:</strong> {token.substring(0, 20)}...</p>
          <button onClick={refreshToken}>Refresh Token</button>
        </>
      )}
    </div>
  );
};

export default DebugAuth;