import { Suspense, lazy } from "react";

const MembersSection = lazy(() => import("@/components/pirtatage/MembersSection"));

const Team = () => {
  return (
    <div className="relative pt-24 md:pt-32">
      <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
        <MembersSection />
      </Suspense>
    </div>
  );
};

export default Team;
