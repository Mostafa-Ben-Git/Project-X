import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState } from "react";

export function ImagesCarousel({ images }) {
  // Don't render if no images or empty array
  if (!images || images.length === 0) return null;

  // Single image: full width, capped height
  if (images.length === 1) {
    return (
      <div className="my-2 overflow-hidden rounded-xl border border-border">
        <Image
          src={images[0]}
          className="max-h-[512px] w-full object-cover"
        />
      </div>
    );
  }

  // 5+ images: keep swipeable carousel
  if (images.length >= 5) {
    return (
      <Carousel className="w-full">
        <CarouselContent className="ml-0 pl-0">
          {images.map((image, index) => (
            <CarouselItem key={index} className="pl-0">
              <div className="flex w-full justify-center overflow-hidden">
                <Image src={image} className="max-h-[400px] w-auto object-contain" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 scale-125" />
        <CarouselNext className="right-2 scale-125" />
      </Carousel>
    );
  }

  // Two images: equal split
  if (images.length === 2) {
    return (
      <div className="my-2 grid grid-cols-2 gap-0.5 overflow-hidden rounded-xl">
        {images.map((image, index) => (
          <Image
            key={index}
            src={image}
            className="h-[300px] w-full object-cover"
          />
        ))}
      </div>
    );
  }

  // Three images: tall left, two stacked right
  if (images.length === 3) {
    return (
      <div className="my-2 grid h-[300px] grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl">
        <Image
          src={images[0]}
          className="col-start-1 row-span-2 h-full w-full object-cover"
        />
        <Image
          src={images[1]}
          className="col-start-2 row-start-1 h-[150px] w-full object-cover"
        />
        <Image
          src={images[2]}
          className="col-start-2 row-start-2 h-[150px] w-full object-cover"
        />
      </div>
    );
  }

  // Four images: 2x2 grid
  return (
    <div className="my-2 grid grid-cols-2 gap-0.5 overflow-hidden rounded-xl">
      {images.map((image, index) => (
        <Image
          key={index}
          src={image}
          className="h-[200px] w-full object-cover"
        />
      ))}
    </div>
  );
}

function Image({ src, className = "" }) {
  const [error, setError] = useState(false);
  if (error || !src) return null;
  return (
    <img
      src={src}
      alt=""
      className={className}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}
