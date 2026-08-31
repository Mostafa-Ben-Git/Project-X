import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ImageLightbox from "@/components/ImageLightbox";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ImagesCarousel({ images }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Don't render if no images or empty array
  if (!images || images.length === 0) return null;

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const navigateLightbox = (dir) => {
    setLightboxIndex((prev) => {
      if (prev === null) return prev;
      if (dir === "next") return (prev + 1) % images.length;
      return (prev - 1 + images.length) % images.length;
    });
  };

  // Single image: full width, responsive capped height
  if (images.length === 1) {
    return (
      <>
        <div className="my-2 overflow-hidden rounded-xl border border-border">
          <Image
            src={images[0]}
            onOpen={() => openLightbox(0)}
            className="max-h-[280px] w-full object-cover sm:max-h-[420px] md:max-h-[512px]"
          />
        </div>
        {lightboxIndex !== null && (
          <ImageLightbox
            src={images[lightboxIndex]}
            images={images}
            index={lightboxIndex}
            onClose={closeLightbox}
            onNavigate={navigateLightbox}
          />
        )}
      </>
    );
  }

  // 5+ images: keep swipeable carousel
  if (images.length >= 5) {
    return (
      <>
        <div className="my-2">
          <Carousel className="w-full">
            <CarouselContent className="ml-0 pl-0">
              {images.map((image, index) => (
                <CarouselItem key={index} className="pl-0">
                  <div className="flex w-full justify-center overflow-hidden">
                    <Image
                      src={image}
                      onOpen={() => openLightbox(index)}
                      className="max-h-[260px] w-auto max-w-full object-contain sm:max-h-[360px] md:max-h-[400px]"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 scale-100 sm:scale-125" />
            <CarouselNext className="right-2 scale-100 sm:scale-125" />
          </Carousel>
        </div>
        {lightboxIndex !== null && (
          <ImageLightbox
            src={images[lightboxIndex]}
            images={images}
            index={lightboxIndex}
            onClose={closeLightbox}
            onNavigate={navigateLightbox}
          />
        )}
      </>
    );
  }

  // Two images: equal split, responsive heights
  if (images.length === 2) {
    return (
      <>
        <div className="my-2 grid grid-cols-2 gap-0.5 overflow-hidden rounded-xl sm:gap-1">
          {images.map((image, index) => (
            <Image
              key={index}
              src={image}
              onOpen={() => openLightbox(index)}
              className="h-[180px] w-full object-cover sm:h-[240px] md:h-[300px]"
            />
          ))}
        </div>
        {lightboxIndex !== null && (
          <ImageLightbox
            src={images[lightboxIndex]}
            images={images}
            index={lightboxIndex}
            onClose={closeLightbox}
            onNavigate={navigateLightbox}
          />
        )}
      </>
    );
  }

  // Three images: tall left, two stacked right, responsive
  if (images.length === 3) {
    return (
      <>
        <div className="my-2 grid h-[220px] grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl sm:h-[300px] sm:gap-1 md:h-[360px]">
          <Image
            src={images[0]}
            onOpen={() => openLightbox(0)}
            className="col-start-1 row-span-2 h-full w-full object-cover"
          />
          <Image
            src={images[1]}
            onOpen={() => openLightbox(1)}
            className="col-start-2 row-start-1 h-full w-full object-cover"
          />
          <Image
            src={images[2]}
            onOpen={() => openLightbox(2)}
            className="col-start-2 row-start-2 h-full w-full object-cover"
          />
        </div>
        {lightboxIndex !== null && (
          <ImageLightbox
            src={images[lightboxIndex]}
            images={images}
            index={lightboxIndex}
            onClose={closeLightbox}
            onNavigate={navigateLightbox}
          />
        )}
      </>
    );
  }

  // Four images: 2x2 grid, responsive
  return (
    <>
      <div className="my-2 grid grid-cols-2 gap-0.5 overflow-hidden rounded-xl sm:gap-1">
        {images.map((image, index) => (
          <Image
            key={index}
            src={image}
            onOpen={() => openLightbox(index)}
            className="h-[140px] w-full object-cover sm:h-[180px] md:h-[200px]"
          />
        ))}
      </div>
      {lightboxIndex !== null && (
        <ImageLightbox
          src={images[lightboxIndex]}
          images={images}
          index={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}
    </>
  );
}

function Image({ src, className = "", onOpen }) {
  const [error, setError] = useState(false);
  if (error || !src) return null;

  const interactive = typeof onOpen === "function";
  const handleKeyDown = (e) => {
    if (interactive && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <img
      src={src}
      alt=""
      onClick={interactive ? onOpen : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      className={cn(interactive && "cursor-zoom-in", className)}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}
