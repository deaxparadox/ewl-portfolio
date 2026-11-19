import { About } from "./_components/About";
import { Approach } from "./_components/Approach";
import { Contact } from "./_components/Contact";
import { Focus } from "./_components/Focus";
import { Hero } from "./_components/Hero";
import { Nav } from "./_components/Nav";
import { Stack } from "./_components/Stack";
import { Work } from "./_components/Work";

export default function PortfolioPage() {
  return (
    <>
      <Nav />
      <main id="sectionStage" aria-label="Portfolio sections">
        <Hero />
        <About />
        <Focus />
        <Stack />
        <Work />
        <Approach />
        <Contact />
      </main>
      <div id="scrollTrack" aria-hidden="true"></div>
    </>
  );
}
