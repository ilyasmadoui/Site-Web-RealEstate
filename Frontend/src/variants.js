export const fadeIn = (direction, delay) => {
    return {
      hidden: {
        opacity: 0,
        x: direction === "left" ? -50 : direction === "right" ? 50 : 0,
        y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
      },
      show: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration: 0.8,
          delay: delay,
          ease: "easeOut",
        },
      },
    };
  };
  