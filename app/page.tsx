import { Hero } from "@/components/hero";
import { FlightSearch } from "@/components/flight-search";
import { FeaturedDestinations } from "@/components/featured-destinations";
import { WhyChooseUs } from "@/components/why-choose-us";
import { Testimonials } from "@/components/testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <FlightSearch />
      <FeaturedDestinations />
      <WhyChooseUs />
      <Testimonials />
    </>
  );
}