import Link from "next/link";
import Logo from "@/components/Logo";
import {
  Sparkles, Map, Wallet, Clock, MessageCircle,
  ChevronRight, Globe, Shield, Zap, Star
} from "lucide-react";

// ── Static data ──────────────────────────────────────────────

const features = [
  {
    icon: <Sparkles size={20} className="text-brand-500" />,
    title: "AI-Powered Planning",
    description:
      "Our AI researches destinations, prices, and activities in real-time to build you a truly personalized itinerary.",
    bg: "bg-blue-50",
  },
  {
    icon: <Wallet size={20} className="text-teal-500" />,
    title: "Budget Optimizer",
    description:
      "Set your budget and let SmartTrip AI find the best value accommodation, transport, and experiences.",
    bg: "bg-teal-50",
  },
  {
    icon: <Clock size={20} className="text-purple-500" />,
    title: "Day-by-Day Itinerary",
    description:
      "Get a complete schedule with activity times, estimated costs, and local tips for every day of your trip.",
    bg: "bg-purple-50",
  },
  {
    icon: <MessageCircle size={20} className="text-amber-500" />,
    title: "Conversational Chat",
    description:
      "Refine your plan through natural conversation — say 'make it cheaper' or 'add a beach day'.",
    bg: "bg-amber-50",
  },
  {
    icon: <Globe size={20} className="text-rose-500" />,
    title: "Destination Research",
    description:
      "Verified information from trusted sources about attractions, opening hours, and transport options.",
    bg: "bg-rose-50",
  },
  {
    icon: <Shield size={20} className="text-indigo-500" />,
    title: "Transparent Pricing",
    description:
      "All price estimates are clearly labeled. No hidden costs — just honest, research-backed figures.",
    bg: "bg-indigo-50",
  },
];

const steps = [
  {
    num: "01",
    title: "Tell us your dream trip",
    desc: "Share your destination, travel dates, budget, and interests in a simple chat.",
  },
  {
    num: "02",
    title: "AI researches for you",
    desc: "SmartTrip AI analyses thousands of options and crafts a personalised plan within seconds.",
  },
  {
    num: "03",
    title: "Refine and go",
    desc: "Chat to tweak your plan, regenerate alternatives, or download the final itinerary.",
  },
];

const destinations = [
  { name: "Ooty",       country: "India",     emoji: "🏔️", tag: "Hill Station" },
  { name: "Goa",        country: "India",     emoji: "🏖️", tag: "Beach"        },
  { name: "Rajasthan",  country: "India",     emoji: "🏰", tag: "Heritage"     },
  { name: "Coorg",      country: "India",     emoji: "☕", tag: "Nature"       },
  { name: "Bali",       country: "Indonesia", emoji: "🌺", tag: "Tropical"     },
  { name: "Bangkok",    country: "Thailand",  emoji: "🛺", tag: "City"         },
];

const testimonials = [
  {
    name: "Priya S.",
    trip: "3 days in Ooty",
    rating: 5,
    text: "Saved hours of research! The itinerary was spot-on and we stayed under budget. 10/10.",
  },
  {
    name: "Rahul M.",
    trip: "Weekend in Goa",
    rating: 5,
    text: "Asked for a budget Goa trip and got a brilliant plan in under a minute. Loved it!",
  },
  {
    name: "Sneha K.",
    trip: "Family Rajasthan",
    rating: 5,
    text: "Planning a family trip used to take days. SmartTrip AI did it in seconds. Incredible.",
  },
];

