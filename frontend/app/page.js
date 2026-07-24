"use client";

import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TickerBoard from "@/components/TickerBoard";
import StatsStrip from "@/components/StatsStrip";
import Stalls from "@/components/Stalls";
import Footer from "@/components/Footer";

import { getCampaigns } from "@/lib/api";

export default function LandingPage() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    async function loadCampaigns() {
      const data = await getCampaigns({
        status: "LIVE"
      });

      setCampaigns(data || []);
    }

    loadCampaigns();
  }, []);

  return (
    <>
      <Navbar />

      <Hero />

      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "0 48px"
        }}
      >
        <TickerBoard items={campaigns} />
      </div>

      <StatsStrip />

      <Stalls />

      <Footer />
    </>
  );
}