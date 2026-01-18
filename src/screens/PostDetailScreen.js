import React from 'react';
import BottomNav from '../components/BottomNav';

const PostDetailScreen = () => {
  return (
    <div className="frame-6-208">
      <div className="text-link"></div>
      <div className="rectangle-89-210"></div>
      <div className="rectangle-87-211"></div>

      {/* Post Image/Video */}
      <img src="/snaplet-pjatk-project/figma/images/rectangle-88-225.png" className="rectangle-88-225" alt="rectangle-88" />
      <img src="/snaplet-pjatk-project/figma/images/rectangle-92-226.png" className="rectangle-92-226" alt="rectangle-92" />

      {/* Post Info */}
      <p className="text-227"><span className="text-black">Dude from stock</span></p>
      <p className="text-228"><span className="text-rgb-128-128-128">Description of the video
10-01-2026</span></p>

      {/* Tabs */}
      <div className="rectangle-92-229"></div>
      <div className="rectangle-93-230"></div>
      <p className="text-231"><span className="text-black">Friends</span></p>
      <p className="text-232"><span className="text-rgb-253-245-221">For you</span></p>

      {/* Action Buttons */}
      <div className="communication-chat-233">
        <img src="/snaplet-pjatk-project/figma/images/vector-234.svg" className="vector-234" alt="vector" />
      </div>
      <div className="node-235">
        <img src="/snaplet-pjatk-project/figma/images/vector-236.svg" className="vector-236" alt="vector" />
      </div>
      <div className="interface-heart_01-237"></div>
      <img src="/snaplet-pjatk-project/figma/images/vector-238.svg" className="vector-238" alt="vector" />

      {/* Counters */}
      <p className="text-239"><span className="text-black">1,302</span></p>
      <p className="text-240"><span className="text-black">16</span></p>
      <p className="text-241"><span className="text-black">35</span></p>

      <div className="node-242">
        <img src="/snaplet-pjatk-project/figma/images/vector-243.svg" className="vector-243" alt="vector" />
      </div>
      <img src="/snaplet-pjatk-project/figma/images/vector-244.svg" className="vector-244" alt="vector" />

      <BottomNav active="home" />
    </div>
  );
};

export default PostDetailScreen;
