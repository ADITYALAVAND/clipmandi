import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TickerBoard from "@/components/TickerBoard";
import StatsStrip from "@/components/StatsStrip";
import Stalls from "@/components/Stalls";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "0 48px" }}>
        <TickerBoard />
      </div>
      <StatsStrip />
      <Stalls />
      <Footer />
    </>
  );
}
