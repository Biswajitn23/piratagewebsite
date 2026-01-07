import { Suspense } from "react";
import EventsSection from "@/components/pirtatage/EventsSection";

const Events = () => {
  return (
    <div className="relative pt-24 md:pt-32">
      <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
        <EventsSection />
      </Suspense>
    </div>
  );
};

export default Events;
