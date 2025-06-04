import { useEffect, useState } from "react";

const getIntersectionObserver = function (
  handleIntersect: (entry: IntersectionObserverEntry) => void,
  root: Element | Document | null,
  rootMargin: string = "100px",
  threshold: number = 0.1
): IntersectionObserver {
  return new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry: IntersectionObserverEntry) => {
        handleIntersect(entry);
      });
    },
    { root, rootMargin, threshold }
  );
};

export default function useIntersectionObserver(
  observedElement: HTMLElement | null,
  handler: (entry: IntersectionObserverEntry) => void,
  rootMargin: string = "100px",
  threshold: number = 0.1,
  root: Element | Document | null = document,
  startObserving: boolean = true
) {
  const [intersectionObserver] = useState<IntersectionObserver>(
    (): IntersectionObserver =>
      getIntersectionObserver(handler, root, rootMargin, threshold)
  );

  useEffect(() => {
    if (!observedElement || !startObserving) return;
    console.log("starting observing element");
    intersectionObserver.observe(observedElement);
    return () => {
      intersectionObserver.unobserve(observedElement);
    };
  }, [observedElement, intersectionObserver, startObserving]);
}
