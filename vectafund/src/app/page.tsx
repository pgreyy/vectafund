'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Bell, Shield, Zap, TrendingUp, Users, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-vf-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-vf-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-vf-accent flex items-center justify-center">
              <span className="font-display font-bold text-vf-black text-lg">V</span>
            </div>
            <span className="font-display font-semibold text-xl text-vf-text">VectaFund</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-vf-muted hover:text-vf-text transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-vf-muted hover:text-vf-text transition-colors">How it Works</Link>
            <Link href="/dashboard" className="text-vf-muted hover:text-vf-text transition-colors">Dashboard</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="btn-secondary text-sm py-2 px-4">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-primary text-sm py-2 px-4">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-glow-accent opacity-30 blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-vf-card border border-vf-border mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-vf-accent animate-pulse" />
              <span className="text-sm text-vf-muted">Powered by Ethos Reputation Scores</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl md:text-7xl font-bold text-vf-text mb-6 animate-slide-up">
              Track <span className="text-vf-accent glow-text">Smart Money</span> in Crypto
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-vf-muted mb-10 animate-slide-up stagger-1">
              Get instant alerts when top VCs lead investments. Filter by reputation scores 
              to find the most credible deals before they go mainstream.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-2">
              <Link href="/auth/signup" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
                Start Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/dashboard" className="btn-secondary inline-flex items-center justify-center gap-2 text-lg">
                View Dashboard
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex items-center justify-center gap-8 text-vf-muted animate-slide-up stagger-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-vf-accent" />
                <span className="text-sm">Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-vf-accent" />
                <span className="text-sm">30+ Top VCs tracked</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-vf-accent" />
                <span className="text-sm">Email & Telegram alerts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Feed Preview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-vf-card border border-vf-border rounded-2xl overflow-hidden gradient-border">
            <div className="p-6 border-b border-vf-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-vf-accent animate-pulse" />
                <span className="text-vf-text font-medium">Live Fundraise Feed</span>
              </div>
              <Link href="/dashboard" className="text-vf-accent text-sm hover:underline">
                View all →
              </Link>
            </div>
            
            <div className="divide-y divide-vf-border/50">
              {/* Sample fundraise items */}
              {[
                { project: 'Monad', amount: '$225M', lead: 'Paradigm', score: 1847, time: '2h ago' },
                { project: 'Berachain', amount: '$100M', lead: 'Framework', score: 1523, time: '5h ago' },
                { project: 'Farcaster', amount: '$150M', lead: 'Paradigm', score: 1847, time: '1d ago' },
              ].map((item, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-vf-dark/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-vf-dark flex items-center justify-center">
                      <span className="font-display font-bold text-vf-accent">{item.project[0]}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-vf-text">{item.project}</span>
                        <span className="text-vf-accent font-mono font-medium">{item.amount}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-vf-muted">Led by {item.lead}</span>
                        <a 
                          href={`https://app.ethos.network`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ethos-badge high"
                        >
                          <Shield className="w-3 h-3" />
                          {item.score}
                        </a>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-vf-muted">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-vf-dark/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-vf-text mb-4">
              Why VectaFund?
            </h2>
            <p className="text-vf-muted text-lg max-w-2xl mx-auto">
              Cut through the noise. Track only the VCs that matter, powered by onchain reputation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Ethos Reputation Scores',
                description: 'Every VC and investor is scored by Ethos Network. Filter by credibility to avoid sketchy deals.',
              },
              {
                icon: Bell,
                title: 'Real-time Alerts',
                description: 'Get notified via email or Telegram the moment your followed VCs announce a new investment.',
              },
              {
                icon: TrendingUp,
                title: 'Weekly Digest',
                description: 'Receive a curated weekly report ranking the top raises by combined VC reputation scores.',
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'RSS-powered feed aggregates news from The Block, CoinDesk, and more in real-time.',
              },
              {
                icon: Users,
                title: 'Follow Top VCs',
                description: 'Choose up to 5 VCs to follow. Get personalized alerts only for deals that matter to you.',
              },
              {
                icon: CheckCircle2,
                title: '100% Free',
                description: 'No hidden fees. VectaFund is completely free during the beta period.',
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="p-6 bg-vf-card border border-vf-border rounded-xl card-hover"
              >
                <div className="w-12 h-12 rounded-lg bg-vf-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-vf-accent" />
                </div>
                <h3 className="font-semibold text-vf-text text-lg mb-2">{feature.title}</h3>
                <p className="text-vf-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-vf-text mb-4">
              How It Works
            </h2>
            <p className="text-vf-muted text-lg max-w-2xl mx-auto">
              Three simple steps to never miss a deal again.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Sign Up', description: 'Create a free account with your email or connect via Google/Twitter.' },
              { step: '02', title: 'Follow VCs', description: 'Browse our curated list of 30+ top crypto VCs and follow up to 5.' },
              { step: '03', title: 'Get Alerts', description: 'Receive instant email or Telegram notifications when they invest.' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-[100px] font-display font-bold text-vf-border/30 absolute -top-8 -left-4 select-none">
                  {item.step}
                </div>
                <div className="relative z-10 pt-16">
                  <h3 className="font-semibold text-vf-text text-xl mb-2">{item.title}</h3>
                  <p className="text-vf-muted">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-vf-card to-vf-dark border border-vf-border rounded-2xl p-12 text-center gradient-border glow-accent">
            <h2 className="font-display text-4xl font-bold text-vf-text mb-4">
              Ready to Track Smart Money?
            </h2>
            <p className="text-vf-muted text-lg mb-8">
              Join VectaFund today and never miss another alpha leak.
            </p>
            <Link href="/auth/signup" className="btn-primary inline-flex items-center gap-2 text-lg">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-vf-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-vf-accent flex items-center justify-center">
              <span className="font-display font-bold text-vf-black text-sm">V</span>
            </div>
            <span className="font-display font-semibold text-vf-text">VectaFund</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-vf-muted">
            <span>Built for the Ethos Vibeathon 2025</span>
            <a 
              href="https://ethos.network" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-vf-accent transition-colors"
            >
              <Shield className="w-4 h-4" />
              Powered by Ethos
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
