import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DashboardCarouselApi = UseEmblaCarouselType[1];
type UseDashboardCarouselParameters = Parameters<typeof useEmblaCarousel>;
type DashboardCarouselOptions = UseDashboardCarouselParameters[0];
type DashboardCarouselPlugin = UseDashboardCarouselParameters[1];

type DashboardCarouselProps = {
  opts?: DashboardCarouselOptions;
  plugins?: DashboardCarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: DashboardCarouselApi) => void;
};

type DashboardCarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & DashboardCarouselProps;

const DashboardCarouselContext = React.createContext<DashboardCarouselContextProps | null>(null);

function useDashboardCarousel() {
  const context = React.useContext(DashboardCarouselContext);
  if (!context) {
    throw new Error("useDashboardCarousel must be used within a <DashboardCarousel />");
  }
  return context;
}

function DashboardCarousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & DashboardCarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [visibleSlides, setVisibleSlides] = React.useState(0);

  const calculateVisibleSlides = React.useCallback(() => {
    if (!api) return;
    const viewportWidth = api.containerNode().offsetWidth;
    const slideNodes = api.slideNodes();
    if (slideNodes.length === 0) return;
    const slideWidth = slideNodes[0].offsetWidth;
    if (slideWidth > 0) {
      // Subtract a bit for margins/gaps if needed; adjust as per your styling
      setVisibleSlides(Math.floor(viewportWidth / slideWidth));
    }
  }, [api]);

  React.useEffect(() => {
    if (!api) return;
    calculateVisibleSlides();
    const handleResize = () => calculateVisibleSlides();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [api, calculateVisibleSlides]);

  const onSelect = React.useCallback((api: DashboardCarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    if (!api || visibleSlides <= 0) return;
    const currentIndex = api.selectedScrollSnap();
    let target = currentIndex - visibleSlides;
    if (target < 0) {
      target = 0; // Align to start
    }
    api.scrollTo(target);
  }, [api, visibleSlides]);

  const scrollNext = React.useCallback(() => {
    if (!api || visibleSlides <= 0) return;
    const currentIndex = api.selectedScrollSnap();
    const totalSlides = api.slideNodes().length;
    let target = currentIndex + visibleSlides;
    if (target >= totalSlides) {
      target = totalSlides - visibleSlides; // Align remaining to start (left)
      if (target < 0) target = 0; // Fallback for very few slides
    }
    api.scrollTo(target);
  }, [api, visibleSlides]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <DashboardCarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative group", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </DashboardCarouselContext.Provider>
  );
}

function DashboardCarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation, canScrollPrev, canScrollNext } = useDashboardCarousel();

  return (
    <div className="relative">
      <div
        ref={carouselRef}
        className="overflow-hidden"
        data-slot="carousel-content"
      >
        <div
          className={cn(
            "flex",
            orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
            className
          )}
          {...props}
        />
      </div>
      {/* Left blur gradient - only show if can scroll left */}
      {canScrollPrev && (
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
      )}
      {/* Right blur gradient - only show if can scroll right */}
      {canScrollNext && (
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      )}
    </div>
  );
}

function DashboardCarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useDashboardCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  );
}

function DashboardCarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useDashboardCarousel();

  if (!canScrollPrev) return null;

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-10 rounded-full cursor-pointer z-20 shadow-lg bg-background/95 hover:bg-background border border-border/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        orientation === "horizontal"
          ? "top-1/2 -left-20 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft className="h-4 w-4 text-secondary-foreground hover:text-secondary-foreground" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function DashboardCarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useDashboardCarousel();

  if (!canScrollNext) return null;

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-10 rounded-full cursor-pointer z-20 shadow-lg bg-background/95 hover:bg-background border border-border/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        orientation === "horizontal"
          ? "top-1/2 -right-20 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight className="h-4 w-4 text-secondary-foreground hover:text-secondary-foreground" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

export {
  type DashboardCarouselApi,
  DashboardCarousel,
  DashboardCarouselContent,
  DashboardCarouselItem,
  DashboardCarouselPrevious,
  DashboardCarouselNext,
};
