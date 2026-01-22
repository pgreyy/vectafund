'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Bell, 
  Shield, 
  Search, 
  Filter, 
  ExternalLink, 
  Star, 
  StarOff,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Loader2,
  Menu,
  X,
  Settings,
  LogOut
} from 'lucide-react'
import { SEED_VCS, SEED_FUNDRAISES } from '@/lib/seed-data'
import { getEthosScoreLevel } from '@/lib/ethos'

// Mock data for demo - in production this would come from Supabase + Ethos API
const mockEthosScores: Record<string, number> = {
  'a16zcrypto': 1892,
  'paradigm': 1847,
  'polychain': 1654,
  'sequoia': 1423,
  'cbventures': 1567,
  'BinanceLabs': 1234,
  'dragonfly_xyz': 1789,
  'multicoinital': 1456,
  'PanteraCapital': 1345,
  'GalaxyDigitalHQ': 1123,
  'hiframework': 1678,
  'ElectricCapital': 1534,
  'variantfund': 1612,
  'hack_vc': 1456,
  'placeholder': 1234,
  'Delphi_Ventures': 1345,
  'robotventures': 1289,
  'AllianceDAO': 1156,
  'blockchaincap': 1234,
  '1kxnetwork': 1178,
  'archetypevc': 1267,
  'nascentxyz': 1345,
  'IOSGVC': 1189,
  'animocabrands': 1234,
  'TheSpartanGroup': 1156,
  'balajis': 2134,
  'naval': 1956,
  'cdixon': 1823,
  'VitalikButerin': 2456,
  'two_bit_idiot': 1234,
  'cobie': 1567,
  'CryptoHayes': 1345,
  'zaboratoryxzhu': 987,
  'HsakaTrades': 1123,
  'DegenSpartan': 1089,
}

