import React from 'react';
import BottomNav from '../components/BottomNav';

const MessagesScreen = () => {
  return (
    <div className="frame-5-156">
      <div className="text-link"></div>
      <div className="rectangle-89-158"></div>
      <div className="rectangle-88-159"></div>
      <img src="/snaplet-pjatk-project/figma/images/vector-160.svg" className="vector-160" alt="vector" />
      <p className="text-161"><span className="text-rgb-128-128-128">search for message</span></p>

      {/* Chat List */}
      <img src="/snaplet-pjatk-project/figma/images/rectangle-59-162.png" className="rectangle-59-162" alt="rectangle-59" />
      <p className="text-163"><span className="text-black">Dude from stock</span></p>
      <p className="text-164"><span className="text-rgb-128-128-128">My new Snaplet is the best Snaplet!</span></p>

      <img src="/snaplet-pjatk-project/figma/images/rectangle-58-165.png" className="rectangle-58-165" alt="rectangle-58" />
      <p className="text-166"><span className="text-black">Frank</span></p>
      <p className="text-167"><span className="text-rgb-128-128-128">I'm at school, just showed some kids my Snaplet!</span></p>

      <img src="/snaplet-pjatk-project/figma/images/rectangle-57-168.png" className="rectangle-57-168" alt="rectangle-57" />
      <p className="text-169"><span className="text-black">Krzysztof</span></p>
      <p className="text-170"><span className="text-rgb-128-128-128">Check out my new Snaplet!</span></p>

      <p className="text-171"><span className="text-black">Messages</span></p>
      <img src="/snaplet-pjatk-project/figma/images/line-9-172.svg" className="line-9-172" alt="line-9" />
      <img src="/snaplet-pjatk-project/figma/images/line-10-173.svg" className="line-10-173" alt="line-10" />
      <img src="/snaplet-pjatk-project/figma/images/arrow-8-174.svg" className="arrow-8-174" alt="arrow-8" />
      <img src="/snaplet-pjatk-project/figma/images/arrow-10-175.svg" className="arrow-10-175" alt="arrow-10" />
      <img src="/snaplet-pjatk-project/figma/images/arrow-9-176.svg" className="arrow-9-176" alt="arrow-9" />

      {/* Tabs */}
      <div className="rectangle-90-177"></div>
      <div className="rectangle-91-178"></div>
      <p className="text-179"><span className="text-black">Contacts</span></p>
      <p className="text-180"><span className="text-rgb-253-245-221">All chats</span></p>
      <p className="text-181"><span className="text-black">Groups</span></p>

      <div className="rectangle-87-182"></div>
      <img src="/snaplet-pjatk-project/figma/images/vector-196.svg" className="vector-196" alt="vector" />

      <BottomNav active="messages" />
    </div>
  );
};

export default MessagesScreen;
