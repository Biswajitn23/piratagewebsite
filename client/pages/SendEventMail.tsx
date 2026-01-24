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
