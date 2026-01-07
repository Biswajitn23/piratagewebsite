import { Suspense, lazy } from "react";

const GallerySection = lazy(() => import("@/components/pirtatage/GallerySection"));

const Gallery = () => {
  return (
    <div className="relative pt-24 md:pt-32">
      <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
        <GallerySection />
      </Suspense>
    </div>
  );
};

export default Gallery;
