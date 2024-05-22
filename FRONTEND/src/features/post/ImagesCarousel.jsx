import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function ImagesCarousel({ images }) {
  if (!images) return;
  return (
    <div className="my-6">
      {images.length <= 1 ? (
        <Image image={images[0]} />
      ) : (
        <Carousel className="w-full">
          <CarouselContent>
            {images?.map((image, index) => (
              <CarouselItem key={index}>
                <Image image={image} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 scale-125" />
          <CarouselNext className="right-2 scale-125" />
        </Carousel>
      )}
    </div>
  );
}

function Image({ image }) {
  return (
    <Card className="rounded-sm">
      <CardContent className={`flex aspect-square items-center justify-center`}>
        <img src={image} alt="" className="w-full rounded-sm"/>
      </CardContent>
    </Card>
  );
}
