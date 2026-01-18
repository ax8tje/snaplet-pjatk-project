import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="frame-1-1">
      <div className="hello-2">
        <div className="rectangle-9-3"></div>
        <img src="/snaplet-pjatk-project/figma/images/rectangle-4.png" className="rectangle-4" alt="rectangle" />
      </div>
      <div className="rounded-rectangle-5"></div>
      <div className="rectangle-89-6"></div>
      <p className="text-7"><span className="text-rgb-128-128-128">Email</span></p>
      <p className="text-8"><span className="text-rgb-128-128-128">Password</span></p>
      <p className="text-9"><span className="text-rgb-58-43-32">Forgot your password?</span></p>
      <div className="rectangle-90-10" onClick={() => navigate('/home')} style={{cursor: 'pointer'}}></div>
      <p className="text-11" onClick={() => navigate('/home')} style={{cursor: 'pointer'}}><span className="text-rgb-253-245-221">Sign in</span></p>
      <p className="text-12" onClick={() => navigate('/register')} style={{cursor: 'pointer'}}><span className="text-rgb-58-43-32">Create new account</span></p>
      <p className="text-13"><span className="text-rgb-58-43-32">Or continue with</span></p>
      <div className="rectangle-92-14"></div>
      <div className="rectangle-94-15"></div>
      <div className="rectangle-93-16"></div>
      <div className="platform-facebook-color-negative">
        <img src="/snaplet-pjatk-project/figma/images/vector-18.svg" className="vector-18" alt="facebook" />
      </div>
      <div className="platform-google-color-negative">
        <img src="/snaplet-pjatk-project/figma/images/vector-20.svg" className="vector-20" alt="google" />
      </div>
      <div className="platform-apple-color-negative">
        <img src="/snaplet-pjatk-project/figma/images/vector-22.svg" className="vector-22" alt="apple" />
      </div>
      <p className="text-23"><span className="text-black">Login</span></p>
    </div>
  );
};

export default LoginScreen;
