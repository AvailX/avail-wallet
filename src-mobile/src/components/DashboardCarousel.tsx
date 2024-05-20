import { Box, Typography } from "@mui/material";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

import carousel1 from "../assets/carousel-1.png";
import carousel2 from "../assets/carousel-2.png";
import carousel3 from "../assets/carousel-3.png";

// Breakpoints for responsive carousel
export const responsiveCarousel = {
  lg: {
    breakpoint: { max: 3000, min: 1250 },
    items: 3,
    slidesToSlide: 1, // optional, default to 1.
  },
  md: {
    breakpoint: { max: 1250, min: 900 },
    items: 2,
    slidesToSlide: 1, // optional, default to 1.
  },
  xmd: {
    breakpoint: { max: 900, min: 664 },
    items: 3,
    slidesToSlide: 1, // optional, default to 1.
  },
  sm: {
    breakpoint: { max: 664, min: 450 },
    items: 2,
    slidesToSlide: 1, // optional, default to 1.
  },
  xsm: {
    breakpoint: { max: 360, min: 0 },
    items: 1,
    slidesToSlide: 1, // optional, default to 1.
  },
};

// Carousel props
export const carouselProps = {
  swipeable: true,
  draggable: true,
  responsive: responsiveCarousel,
  infinite: true,
  autoPlay: true,
  arrows: false,
  autoPlaySpeed: 2000,
  keyBoardControl: true,
  customTransition: "transform 600ms ease-in-out",
  transitionDuration: 600,
  containerClass: "carousel-container",
  removeArrowOnDeviceType: ["tablet", "mobile"],
  dotListClass: "custom-dot-list-style",
  itemClass: "carousel-item-padding-40-px",
};

const DashboardCarousel = () => {
  return (
    <Box width='100%' bgcolor='red'>
      <Carousel {...carouselProps}>
        {[1, 2, 3].map((item, i) => (
          <Box key={i}>
            <Typography>Hello</Typography>
            {/* <img src={carousel2} /> */}
          </Box>
        ))}
      </Carousel>
    </Box>
  );
};

export default DashboardCarousel;