// ── Page ─────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ───────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">How it works</a>
            <a href="#destinations" className="hover:text-brand-600 transition-colors">Destinations</a>
          </div>
          <Link
            href="/chat"
            className="flex items-center gap-2 bg-gradient-to-r from-brand-500 to-teal-500
              text-white text-sm font-semibold px-4 py-2 rounded-xl
              hover:from-brand-600 hover:to-teal-600 transition-all shadow-sm"
          >
            <Zap size={14} />
            Plan My Trip
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-bg relative py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 text-center text-white relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full
            px-4 py-1.5 text-xs font-medium mb-6 animate-fade-in">
            <Sparkles size={13} />
            Powered by Advanced AI
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold leading-tight tracking-tight mb-6 animate-slide-up">
            Your Personal
            <span className="block bg-gradient-to-r from-teal-300 to-blue-300 bg-clip-text text-transparent">
              AI Travel Planner
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up"
            style={{ animationDelay: "100ms" }}>
            Plan unforgettable trips with AI. Discover destinations, optimize your budget,
            and create personalized itineraries — in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
            style={{ animationDelay: "200ms" }}>
            <Link
              href="/chat"
              id="cta-plan-my-trip"
              className="flex items-center gap-2.5 bg-white text-brand-600 font-bold
                text-base px-8 py-3.5 rounded-2xl shadow-lg
                hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0
                transition-all duration-200"
            >
              <Map size={18} />
              Plan My Trip
              <ChevronRight size={16} />
            </Link>
            <a href="#features"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium underline underline-offset-4">
              See how it works ↓
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto animate-fade-in"
            style={{ animationDelay: "400ms" }}>
            {[
              ["10K+", "Trips Planned"],
              ["98%", "Satisfaction"],
              ["50+", "Destinations"],
            ].map(([val, lbl]) => (
              <div key={lbl} className="text-center">
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="text-xs text-white/60 mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Everything you need to travel smarter
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              SmartTrip AI handles the research, budgeting, and planning so you can focus on the experience.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card
                  hover:shadow-card2 hover:-translate-y-0.5 transition-all duration-200 group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Plan your trip in 3 simple steps
            </h2>
            <p className="text-slate-500">Go from idea to full itinerary in under 2 minutes.</p>
          </div>
          <div className="relative">
            {/* connection line */}
            <div className="hidden sm:block absolute top-8 left-1/6 right-1/6 h-px bg-gradient-to-r from-brand-200 via-teal-300 to-brand-200" />
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div key={step.num} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-teal-500
                    flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-glow">
                    {step.num}
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-12">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-teal-500
                text-white font-semibold px-8 py-3.5 rounded-2xl shadow-md
                hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Planning Now <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Popular destinations ──────────────────────────── */}
      <section id="destinations" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Popular destinations
            </h2>
            <p className="text-slate-500">Explore some of the most loved travel spots our AI has planned.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {destinations.map((d) => (
              <Link
                key={d.name}
                href={`/chat?q=Plan+a+trip+to+${encodeURIComponent(d.name)}`}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card
                  hover:shadow-card2 hover:-translate-y-0.5 transition-all duration-200
                  flex items-center gap-4 group"
              >
                <span className="text-4xl">{d.emoji}</span>
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                    {d.name}
                  </h3>
                  <p className="text-xs text-slate-400">{d.country}</p>
                  <span className="inline-block mt-1 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {d.tag}
                  </span>
                </div>
                <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-brand-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">What travelers say</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-slate-50 rounded-2xl p-5 border border-slate-200"
              >
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" className="text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">&quot;{t.text}&quot;</p>
                <div>
                  <p className="font-semibold text-sm text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.trip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="hero-bg py-20">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to plan your dream trip?
          </h2>
          <p className="text-white/75 mb-8 text-lg">
            Join thousands of travelers who plan smarter with SmartTrip AI.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2.5 bg-white text-brand-600 font-bold
              text-base px-8 py-3.5 rounded-2xl shadow-lg
              hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <Sparkles size={18} />
            Get Started &mdash; It&apos;s Free
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row
          items-center justify-between gap-4">
          <Logo size="sm" white />
          <p className="text-xs">© {new Date().getFullYear()} SmartTrip AI. Built with ❤️ for travelers.</p>
          <div className="flex items-center gap-5 text-xs">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
