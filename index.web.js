import React from 'react';
import ReactDOM from 'react-dom';

// Simple login screen - no external CSS needed
const LoginScreen = () => {
  return (
    <div className="frame-1-1" style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <div className="hello-2" style={{ marginBottom: '30px' }}>
        <div className="rectangle-9-3"></div>
        <img src="/snaplet-pjatk-project/figma/images/rectangle-4.png" className="rectangle-4" alt="logo" style={{ width: '120px', height: '120px', borderRadius: '60px' }} />
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#000', marginBottom: '40px' }}>📸 Snaplet PJATK</h1>

      <div style={{ width: '90%', maxWidth: '350px' }}>
        <input
          type="email"
          placeholder="Email"
          style={{
            width: '100%',
            padding: '15px',
            marginBottom: '15px',
            border: '1px solid #ddd',
            borderRadius: '10px',
            fontSize: '16px',
            backgroundColor: '#f9f9f9'
          }}
        />

        <input
          type="password"
          placeholder="Password"
          style={{
            width: '100%',
            padding: '15px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '10px',
            fontSize: '16px',
            backgroundColor: '#f9f9f9'
          }}
        />

        <p style={{ textAlign: 'right', color: '#3A2B20', fontSize: '14px', marginBottom: '25px' }}>
          Forgot your password?
        </p>

        <button
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: '#667eea',
            color: '#FDF5DD',
            border: 'none',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '15px'
          }}
        >
          Sign in
        </button>

        <p style={{ textAlign: 'center', color: '#3A2B20', fontSize: '14px', marginBottom: '20px' }}>
          Create new account
        </p>

        <p style={{ textAlign: 'center', color: '#3A2B20', fontSize: '14px', marginBottom: '15px' }}>
          Or continue with
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <button style={{ width: '60px', height: '60px', borderRadius: '30px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>
            <span style={{ fontSize: '24px' }}>f</span>
          </button>
          <button style={{ width: '60px', height: '60px', borderRadius: '30px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>
            <span style={{ fontSize: '24px' }}>G</span>
          </button>
          <button style={{ width: '60px', height: '60px', borderRadius: '30px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>
            <span style={{ fontSize: '24px' }}></span>
          </button>
        </div>
      </div>

      <p style={{ marginTop: '40px', color: '#888', fontSize: '12px' }}>
        React Native Web Demo • Figma Design
      </p>
    </div>
  );
};

// Render app
ReactDOM.render(
  <React.StrictMode>
    <LoginScreen />
  </React.StrictMode>,
  document.getElementById('root')
);
