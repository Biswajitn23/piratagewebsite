import { Suspense } from "react";
import GetInvolvedSection from "@/components/pirtatage/GetInvolvedSection";

const GetInvolved = () => {
  return (
    <div className="relative pt-24 md:pt-32">
      <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
        <GetInvolvedSection />
      </Suspense>
    </div>
  );
};

export default GetInvolved;
