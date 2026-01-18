import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const HomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="frame-3-48">
      <div className="rectangle-10-49"></div>
      <div className="text-link"></div>
      <div className="mode-light"></div>
      <img src="/snaplet-pjatk-project/figma/images/ellipse-6-52.svg" className="ellipse-6-52" alt="ellipse-6" />
      <div className="text-link"></div>

      {/* Photo Grid */}
      <img src="/snaplet-pjatk-project/figma/images/rectangle-61-67.png" className="rectangle-61-67" alt="rectangle-61" />
      <img src="/snaplet-pjatk-project/figma/images/rectangle-62-68.png" className="rectangle-62-68" alt="rectangle-62" />
      <img src="/snaplet-pjatk-project/figma/images/rectangle-63-69.png" className="rectangle-63-69" alt="rectangle-63" />
      <img src="/snaplet-pjatk-project/figma/images/rectangle-64-70.png" className="rectangle-64-70" alt="rectangle-64" />
      <img src="/snaplet-pjatk-project/figma/images/rectangle-65-71.png" className="rectangle-65-71" alt="rectangle-65" />
      <img src="/snaplet-pjatk-project/figma/images/rectangle-66-72.png" className="rectangle-66-72" alt="rectangle-66" />
      <img src="/snaplet-pjatk-project/figma/images/rectangle-67-73.png" className="rectangle-67-73" alt="rectangle-67" />

      {/* Empty rectangles */}
      <div className="rectangle-68-74"></div>
      <div className="rectangle-69-75"></div>
      <div className="rectangle-70-76"></div>
      <div className="rectangle-71-77"></div>
      <div className="rectangle-72-78"></div>
      <div className="rectangle-73-79"></div>
      <div className="rectangle-74-80"></div>
      <div className="rectangle-75-81"></div>
      <div className="rectangle-76-82"></div>
      <div className="rectangle-77-83"></div>
      <div className="rectangle-78-84"></div>
      <div className="rectangle-79-85"></div>
      <div className="rectangle-80-86"></div>
      <div className="rectangle-81-87"></div>
      <div className="rectangle-82-88"></div>
      <div className="rectangle-83-89"></div>

      {/* Add button */}
      <div className="edit-add-plus" onClick={() => navigate('/camera')} style={{cursor: 'pointer'}}>
        <img src="/snaplet-pjatk-project/figma/images/vector-91.svg" className="vector-91" alt="vector" />
      </div>

      {/* Timers */}
      <div className="rectangle-84-92"></div>
      <div className="rectangle-85-93"></div>
      <img src="/snaplet-pjatk-project/figma/images/ellipse-8-94.svg" className="ellipse-8-94" alt="ellipse-8" />
      <p className="text-95"><span className="text-rgb-253-245-221">36:32:12</span></p>
      <div className="rectangle-86-96"></div>
      <p className="text-97"><span className="text-rgb-253-245-221">60:32:12</span></p>
      <p className="text-98"><span className="text-rgb-253-245-221">12:32:12</span></p>
      <img src="/snaplet-pjatk-project/figma/images/vector-99.svg" className="vector-99" alt="vector" />
      <img src="/snaplet-pjatk-project/figma/images/ellipse-7-100.svg" className="ellipse-7-100" alt="ellipse-7" />
      <img src="/snaplet-pjatk-project/figma/images/ellipse-9-101.svg" className="ellipse-9-101" alt="ellipse-9" />

      <BottomNav active="home" />
    </div>
  );
};

export default HomeScreen;
