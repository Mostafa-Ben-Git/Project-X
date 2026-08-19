import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function ImagesCarousel({ images }) {
  if (!images) return;

  // Single image: fill container, no carousel controls
  if (images.length === 1) {
    return (
      <div className="my-2 -mx-4 md:-mx-6 overflow-hidden">
        <img
          src={images[0]}
          alt=""
          className="w-full max-h-[520px] object-cover"
          loading="lazy"
        />
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
              <img
                src={image}
                alt=""
                className="w-full max-h-[520px] object-cover"
                loading="lazy"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 scale-125" />
      <CarouselNext className="right-2 scale-125" />
    </Carousel>
  );
}
