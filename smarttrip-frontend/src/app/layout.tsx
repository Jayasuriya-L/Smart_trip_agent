import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartTrip AI — Your Personal AI Travel Planner",
  description:
    "Plan unforgettable trips with AI. Discover destinations, optimize your budget, and create personalized itineraries with SmartTrip AI.",
  keywords: ["AI travel planner", "itinerary generator", "trip planner", "smart travel"],
  openGraph: {
    title: "SmartTrip AI — Your Personal AI Travel Planner",
    description: "Discover destinations, optimize your budget, and create personalized itineraries.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