type TabType = 'feed' | 'vcs' | 'following' | 'digest'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('feed')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [followedVCs, setFollowedVCs] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Enrich VCs with mock Ethos scores
  const enrichedVCs = SEED_VCS.map(vc => ({
    ...vc,
    id: vc.twitter_handle,
    ethos_score: mockEthosScores[vc.twitter_handle] || null,
    ethos_profile_url: `https://app.ethos.network/profile/x/${vc.twitter_handle}`,
    created_at: new Date().toISOString(),
  }))

  // Filter VCs based on search and category
  const filteredVCs = enrichedVCs.filter(vc => {
    const matchesSearch = vc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vc.twitter_handle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || vc.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Get followed VCs
  const followedVCsList = enrichedVCs.filter(vc => followedVCs.has(vc.id))

  // Enrich fundraises with data
  const enrichedFundraises = SEED_FUNDRAISES.map((f, i) => ({
    ...f,
    id: `fundraise-${i}`,
    created_at: f.announced_date,
    total_ethos_score: f.lead_investors.reduce((sum, handle) => {
      return sum + (mockEthosScores[handle] || 0)
    }, 0),
  }))

  // Sort fundraises by total ethos score for digest
  const digestFundraises = [...enrichedFundraises].sort((a, b) => 
    (b.total_ethos_score || 0) - (a.total_ethos_score || 0)
  )

  const toggleFollow = (vcId: string) => {
    setFollowedVCs(prev => {
      const next = new Set(prev)
      if (next.has(vcId)) {
        next.delete(vcId)
      } else if (next.size < 5) {
        next.add(vcId)
      }
      return next
    })
  }

  const formatAmount = (amount?: number) => {
    if (!amount) return 'Undisclosed'
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(0)}M`
    return `$${amount.toLocaleString()}`
  }

  const getRoundTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'pre-seed': 'Pre-Seed',
      'seed': 'Seed',
      'series-a': 'Series A',
      'series-b': 'Series B',
      'series-c': 'Series C',
      'strategic': 'Strategic',
      'unknown': 'Unknown',
    }
    return labels[type] || type
  }

  return (
    <div className="min-h-screen bg-vf-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-vf-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-vf-accent flex items-center justify-center">
              <span className="font-display font-bold text-vf-black text-lg">V</span>
            </div>
            <span className="font-display font-semibold text-xl text-vf-text hidden sm:block">VectaFund</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login" className="text-vf-muted hover:text-vf-text transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <Link href="/auth/login" className="btn-primary text-sm py-2 px-4">
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-vf-border bg-vf-dark p-4 space-y-4">
            <Link href="/auth/login" className="block text-vf-muted hover:text-vf-text">Settings</Link>
            <Link href="/auth/login" className="btn-primary block text-center">Sign In</Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-vf-text mb-2">
            Dashboard
          </h1>
          <p className="text-vf-muted">
            Track fundraises from top crypto VCs, powered by Ethos reputation scores.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'VCs Tracked', value: enrichedVCs.length, icon: TrendingUp },
            { label: 'Recent Raises', value: enrichedFundraises.length, icon: Calendar },
            { label: 'Following', value: followedVCs.size, subtext: '/ 5 max', icon: Star },
            { label: 'Avg Ethos Score', value: '1,456', icon: Shield },
          ].map((stat, i) => (
            <div key={i} className="bg-vf-card border border-vf-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-vf-muted mb-1">
                <stat.icon className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-vf-text">{stat.value}</span>
                {stat.subtext && <span className="text-sm text-vf-muted">{stat.subtext}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-vf-dark rounded-lg mb-6 overflow-x-auto">
          {[
            { id: 'feed', label: 'Live Feed' },
            { id: 'vcs', label: 'Browse VCs' },
            { id: 'following', label: 'Following' },
            { id: 'digest', label: 'Weekly Digest' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 min-w-[100px] px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-vf-card text-vf-text shadow-lg' 
                  : 'text-vf-muted hover:text-vf-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Live Feed Tab */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              <div className="bg-vf-card border border-vf-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-vf-border flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-vf-accent animate-pulse" />
                  <span className="text-sm font-medium">Recent Fundraise Announcements</span>
                </div>
                <div className="divide-y divide-vf-border/50">
                  {enrichedFundraises.map((fundraise, i) => (
                    <div key={i} className="p-4 md:p-6 hover:bg-vf-dark/30 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-vf-dark flex items-center justify-center shrink-0">
                            <span className="font-display font-bold text-vf-accent text-lg">
                              {fundraise.project_name[0]}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-semibold text-vf-text">{fundraise.project_name}</h3>
                              <span className="text-vf-accent font-mono font-medium">
                                {formatAmount(fundraise.amount_raised)}
                              </span>
                              <span className="px-2 py-0.5 bg-vf-dark rounded text-xs text-vf-muted">
                                {getRoundTypeLabel(fundraise.round_type)}
                              </span>
                            </div>
                            <p className="text-sm text-vf-muted mt-1 line-clamp-1">
                              {fundraise.project_description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className="text-xs text-vf-muted">Led by:</span>
                              {fundraise.lead_investors.slice(0, 2).map((handle, j) => {
                                const vc = enrichedVCs.find(v => v.twitter_handle === handle)
                                const score = mockEthosScores[handle]
                                return (
                                  <a
                                    key={j}
                                    href={`https://app.ethos.network/profile/x/${handle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 hover:opacity-80"
                                  >
                                    <span className="text-sm text-vf-text">{vc?.name || handle}</span>
                                    {score && (
                                      <span className={`ethos-badge ${getEthosScoreLevel(score)}`}>
                                        <Shield className="w-3 h-3" />
                                        {score.toLocaleString()}
                                      </span>
                                    )}
                                  </a>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-vf-muted whitespace-nowrap">
                            {new Date(fundraise.announced_date).toLocaleDateString()}
                          </span>
                          {fundraise.source_url && (
                            <a
                              href={fundraise.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-vf-dark hover:bg-vf-border transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-vf-muted" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Browse VCs Tab */}
          {activeTab === 'vcs' && (
            <div className="space-y-4">
              {/* Search & Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-vf-muted" />
                  <input
                    type="text"
                    placeholder="Search VCs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input-field md:w-48"
                >
                  <option value="all">All Categories</option>
                  <option value="tier1">Tier 1 VCs</option>
                  <option value="tier2">Tier 2 VCs</option>
                  <option value="tier3">Tier 3 VCs</option>
                  <option value="angel">Angel Investors</option>
                </select>
              </div>

              {/* VC Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVCs.map((vc) => (
                  <div
                    key={vc.id}
                    className="bg-vf-card border border-vf-border rounded-xl p-4 card-hover"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-vf-dark flex items-center justify-center">
                          <span className="font-display font-bold text-vf-accent">
                            {vc.name[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-vf-text">{vc.name}</h3>
                          <a
                            href={`https://x.com/${vc.twitter_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-vf-muted hover:text-vf-accent"
                          >
                            @{vc.twitter_handle}
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFollow(vc.id)}
                        disabled={!followedVCs.has(vc.id) && followedVCs.size >= 5}
                        className={`p-2 rounded-lg transition-colors ${
                          followedVCs.has(vc.id)
                            ? 'bg-vf-accent/20 text-vf-accent'
                            : followedVCs.size >= 5
                            ? 'bg-vf-dark text-vf-muted cursor-not-allowed'
                            : 'bg-vf-dark text-vf-muted hover:text-vf-accent hover:bg-vf-accent/10'
                        }`}
                      >
                        {followedVCs.has(vc.id) ? (
                          <Star className="w-5 h-5 fill-current" />
                        ) : (
                          <StarOff className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    
                    <p className="text-sm text-vf-muted mb-3 line-clamp-2">
                      {vc.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-vf-dark rounded text-xs text-vf-muted capitalize">
                        {vc.category === 'tier1' ? 'Tier 1' : 
                         vc.category === 'tier2' ? 'Tier 2' :
                         vc.category === 'tier3' ? 'Tier 3' : 'Angel'}
                      </span>
                      {vc.ethos_score ? (
                        <a
                          href={vc.ethos_profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`ethos-badge ${getEthosScoreLevel(vc.ethos_score)}`}
                        >
                          <Shield className="w-3 h-3" />
                          {vc.ethos_score.toLocaleString()}
                        </a>
                      ) : (
                        <span className="ethos-badge none">
                          <Shield className="w-3 h-3" />
                          Not on Ethos
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Following Tab */}
          {activeTab === 'following' && (
            <div className="space-y-4">
              {followedVCsList.length === 0 ? (
                <div className="bg-vf-card border border-vf-border rounded-xl p-12 text-center">
                  <StarOff className="w-12 h-12 text-vf-muted mx-auto mb-4" />
                  <h3 className="font-semibold text-vf-text text-lg mb-2">No VCs followed yet</h3>
                  <p className="text-vf-muted mb-4">
                    Follow up to 5 VCs to receive alerts when they lead new investments.
                  </p>
                  <button
                    onClick={() => setActiveTab('vcs')}
                    className="btn-primary"
                  >
                    Browse VCs
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-vf-dark/50 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-vf-muted">
                      Following <span className="text-vf-text font-medium">{followedVCs.size}/5</span> VCs
                    </span>
                    <span className="text-xs text-vf-muted">
                      Sign in to save your follows and enable alerts
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {followedVCsList.map((vc) => (
                      <div
                        key={vc.id}
                        className="bg-vf-card border border-vf-accent/30 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-vf-accent/10 flex items-center justify-center">
                              <span className="font-display font-bold text-vf-accent">
                                {vc.name[0]}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-vf-text">{vc.name}</h3>
                              <span className="text-sm text-vf-muted">@{vc.twitter_handle}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleFollow(vc.id)}
                            className="p-2 rounded-lg bg-vf-accent/20 text-vf-accent"
                          >
                            <Star className="w-5 h-5 fill-current" />
                          </button>
                        </div>
                        {vc.ethos_score && (
                          <a
                            href={vc.ethos_profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`ethos-badge ${getEthosScoreLevel(vc.ethos_score)}`}
                          >
                            <Shield className="w-3 h-3" />
                            Ethos Score: {vc.ethos_score.toLocaleString()}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Weekly Digest Tab */}
          {activeTab === 'digest' && (
            <div className="space-y-4">
              <div className="bg-vf-card border border-vf-border rounded-xl overflow-hidden">
                <div className="p-6 border-b border-vf-border">
                  <h2 className="font-display text-xl font-bold text-vf-text mb-1">
                    Weekly Digest
                  </h2>
                  <p className="text-sm text-vf-muted">
                    Top raises ranked by combined Ethos reputation scores of lead investors
                  </p>
                </div>
                <div className="divide-y divide-vf-border/50">
                  {digestFundraises.map((fundraise, i) => (
                    <div key={i} className="p-4 md:p-6 hover:bg-vf-dark/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-vf-dark flex items-center justify-center shrink-0">
                          <span className="font-mono font-bold text-vf-accent">
                            #{i + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-vf-text">{fundraise.project_name}</h3>
                            <span className="text-vf-accent font-mono font-medium">
                              {formatAmount(fundraise.amount_raised)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-vf-muted">Combined Ethos Score:</span>
                            <span className="ethos-badge high">
                              <Shield className="w-3 h-3" />
                              {(fundraise.total_ethos_score || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {fundraise.source_url && (
                          <a
                            href={fundraise.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-vf-dark hover:bg-vf-border transition-colors shrink-0"
                          >
                            <ArrowUpRight className="w-4 h-4 text-vf-muted" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
