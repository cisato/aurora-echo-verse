import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, Sparkles, Shield, Mic, BookOpen, Activity } from "lucide-react";
import { Helmet } from "react-helmet-async";
import auroraMark from "@/assets/aurora-mark.png";
import landingHero from "@/assets/landing-hero.jpg";

const features = [
  { icon: Brain, title: "Real memory", body: "Aurora remembers what matters to you — projects, people, patterns — across every conversation." },
  { icon: Mic, title: "Voice-first", body: "Talk naturally. High-accuracy server-side transcription works in every browser, every accent." },
  { icon: Sparkles, title: "Personas that fit your mood", body: "Therapist, coach, strategist, friend. Switch the lens without losing the thread." },
  { icon: Activity, title: "Proactive insights", body: "Aurora notices growth, drift and recurring themes — and surfaces them at the right moment." },
  { icon: BookOpen, title: "Daily rituals", body: "Morning intentions, evening reflections. A companion for the practice of becoming." },
  { icon: Shield, title: "Yours, end to end", body: "Per-user isolation, row-level security and one-click memory deletion. Always." },
];

export default function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/app" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Aurora — The reflective AI companion that remembers you</title>
        <meta name="description" content="Aurora is a voice-first AI companion with real memory, growth rituals and proactive insights. Built for knowledge workers who think out loud." />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="Aurora — The reflective AI companion" />
        <meta property="og:description" content="Voice-first AI companion with real memory, growth rituals and proactive insights." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={auroraMark} alt="" width={28} height={28} className="h-7 w-7" />
            <span className="font-serif text-xl tracking-tight">Aurora</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/demo" className="hover:text-foreground transition">Live demo</Link>
            <Link to="/pricing" className="hover:text-foreground transition">Pricing</Link>
            <Link to="/security" className="hover:text-foreground transition">Security</Link>
            <Link to="/privacy" className="hover:text-foreground transition">Privacy</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
            <Button asChild size="sm"><Link to="/auth">Get started</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={landingHero}
          alt=""
          width={1536}
          height={1024}
          className="absolute inset-0 w-full h-full object-cover opacity-30 dark:opacity-40 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
            <span className="h-px w-8 bg-border" /> A reflective AI companion <span className="h-px w-8 bg-border" />
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl leading-[1.05] tracking-tight max-w-3xl mx-auto">
            The AI that <em className="italic font-medium">remembers</em> who you're becoming.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Aurora is a voice-first companion for knowledge workers. Real memory, daily rituals,
            proactive insights — built around your growth, not the next prompt.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link to="/auth">Start free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link to="/demo">Try the live demo</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No card required · Free tier · NGN & USD pricing</p>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-2xl mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">Not another chat box.</h2>
          <p className="mt-3 text-muted-foreground">
            Most AI forgets you the moment the tab closes. Aurora is built on a tiered memory system,
            an emotional model, and rituals that compound.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <Card key={f.title} className="p-6 bg-card/60 border-border/60 hover:border-primary/40 transition">
              <f.icon className="h-5 w-5 text-primary mb-4" aria-hidden />
              <h3 className="font-medium text-base">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Wedge / positioning */}
      <section className="bg-primary/5 border-y border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Built for</p>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">
            African knowledge workers who think out loud.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Local-first pricing in Naira via Paystack. Voice that handles your accent. A companion
            that meets the rhythm of how you actually work.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild><Link to="/pricing">See pricing</Link></Button>
            <Button asChild variant="outline"><Link to="/demo">Watch a demo conversation</Link></Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={auroraMark} alt="" width={20} height={20} className="h-5 w-5" />
            <span>© {new Date().getFullYear()} Aurora</span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link to="/demo" className="hover:text-foreground">Demo</Link>
            <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/security" className="hover:text-foreground">Security</Link>
            <Link to="/auth" className="hover:text-foreground">Sign in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
