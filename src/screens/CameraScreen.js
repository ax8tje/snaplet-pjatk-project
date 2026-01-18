import React from 'react';
import { useNavigate } from 'react-router-dom';

const CameraScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="frame-7-197">
      <div className="text-link"></div>
      <img src="/snaplet-pjatk-project/figma/images/ellipse-6-199.svg" className="ellipse-6-199" alt="ellipse-6" />
      <img src="/snaplet-pjatk-project/figma/images/line-2-200.svg" className="line-2-200" alt="line-2" />
      <img src="/snaplet-pjatk-project/figma/images/line-1-201.svg" className="line-1-201" alt="line-1" />
      <img src="/snaplet-pjatk-project/figma/images/rectangle-42-202.png" className="rectangle-42-202" alt="rectangle-42" />
      <div className="node-203" onClick={() => navigate('/home')} style={{cursor: 'pointer'}}>
        <img src="/snaplet-pjatk-project/figma/images/vector-204.svg" className="vector-204" alt="vector" />
      </div>
      <img src="/snaplet-pjatk-project/figma/images/rectangle-60-205.png" className="rectangle-60-205" alt="rectangle-60" />
      <img src="/snaplet-pjatk-project/figma/images/ellipse-2-206.svg" className="ellipse-2-206" alt="ellipse-2" />
      <img src="/snaplet-pjatk-project/figma/images/ellipse-3-207.svg" className="ellipse-3-207" alt="ellipse-3" />
    </div>
  );
};

export default CameraScreen;
