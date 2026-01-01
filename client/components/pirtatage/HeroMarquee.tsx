import { useEffect, useRef, useState } from "react";

const HeroMarquee = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [displayMessage, setDisplayMessage] = useState("WELCOME TO PIRATAGE WEBSITE");

  useEffect(() => {
    const initMarquee = async () => {
      const API_KEY = 'AIzaSyCBiCRx4fIAe2kT2bwiIziO5rbN6E4-6FI';
      const CAL_ID = 'en.indian#holiday@group.v.calendar.google.com';

      try {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
        
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CAL_ID)}/events?key=${API_KEY}&timeMin=${start}&timeMax=${end}&singleEvents=true`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          setDisplayMessage(`HAPPY ${data.items[0].summary}`);
        }
      } catch (e) {
        // Fallback for New Year or any error
        setDisplayMessage("HAPPY NEW YEAR 2026");
      }
    };

    initMarquee();
  }, []);

  return (
    <div className="w-full bg-transparent overflow-hidden user-select-none py-[15px] border-b border-white/10 flex">
      <div 
        ref={wrapperRef}
        className="flex whitespace-nowrap animate-scroll"
        style={{
          animation: "loop-scroll 25s linear infinite",
        }}
      >
        {[...Array(16)].map((_, i) => (
          <div key={i} className="flex items-center font-black text-lg uppercase tracking-wide text-white">
            <span>
              HAPPY <span className="text-[#00ff88] font-black">{displayMessage.replace("HAPPY ", "")}</span>
            </span>
            <div className="w-2 h-2 rounded-full bg-[#00ff88] mx-[50px] shadow-[0_0_10px_#00ff88]"></div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes loop-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        
        .user-select-none {
          user-select: none;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default HeroMarquee;
