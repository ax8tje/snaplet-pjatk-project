import React from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="frame-2-24">
      <div className="hello-25">
        <div className="rectangle-9-26"></div>
        <img src="/snaplet-pjatk-project/figma/images/rectangle-27.png" className="rectangle-27" alt="rectangle" />
      </div>
      <div className="rounded-rectangle-28"></div>
      <div className="rectangle-89-29"></div>
      <p className="text-30"><span className="text-rgb-128-128-128">Email</span></p>
      <p className="text-31"><span className="text-rgb-128-128-128">Password</span></p>
      <div className="rectangle-95-32"></div>
      <p className="text-33"><span className="text-rgb-128-128-128">Confirm Password</span></p>
      <div className="rectangle-90-34" onClick={() => navigate('/home')} style={{cursor: 'pointer'}}></div>
      <p className="text-35" onClick={() => navigate('/home')} style={{cursor: 'pointer'}}><span className="text-rgb-253-245-221">Sign up</span></p>
      <p className="text-36" onClick={() => navigate('/login')} style={{cursor: 'pointer'}}><span className="text-rgb-58-43-32">Already have an account</span></p>
      <p className="text-37"><span className="text-rgb-58-43-32">Or continue with</span></p>
      <div className="rectangle-92-38"></div>
      <div className="rectangle-94-39"></div>
      <div className="rectangle-93-40"></div>
      <div className="platform-facebook-color-negative">
        <img src="/snaplet-pjatk-project/figma/images/vector-42.svg" className="vector-42" alt="facebook" />
      </div>
      <div className="platform-google-color-negative">
        <img src="/snaplet-pjatk-project/figma/images/vector-44.svg" className="vector-44" alt="google" />
      </div>
      <div className="platform-apple-color-negative">
        <img src="/snaplet-pjatk-project/figma/images/vector-46.svg" className="vector-46" alt="apple" />
      </div>
      <p className="text-47"><span className="text-black">Create account</span></p>
    </div>
  );
};

export default RegisterScreen;
