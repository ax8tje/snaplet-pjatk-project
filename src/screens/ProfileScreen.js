import React from 'react';
import BottomNav from '../components/BottomNav';

const ProfileScreen = () => {
  return (
    <div className="frame-8-245">
      <div className="text-link"></div>
      <div className="rectangle-87-247"></div>
      <div className="rectangle-87-261"></div>

      {/* Profile Header */}
      <img src="/snaplet-pjatk-project/figma/images/vector-262.svg" className="vector-262" alt="vector" />
      <div className="node-263">
        <img src="/snaplet-pjatk-project/figma/images/vector-264.svg" className="vector-264" alt="vector" />
      </div>
      <img src="/snaplet-pjatk-project/figma/images/rectangle-57-265.png" className="rectangle-57-265" alt="rectangle-57" />
      <p className="text-266"><span className="text-black">Krzysztof</span></p>
      <div className="text-link"></div>

      {/* Photo Grid */}
      <img src="/snaplet-pjatk-project/figma/images/rectangle-61-268.png" className="rectangle-61-268" alt="rectangle-61" />
      <img src="/snaplet-pjatk-project/figma/images/rectangle-62-269.png" className="rectangle-62-269" alt="rectangle-62" />
      <img src="/snaplet-pjatk-project/figma/images/rectangle-63-270.png" className="rectangle-63-270" alt="rectangle-63" />
      <img src="/snaplet-pjatk-project/figma/images/rectangle-64-271.png" className="rectangle-64-271" alt="rectangle-64" />
      <img src="/snaplet-pjatk-project/figma/images/rectangle-65-272.png" className="rectangle-65-272" alt="rectangle-65" />
      <img src="/snaplet-pjatk-project/figma/images/rectangle-66-273.png" className="rectangle-66-273" alt="rectangle-66" />

      {/* Timers */}
      <p className="text-274"><span className="text-rgb-253-245-221">36:32:12</span></p>
      <p className="text-275"><span className="text-rgb-253-245-221">60:32:12</span></p>
      <p className="text-276"><span className="text-rgb-253-245-221">12:32:12</span></p>

      {/* Stats */}
      <p className="text-277"><span className="text-black">Snaplets: 6</span></p>
      <p className="text-278"><span className="text-black">Friends: 3</span></p>
      <p className="text-279"><span className="text-black">Likes: 625</span></p>

      {/* Timeline */}
      <p className="text-280"><span className="text-black">January 2026</span></p>
      <img src="/snaplet-pjatk-project/figma/images/line-9-281.svg" className="line-9-281" alt="line-9" />
      <p className="text-282"><span className="text-black">December 2025</span></p>
      <img src="/snaplet-pjatk-project/figma/images/line-10-283.svg" className="line-10-283" alt="line-10" />
      <img src="/snaplet-pjatk-project/figma/images/rectangle-88-284.png" className="rectangle-88-284" alt="rectangle-88" />
      <img src="/snaplet-pjatk-project/figma/images/rectangle-89-285.png" className="rectangle-89-285" alt="rectangle-89" />
      <p className="text-286"><span className="text-black">November 2025</span></p>
      <img src="/snaplet-pjatk-project/figma/images/line-11-287.svg" className="line-11-287" alt="line-11" />

      <BottomNav active="profile" />
    </div>
  );
};

export default ProfileScreen;
