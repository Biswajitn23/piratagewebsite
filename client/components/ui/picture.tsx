import { ImgHTMLAttributes } from "react";

interface PictureProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  avif?: string;
  webp?: string;
  className?: string;
}

/**
 * Picture component with modern image format support (AVIF, WebP) and fallback.
 * Browsers will automatically select the best supported format.
 */
export function Picture({ src, alt, avif, webp, className, ...props }: PictureProps) {
  // If no modern formats provided, use standard img
  if (!avif && !webp) {
    return <img src={src} alt={alt} className={className} {...props} />;
  }

  return (
    <picture>
      {avif && <source srcSet={avif} type="image/avif" />}
      {webp && <source srcSet={webp} type="image/webp" />}
      <img src={src} alt={alt} className={className} {...props} />
    </picture>
  );
}
