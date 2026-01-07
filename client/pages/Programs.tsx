import { Suspense, lazy } from "react";

const ProgramsSection = lazy(() => import("@/components/pirtatage/ProgramsSection"));

const Programs = () => {
  return (
    <div className="relative pt-24 md:pt-32">
      <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
        <ProgramsSection />
      </Suspense>
    </div>
  );
};

export default Programs;
