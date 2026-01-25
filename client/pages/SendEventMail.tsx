import React, { useEffect, useState } from "react";

export default function SendEventMail() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    // Fetch events from your backend API
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data.events || []));
  }, []);

  const handleSend = async () => {
    if (!events[selected]) return;
    setLoading(true);
    setResult("");
    const res = await fetch("/api/send-event-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: events[selected].id }),
    });
    const data = await res.json();
    setResult(data.message || "Done");
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, background: "#181824", borderRadius: 16, color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <h2 style={{ marginBottom: 20 }}>Send Event Email</h2>
      <label htmlFor="event-select">Choose Event:</label>
      <select
        id="event-select"
        value={selected}
        onChange={e => setSelected(Number(e.target.value))}
        style={{ width: "100%", padding: 8, margin: "12px 0 20px", borderRadius: 8 }}
      >
        {events.map((e, i) => (
          <option value={i} key={e.id}>{e.title} ({e.date})</option>
        ))}
      </select>

      {/* Show event details if available */}
      {events[selected] && (
        <div style={{
          background: "#23233a",
          borderRadius: 10,
          padding: 16,
          marginBottom: 18,
          border: "1px solid #2d2d3d"
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ width: 96, height: 64, flex: '0 0 96px', borderRadius: 8, overflow: 'hidden', background: '#0f0f14', border: '1px solid #2d2d3d' }}>
              <img
                src={events[selected].coverImage || events[selected].cover_url || events[selected].cover || '/piratagelogo.webp'}
                alt={events[selected].title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{events[selected].title}</div>
                <div style={{ fontSize: 12, fontWeight: 700, padding: '6px 8px', borderRadius: 999, background: '#0b1020', color: '#a855f7', border: '1px solid #2d2d3d' }}>{(events[selected].type || 'event').replace(/[-_]/g, ' ').toUpperCase()}</div>
              </div>
              <div style={{ color: '#a3a3b3', fontSize: 13, marginTop: 6 }}>Date: <span style={{ color: '#a855f7' }}>{(() => {
                const d = events[selected].date;
                if (!d) return '';
                try { return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return d; }
              })()}</span></div>
              <div style={{ color: '#a3a3b3', fontSize: 13 }}>Time: <span style={{ color: '#a855f7' }}>{(() => {
                const t = events[selected].time;
                if (t) return t;
                const d = events[selected].date;
                if (!d) return '';
                try {
                  const dateObj = new Date(d);
                  if (!isNaN(dateObj.getTime())) {
                    const utc = dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000);
                    const istOffset = 5.5 * 60 * 60000;
                    const istDate = new Date(utc + istOffset);
                    return istDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
                  } else { return d.substring(11,16); }
                } catch { return d.substring(11,16); }
              })()}</span></div>
            </div>
          </div>
          {events[selected].location && (
            <div style={{ color: '#a3a3b3', fontSize: 14 }}>Location: <span style={{ color: '#a855f7' }}>{events[selected].location}</span></div>
          )}
          {events[selected].description && (
            <div style={{ color: '#cbd5e1', fontSize: 14, marginTop: 8 }}>{events[selected].description}</div>
          )}
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={loading || !events.length}
        style={{ width: "100%", padding: 12, background: "#a855f7", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 16 }}
      >
        {loading ? "Sending..." : "Send to All Subscribers"}
      </button>
      {result && <div style={{ marginTop: 20, color: "#a3e635" }}>{result}</div>}
    </div>
  );
}
