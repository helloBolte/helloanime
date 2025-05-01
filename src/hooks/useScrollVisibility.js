import { useEffect, useState } from "react";

export default function useScrollVisibility(ref, threshold = 0.3) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      const percentScrolled = scrollTop / scrollHeight;

      setIsVisible(percentScrolled <= threshold);
    };

    element.addEventListener("scroll", handleScroll);
    return () => element.removeEventListener("scroll", handleScroll);
  }, [ref, threshold]);

  return isVisible;
}
