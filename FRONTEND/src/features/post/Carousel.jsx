import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Carousel({
  images,
  autoSlide = false,
  autoSlideInterval = 3000,
}) {
  const [curr, setCurr] = useState(0);

  const prev = () =>
    setCurr((curr) => (curr === 0 ? images.length - 1 : curr - 1));
  const next = () =>
    setCurr((curr) => (curr === images.length - 1 ? 0 : curr + 1));

  useEffect(() => {
    if (!autoSlide) return;
    const slideInterval = setInterval(next, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, []);

  if (!images) return;

  return (
    <div className="relative mt-6 overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${curr * 100}%)` }}
      >
        {images.map((image) => (
          <img key={image} src={image} alt="" className="w-full rounded-md" />
        ))}
      </div>
      {images.length !== 1 && (
        <>
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <button
              onClick={prev}
              className="rounded-full bg-white/80 p-1 text-gray-800 shadow hover:bg-white"
            >
              <ChevronLeft size={40} />
            </button>
            <button
              onClick={next}
              className="rounded-full bg-white/80 p-1 text-gray-800 shadow hover:bg-white"
            >
              <ChevronRight size={40} />
            </button>
          </div>
          <div className="absolute bottom-2 left-0 right-0">
            <div className="flex items-center justify-center gap-2">
              {images.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setCurr(i)}
                  className={`
              h-3 w-3 rounded-full bg-slate-400 transition-all cursor-pointer
              ${curr === i ? "p-2" : "bg-opacity-50"}
            `}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
