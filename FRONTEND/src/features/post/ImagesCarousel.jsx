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

  // Single image: full width, capped height
  if (images.length === 1) {
    return (
      <>
        <div className="my-2 overflow-hidden rounded-xl border border-border">
          <Image
            src={images[0]}
            onOpen={() => openLightbox(0)}
            className="max-h-[512px] w-full object-cover"
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
                      className="max-h-[400px] w-auto object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 scale-125" />
            <CarouselNext className="right-2 scale-125" />
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

  // Two images: equal split
  if (images.length === 2) {
    return (
      <>
        <div className="my-2 grid grid-cols-2 gap-0.5 overflow-hidden rounded-xl">
          {images.map((image, index) => (
            <Image
              key={index}
              src={image}
              onOpen={() => openLightbox(index)}
              className="h-[300px] w-full object-cover"
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

  // Three images: tall left, two stacked right
  if (images.length === 3) {
    return (
      <>
        <div className="my-2 grid h-[300px] grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl">
          <Image
            src={images[0]}
            onOpen={() => openLightbox(0)}
            className="col-start-1 row-span-2 h-full w-full object-cover"
          />
          <Image
            src={images[1]}
            onOpen={() => openLightbox(1)}
            className="col-start-2 row-start-1 h-[150px] w-full object-cover"
          />
          <Image
            src={images[2]}
            onOpen={() => openLightbox(2)}
            className="col-start-2 row-start-2 h-[150px] w-full object-cover"
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

  // Four images: 2x2 grid
  return (
    <>
      <div className="my-2 grid grid-cols-2 gap-0.5 overflow-hidden rounded-xl">
        {images.map((image, index) => (
          <Image
            key={index}
            src={image}
            onOpen={() => openLightbox(index)}
            className="h-[200px] w-full object-cover"
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
