

import React from "react";
import { Link, useNavigate } from "react-router-dom";

const sponsorTiers = [
  {
    name: "Bronze – Community Partner",
    color: "border-amber-400 bg-white/5",
    benefits: [
      "Logo on website",
      "Shoutout on social media"
    ]
  },
  {
    name: "Silver – Event Supporter",
    color: "border-cyan-400 bg-white/5",
    benefits: [
      "Everything in Bronze",
      "Logo on event flyers",
      "1 newsletter feature"
    ]
  },
  {
    name: "Gold – Title Sponsor",
    color: "border-yellow-400 bg-white/5",
    benefits: [
      "Everything in Silver",
      "Speaking slot at events",
      "Booth space at events",
      "'Presented by [Brand Name]' status"
    ]
  }
];

export default function Sponsors() {
  const navigate = useNavigate();
  return (
    <main className="relative min-h-screen overflow-x-hidden pt-8 bg-gradient-to-br from-[#1a1026] via-[#232946] to-[#0e001a]">
      {/* Glassmorphism blurred background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#181c2a]/80 via-[#232946]/70 to-[#0e7490]/60 backdrop-blur-2xl" aria-hidden="true" />
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-primary border border-primary/20 shadow hover:bg-primary/10 transition"
        style={{ backdropFilter: 'blur(8px)' }}
        aria-label="Back to Home"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        Back
      </button>
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[40vh] py-16 px-4 text-center">
        <img src="/piratagelogo.webp" alt="Piratage Club Logo" className="h-20 w-20 rounded-2xl border-4 border-primary/40 bg-white/10 shadow-lg mb-4" />
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white mb-3">Partner with Piratage</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Support innovation, empower students, and grow your brand with Piratage Club AUC. Join us in shaping the next generation of tech leaders.
        </p>
      </section>

      {/* Tiers Section */}
      <section className="relative z-10 max-w-6xl mx-auto py-12 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-primary mb-8">Sponsorship Tiers</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Bronze Card */}
          <div className="tier-card-bronze p-8 flex flex-col items-center rounded-2xl border-4 shadow-2xl transform hover:-translate-y-2 transition duration-300">
            <h3 className="text-2xl font-extrabold mb-3 text-[#4b2e13] text-center" style={{textShadow:'0 1px 6px #fff8,0 1px 1px #b87333'}}>Bronze</h3>
            <div className="text-sm font-semibold mb-2 text-[#4b2e13]" style={{textShadow:'0 1px 6px #fff8,0 1px 1px #b87333'}}>Community Partner</div>
            <ul className="list-disc pl-5 text-base text-[#2d1a0b] space-y-1 mb-4 text-left w-full" style={{textShadow:'0 1px 6px #fff8'}}>
              <li>Logo on website</li>
              <li>Shoutout on social media</li>
            </ul>
          </div>
          {/* Silver Card */}
          <div className="tier-card-silver p-8 flex flex-col items-center rounded-2xl border-4 shadow-2xl transform hover:-translate-y-2 transition duration-300">
            <h3 className="text-2xl font-extrabold mb-3 text-[#222] text-center" style={{textShadow:'0 1px 6px #fff8,0 1px 1px #b0b0b0'}}>Silver</h3>
            <div className="text-sm font-semibold mb-2 text-[#222]" style={{textShadow:'0 1px 6px #fff8,0 1px 1px #b0b0b0'}}>Event Supporter</div>
            <ul className="list-disc pl-5 text-base text-[#333] space-y-1 mb-4 text-left w-full" style={{textShadow:'0 1px 6px #fff8'}}>
              <li>Everything in Bronze</li>
              <li>Logo on event flyers</li>
              <li>1 newsletter feature</li>
            </ul>
          </div>
          {/* Gold Card */}
          <div className="tier-card-gold p-8 flex flex-col items-center rounded-2xl border-4 shadow-2xl transform hover:-translate-y-2 transition duration-300">
            <h3 className="text-2xl font-extrabold mb-3 text-[#7a6600] text-center" style={{textShadow:'0 1px 6px #fff8,0 1px 1px #ffd700'}}>Gold</h3>
            <div className="text-sm font-semibold mb-2 text-[#7a6600]" style={{textShadow:'0 1px 6px #fff8,0 1px 1px #ffd700'}}>Title Sponsor</div>
            <ul className="list-disc pl-5 text-base text-[#4d4300] space-y-1 mb-4 text-left w-full" style={{textShadow:'0 1px 6px #fff8'}}>
              <li>Everything in Silver</li>
              <li>Speaking slot at events</li>
              <li>Booth space at events</li>
              <li>'Presented by [Brand Name]' status</li>
            </ul>
          </div>
        </div>
        <style>{`
          .tier-card-bronze {
            background: linear-gradient(135deg, #f8e0c2 0%, #b87333 60%, #e5b47e 100%);
            border-color: #b87333;
            box-shadow: 0 8px 32px 0 rgba(184,115,51,0.25), 0 1.5px 0 #fff inset;
          }
          .tier-card-silver {
            background: linear-gradient(135deg, #f0f0f0 0%, #b0b0b0 60%, #e0e0e0 100%);
            border-color: #b0b0b0;
            box-shadow: 0 8px 32px 0 rgba(176,176,176,0.25), 0 1.5px 0 #fff inset;
          }
          .tier-card-gold {
            background: linear-gradient(135deg, #fffbe0 0%, #ffd700 60%, #fff6a0 100%);
            border-color: #ffd700;
            box-shadow: 0 8px 32px 0 rgba(255,215,0,0.25), 0 1.5px 0 #fff inset;
          }
        `}</style>
      </section>

      {/* Why Sponsor Section */}
      <section className="relative z-10 max-w-5xl mx-auto py-8 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-6">Why Sponsor Us?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 rounded-2xl p-6 shadow flex flex-col items-center border border-primary/20">
            <span className="text-3xl mb-2">🎯</span>
            <h3 className="font-semibold mb-1">Target Audience</h3>
            <p className="text-base text-muted-foreground text-center">300+ engineering students, tech enthusiasts, and innovators.</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-6 shadow flex flex-col items-center border border-cyan-400/20">
            <span className="text-3xl mb-2">📣</span>
            <h3 className="font-semibold mb-1">Reach</h3>
            <p className="text-base text-muted-foreground text-center">2,000+ social media followers, 500+ email subscribers, 1,000+ monthly website visitors.</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-6 shadow flex flex-col items-center border border-yellow-400/20">
            <span className="text-3xl mb-2">🤝</span>
            <h3 className="font-semibold mb-1">Brand Alignment</h3>
            <p className="text-base text-muted-foreground text-center">Support youth innovation, STEM education, and community impact.</p>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="relative z-10 max-w-5xl mx-auto py-8 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-6">Past Success & Impact</h2>
        <div className="flex flex-wrap gap-8 mb-6 justify-center">
          <img src="/gallery1.jpg" alt="Event 1" className="w-52 h-36 object-cover rounded-2xl shadow-lg border-2 border-primary/20" />
          <img src="/gallery2.jpg" alt="Event 2" className="w-52 h-36 object-cover rounded-2xl shadow-lg border-2 border-cyan-400/20" />
        </div>
        <div className="text-center text-lg text-muted-foreground mb-2">Last year, we hosted <b>5 events</b> with over <b>1,000 total attendees</b>.</div>
        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground max-w-2xl mx-auto">
          “Partnering with Piratage Club AUC was a fantastic experience. Their events are well-organized and impactful.”<br />
          <span className="text-xs">– Previous Sponsor</span>
        </blockquote>
      </section>

      {/* Ways to Sponsor Section */}
      <section className="relative z-10 max-w-5xl mx-auto py-8 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-6">Ways to Sponsor</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 rounded-2xl p-6 shadow flex flex-col items-center border border-primary/20">
            <span className="text-3xl mb-2">💸</span>
            <h3 className="font-semibold mb-1">Financial Sponsorship</h3>
            <p className="text-base text-muted-foreground text-center">Support for venue, equipment, or marketing.</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-6 shadow flex flex-col items-center border border-cyan-400/20">
            <span className="text-3xl mb-2">🎁</span>
            <h3 className="font-semibold mb-1">In-Kind Donations</h3>
            <p className="text-base text-muted-foreground text-center">Food, printing, or prize giveaways.</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-6 shadow flex flex-col items-center border border-yellow-400/20">
            <span className="text-3xl mb-2">🏆</span>
            <h3 className="font-semibold mb-1">Scholarships/Grants</h3>
            <p className="text-base text-muted-foreground text-center">Fund a student project or award.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative z-10 max-w-5xl mx-auto py-12 px-4 flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-primary mb-6">Become a Sponsor</h2>
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl max-w-full md:max-w-2xl w-full mx-auto border border-primary/20 flex flex-col items-center">
          <div className="w-full overflow-x-auto flex justify-center">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSeWaXZ3faKrMspKoRFaiufFpcqxAega09MZEYw271MzHHFnkA/viewform?embedded=true"
              width="100%"
              height="900"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
              title="Sponsor Details Form"
              className="rounded-lg border-none min-w-[320px] max-w-full"
              style={{ minWidth: '320px', maxWidth: '760px' }}
            >
              Loading…
            </iframe>
          </div>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <span className="text-black">Or contact:</span> <a href="mailto:piratage.auc@gmail.com" className="font-bold text-primary hover:underline break-all">piratage.auc@gmail.com</a>
          </div>
        </div>
        <Link to="/" className="mt-8 underline hover:text-primary text-xs text-muted-foreground/70">Back to Home</Link>
      </section>

      {/* Glass panel style for subtle blur */}
      <style>{`
        .glass-panel {
          backdrop-filter: blur(10px) saturate(1.1);
          background: rgba(30, 41, 59, 0.35);
        }
      `}</style>
    </main>
  );
}
