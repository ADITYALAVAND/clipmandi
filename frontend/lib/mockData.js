// Fallback data used only if the backend API is unreachable —
// keeps the UI viewable while you're only working on the frontend.

export const mockCampaigns = [
  {
    id: "camp_1",
    name: "Founder Story — Talking Head Series",
    brand: "GlowFit Wellness",
    icon: "🎙️",
    cpm: 250,
    budgetTotal: 150000,
    budgetSpent: 114000,
    views: 1900000,
    clipsCount: 62,
    platforms: ["Instagram", "YouTube Shorts"],
    status: "live"
  },
  {
    id: "camp_2",
    name: "Morning Routine Vlogs",
    brand: "GlowFit Wellness",
    icon: "🥗",
    cpm: 180,
    budgetTotal: 100000,
    budgetSpent: 68000,
    views: 1100000,
    clipsCount: 44,
    platforms: ["Instagram", "TikTok"],
    status: "live"
  },
  {
    id: "camp_3",
    name: "Product Launch Q&A",
    brand: "GlowFit Wellness",
    icon: "💼",
    cpm: 300,
    budgetTotal: 102000,
    budgetSpent: 102000,
    views: 980000,
    clipsCount: 81,
    platforms: ["YouTube Shorts"],
    status: "budget_spent"
  },
  {
    id: "camp_4",
    name: "TechBaba Investing Shorts",
    brand: "TechBaba Media",
    icon: "📈",
    cpm: 310,
    budgetTotal: 90000,
    budgetSpent: 32000,
    views: 842000,
    clipsCount: 21,
    platforms: ["YouTube Shorts", "Instagram"],
    status: "live"
  },
  {
    id: "camp_5",
    name: "Kabaddi Highlights Reel",
    brand: "Pro Kabaddi Fan Network",
    icon: "🏏",
    cpm: 150,
    budgetTotal: 70000,
    budgetSpent: 51000,
    views: 3400000,
    clipsCount: 118,
    platforms: ["Instagram", "TikTok"],
    status: "live"
  }
];

export const mockClips = [
  {
    id: "clip_1",
    campaignId: "camp_1",
    clipper: "@rahul.edits",
    platform: "Instagram Reels",
    views: 14200,
    earnings: 3550,
    status: "live"
  },
  {
    id: "clip_2",
    campaignId: "camp_2",
    clipper: "@clipqueen_priya",
    platform: "YouTube Shorts",
    views: 6830,
    earnings: 1229,
    status: "review"
  },
  {
    id: "clip_3",
    campaignId: "camp_5",
    clipper: "@clipqueen_priya",
    platform: "Instagram Reels",
    views: 2140,
    earnings: 0,
    status: "rejected"
  }
];

export const mockWallet = {
  balance: 18400,
  transactions: [
    { id: "txn_1", type: "earning", amount: 3550, note: "Founder Story #14 approved", date: "2026-07-10" },
    { id: "txn_2", type: "earning", amount: 1229, note: "Morning Routine #9 pending", date: "2026-07-12" },
    { id: "txn_3", type: "withdrawal", amount: -5000, note: "UPI withdrawal", date: "2026-07-14" }
  ]
};

export const mockTicker = [
  { name: "Founder Story Series", stat: "1.9M views", chip: "₹250 CPM", up: true },
  { name: "Morning Routine Vlogs", stat: "1.1M views", chip: "₹180 CPM", up: true },
  { name: "TechBaba Investing Shorts", stat: "842K views", chip: "₹310 CPM", up: true },
  { name: "Kabaddi Highlights Reel", stat: "3.4M views", chip: "₹150 CPM", up: true },
  { name: "Product Launch Q&A", stat: "980K views · budget spent", chip: "₹300 CPM", up: false }
];
