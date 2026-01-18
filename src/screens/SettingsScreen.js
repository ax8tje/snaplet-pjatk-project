import React from 'react';
import BottomNav from '../components/BottomNav';

const SettingsScreen = () => {
  return (
    <div className="frame-4-102">
      <div className="text-link"></div>
      <img src="/snaplet-pjatk-project/figma/images/ellipse-6-104.svg" className="ellipse-6-104" alt="ellipse-6" />
      <img src="/snaplet-pjatk-project/figma/images/line-2-105.svg" className="line-2-105" alt="line-2" />
      <img src="/snaplet-pjatk-project/figma/images/line-1-106.svg" className="line-1-106" alt="line-1" />
      <div className="rectangle-87-107"></div>
      <p className="text-108"><span className="text-black">Settings</span></p>
      <div className="rectangle-88-109"></div>
      <img src="/snaplet-pjatk-project/figma/images/vector-110.svg" className="vector-110" alt="vector" />
      <p className="text-111"><span className="text-rgb-128-128-128">search for settings</span></p>

      {/* Settings List */}
      <img src="/snaplet-pjatk-project/figma/images/arrow-1-112.svg" className="arrow-1-112" alt="arrow-1" />
      <img src="/snaplet-pjatk-project/figma/images/vector-113.svg" className="vector-113" alt="vector" />
      <p className="text-114"><span className="text-black">Account</span></p>
      <img src="/snaplet-pjatk-project/figma/images/arrow-2-115.svg" className="arrow-2-115" alt="arrow-2" />
      <img src="/snaplet-pjatk-project/figma/images/line-3-116.svg" className="line-3-116" alt="line-3" />

      <div className="media-headphones-117">
        <img src="/snaplet-pjatk-project/figma/images/vector-118.svg" className="vector-118" alt="vector" />
      </div>
      <p className="text-119"><span className="text-black">Help and Support</span></p>
      <img src="/snaplet-pjatk-project/figma/images/arrow-6-120.svg" className="arrow-6-120" alt="arrow-6" />
      <img src="/snaplet-pjatk-project/figma/images/line-7-121.svg" className="line-7-121" alt="line-7" />

      <div className="environment-bulb-122">
        <img src="/snaplet-pjatk-project/figma/images/vector-123.svg" className="vector-123" alt="vector" />
      </div>
      <p className="text-124"><span className="text-black">About</span></p>
      <img src="/snaplet-pjatk-project/figma/images/arrow-7-125.svg" className="arrow-7-125" alt="arrow-7" />
      <img src="/snaplet-pjatk-project/figma/images/line-8-126.svg" className="line-8-126" alt="line-8" />

      <div className="communication-bell-127">
        <img src="/snaplet-pjatk-project/figma/images/vector-128.svg" className="vector-128" alt="vector" />
      </div>
      <p className="text-129"><span className="text-black">Notifications</span></p>
      <img src="/snaplet-pjatk-project/figma/images/arrow-3-130.svg" className="arrow-3-130" alt="arrow-3" />
      <img src="/snaplet-pjatk-project/figma/images/line-4-131.svg" className="line-4-131" alt="line-4" />

      <p className="text-132"><span className="text-black">Appearance</span></p>
      <img src="/snaplet-pjatk-project/figma/images/arrow-4-133.svg" className="arrow-4-133" alt="arrow-4" />
      <img src="/snaplet-pjatk-project/figma/images/line-5-134.svg" className="line-5-134" alt="line-5" />

      <div className="interface-lock_open-135">
        <img src="/snaplet-pjatk-project/figma/images/vector-136.svg" className="vector-136" alt="vector" />
      </div>
      <p className="text-137"><span className="text-black">Privacy &amp; Security</span></p>
      <img src="/snaplet-pjatk-project/figma/images/arrow-5-138.svg" className="arrow-5-138" alt="arrow-5" />
      <img src="/snaplet-pjatk-project/figma/images/line-6-139.svg" className="line-6-139" alt="line-6" />

      <div className="edit-show-140">
        <img src="/snaplet-pjatk-project/figma/images/vector-141.svg" className="vector-141" alt="vector" />
      </div>
      <div className="rectangle-87-142"></div>

      <BottomNav active="settings" />
    </div>
  );
};

export default SettingsScreen;
