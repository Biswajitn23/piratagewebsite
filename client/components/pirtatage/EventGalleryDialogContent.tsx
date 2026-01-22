
import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { EventRecord } from "@/data/pirtatage";

interface Props {
  event: EventRecord;
}

const AUTO_ADVANCE_INTERVAL = 3500;

const EventGalleryDialogContent: React.FC<Props> = ({ event }) => {
  const images = [
    ...(event.coverImage ? [event.coverImage] : []),
    ...(event.gallery || [])
  ];
  const [current, setCurrent] = useState(0);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [openSpeakerIdx, setOpenSpeakerIdx] = useState<number | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    timer.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, AUTO_ADVANCE_INTERVAL);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [images.length]);

  if (!event) return null;

  return (
    <div className="flex flex-col gap-4">
      <DialogTitle>{event.title}</DialogTitle>
      <DialogDescription>{event.description}</DialogDescription>
      {images.length > 0 && (
        <>
          <div className="relative w-full h-48 mb-2">
            <img
              src={images[current]}
              alt={event.title + " gallery"}
              className="w-full h-full object-cover rounded-xl transition-all duration-700"
              key={images[current]}
            />
            {images.length > 1 && (
              <div className="absolute bottom-2 right-4 flex gap-1 bg-black/40 rounded-full px-2 py-1">
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`inline-block w-2 h-2 rounded-full ${idx === current ? "bg-white" : "bg-white/30"}`}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Thumbnails below carousel */}
          {images.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {images.map((img, idx) => (
                <img
                  key={img + idx}
                  src={img}
                  alt={event.title + " thumbnail " + (idx + 1)}
                  className={`w-16 h-12 object-cover rounded border cursor-pointer transition-all duration-200 ${idx === current ? 'border-purple-400 ring-2 ring-purple-400' : 'border-white/20 opacity-70 hover:opacity-100'}`}
                  onClick={() => setCurrent(idx)}
                />
              ))}
            </div>
          )}
        </>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <span className="text-xs text-purple-400 font-bold uppercase tracking-[0.2em]">{new Date(event.date).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <div><span className="font-bold text-white/80">Type:</span> {event.type}</div>
        <div><span className="font-bold text-white/80">Location:</span> {event.location}</div>
        <div><span className="font-bold text-white/80">Venue:</span> {event.venue}</div>
      </div>
      {event.speakers && event.speakers.length > 0 && (
        <div>
          <div className="font-bold text-white/80 mb-1">Speakers:</div>
          <div className="flex flex-wrap gap-3">
            {event.speakers.map((sp, idx) => (
              <div key={sp.name + idx} className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1">
                {sp.avatar && (
                  <img
                    src={sp.avatar}
                    alt={sp.name}
                    className="w-8 h-8 rounded-full object-cover cursor-pointer"
                    onClick={() => setOpenSpeakerIdx(idx)}
                  />
                )}
                <div>
                  <div className="font-semibold text-white/90 text-sm">{sp.name}</div>
                  <div className="text-xs text-white/60">{sp.role}</div>
                </div>
                {/* Speaker Image Modal */}
                <Dialog open={openSpeakerIdx === idx} onOpenChange={() => setOpenSpeakerIdx(null)}>
                  <DialogContent className="max-w-md bg-[#0a001a] border-white/10 text-white flex flex-col items-center">
                    <img
                      src={sp.avatar}
                      alt={sp.name + ' full'}
                      className="w-full max-w-xs h-auto rounded-xl mb-2"
                      style={{objectFit:'contain'}}
                    />
                    <div className="font-semibold text-lg mb-1">{sp.name}</div>
                    <div className="text-sm text-white/70 mb-2">{sp.role}</div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </div>
      )}
      {event.registrationLink && (
        <Button asChild variant="default" className="w-full mt-4">
          <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
            Register Now
          </a>
        </Button>
      )}
    </div>
  );
};

export default EventGalleryDialogContent;