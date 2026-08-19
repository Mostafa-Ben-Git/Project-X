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

  // Single image: fill container, no carousel controls
  if (images.length === 1) {
    return (
      <div className="my-2 -mx-4 md:-mx-6 overflow-hidden">
        <Image src={images[0]} />
      </div>
    );
  }

  // Multiple images: swipeable carousel, no gaps, no card wrapper
  return (
    <Carousel className="w-full">
      <CarouselContent className="ml-0 pl-0">
        {images.map((image, index) => (
          <CarouselItem key={index} className="pl-0">
            <div className="w-full overflow-hidden">
              <Image src={image} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 scale-125" />
      <CarouselNext className="right-2 scale-125" />
    </Carousel>
  );
}

function Image({ src }) {
  const [error, setError] = useState(false);
  if (error || !src) return null;
  return (
    <img
      src={src}
      alt=""
      className="w-full max-h-[520px] object-cover"
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}
