import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div className="screen register-screen">
      {/* Logo Section */}
      <div className="logo-container">
        <div className="logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="8" width="32" height="32" rx="6" stroke="black" strokeWidth="2"/>
            <path d="M20 18L28 24L20 30V18Z" fill="black"/>
          </svg>
          <span className="logo-text">Snaplet</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="screen-title">Create account</h1>

      {/* Form */}
      <div className="form-container">
        <div className="input-group">
          <label className="input-label">Email</label>
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Confirm Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={() => navigate('/home')}>
          Sign up
        </button>

        <div className="link-text" onClick={() => navigate('/login')}>
          Already have an account
        </div>

        <div className="divider">Or continue with</div>

        {/* Social Buttons */}
        <div className="social-buttons">
          <button className="social-btn">
            <img src="/snaplet-pjatk-project/figma/images/vector-42.svg" alt="Facebook" />
          </button>
          <button className="social-btn">
            <img src="/snaplet-pjatk-project/figma/images/vector-44.svg" alt="Google" />
          </button>
          <button className="social-btn">
            <img src="/snaplet-pjatk-project/figma/images/vector-46.svg" alt="Apple" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
