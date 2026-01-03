'use client';

import React from 'react';

const PiratageMarquee: React.FC = () => {
  const textString = "PIRATAGE : THE ETHICAL HACKING CLUB • ";

  return (
    <div className="marquee-outer-section">
      <style>{`
        .marquee-outer-section {
          position: relative;
          height: 60px; 
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          margin-right: calc(-50vw + 50%);
          background: transparent; 
          display: flex;
          align-items: center;
          overflow: hidden;
          pointer-events: none;
          /* GPU optimization */
          backface-visibility: hidden;
        }

        .line-3d {
          width: 100%;
          display: flex;
          white-space: nowrap;
          font-size: 1.1rem; 
          font-weight: 900;
          padding: 10px 0;
          font-family: ui-sans-serif, system-ui, sans-serif;
          color: #ffffff;
          
          /* Solid 3D Styling */
          background: linear-gradient(
            180deg, 
            rgba(255, 255, 255, 0.15) 0%, 
            rgba(30, 30, 30, 1) 50%, 
            rgba(0, 0, 0, 1) 100%
          );
          border-top: 1px solid rgba(255, 255, 255, 0.3);
          border-bottom: 2px solid rgba(0, 0, 0, 0.9);
          box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.4);
        }

        .marquee-track-inner {
          display: flex;
          width: max-content;
          /* Force GPU rendering to stop lagging */
          will-change: transform;
          animation: scroll-smooth 30s linear infinite;
        }

        /* Faster animation on mobile */
        @media (max-width: 768px) {
          .marquee-track-inner {
            animation: scroll-smooth 6s linear infinite;
          }
        }

        @keyframes scroll-smooth {
          from { 
            transform: translate3d(0, 0, 0); 
          }
          to { 
            /* Moves exactly half the width of the duplicated content */
            transform: translate3d(-50%, 0, 0); 
          }
        }

        .item { 
          display: inline-block;
          padding-right: 30px;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
          /* Prevents sub-pixel jittering */
          -webkit-font-smoothing: antialiased;
        }
      `}</style>

      <div className="line-3d">
        <div className="marquee-track-inner">
          {/* We repeat enough to fill the screen width twice */}
          {[...Array(12)].map((_, i) => (
            <span key={`a-${i}`} className="item">{textString}</span>
          ))}
          {[...Array(12)].map((_, i) => (
            <span key={`b-${i}`} className="item">{textString}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PiratageMarquee;