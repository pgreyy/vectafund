'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Mail, 
  Bell, 
  Send,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Copy,
  ExternalLink
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  email: string
  name?: string
  avatar_url?: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [telegramNotifications, setTelegramNotifications] = useState(false)
  const [telegramUsername, setTelegramUsername] = useState('')
  const [notificationFrequency, setNotificationFrequency] = useState<'realtime' | 'daily' | 'weekly'>('realtime')

  const TELEGRAM_BOT_USERNAME = 'VectaFundBot' // Replace with your actual bot username

  useEffect(() => {
    const supabase = createClient()
    
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser({
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
        })
      }
      setLoading(false)
    }
    
    getUser()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    setMessage(null)
    
    // Simulate saving (in production, save to Supabase)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setMessage({ type: 'success', text: 'Settings saved successfully!' })
    setSaving(false)
  }

  const copyBotLink = () => {
    navigator.clipboard.writeText(`https://t.me/${TELEGRAM_BOT_USERNAME}`)
    setMessage({ type: 'success', text: 'Bot link copied to clipboard!' })
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-vf-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-vf-accent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-vf-black flex items-center justify-center p-4">
        <div className="bg-vf-card border border-vf-border rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-vf-warning mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-vf-text mb-2">Sign in required</h2>
          <p className="text-vf-muted mb-6">
            You need to sign in to access notification settings.
          </p>
          <Link href="/auth/login" className="btn-primary inline-block">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-vf-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-vf-border/50">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="p-2 rounded-lg hover:bg-vf-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-vf-muted" />
          </Link>
          <div>
            <h1 className="font-semibold text-vf-text">Notification Settings</h1>
            <p className="text-sm text-vf-muted">Manage your alert preferences</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 max-w-3xl mx-auto">
        {/* Profile Card */}
        <div className="bg-vf-card border border-vf-border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name || 'Profile'} 
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-vf-accent flex items-center justify-center">
                <User className="w-8 h-8 text-vf-black" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-vf-text">{user.name || 'User'}</h2>
              <p className="text-vf-muted">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-vf-card border border-vf-border rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-vf-accent/10 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-vf-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-vf-text">Email Notifications</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-vf-border rounded-full peer peer-checked:bg-vf-accent transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
              <p className="text-sm text-vf-muted mb-4">
                Receive email alerts when VCs you follow lead new investments.
              </p>
              <div className="bg-vf-dark rounded-lg p-3">
                <p className="text-sm text-vf-muted">
                  Emails will be sent to: <span className="text-vf-text">{user.email}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Notifications */}
        <div className="bg-vf-card border border-vf-border rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Send className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-vf-text">Telegram Notifications</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={telegramNotifications}
                    onChange={(e) => setTelegramNotifications(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-vf-border rounded-full peer peer-checked:bg-blue-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
              <p className="text-sm text-vf-muted mb-4">
                Get instant Telegram alerts for fundraise announcements.
              </p>
              
              {telegramNotifications && (
                <div className="space-y-4">
                  <div className="bg-vf-dark rounded-lg p-4">
                    <p className="text-sm text-vf-text mb-3">
                      <strong>Step 1:</strong> Start our Telegram bot
                    </p>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://t.me/${TELEGRAM_BOT_USERNAME}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-between px-4 py-2 bg-vf-card border border-vf-border rounded-lg hover:border-blue-500/50 transition-colors"
                      >
                        <span className="text-vf-text">@{TELEGRAM_BOT_USERNAME}</span>
                        <ExternalLink className="w-4 h-4 text-vf-muted" />
                      </a>
                      <button
                        onClick={copyBotLink}
                        className="p-2 bg-vf-card border border-vf-border rounded-lg hover:border-vf-accent/50 transition-colors"
                      >
                        <Copy className="w-5 h-5 text-vf-muted" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-vf-dark rounded-lg p-4">
                    <p className="text-sm text-vf-text mb-3">
                      <strong>Step 2:</strong> Send <code className="px-2 py-0.5 bg-vf-card rounded text-vf-accent">/start</code> to the bot
                    </p>
                    <p className="text-sm text-vf-muted">
                      The bot will guide you through following VCs and setting up alerts.
                    </p>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-400 font-medium">Bot Commands</p>
                        <ul className="text-sm text-vf-muted mt-2 space-y-1">
                          <li><code>/follow a16zcrypto</code> - Follow a VC</li>
                          <li><code>/unfollow a16zcrypto</code> - Unfollow a VC</li>
                          <li><code>/following</code> - See your followed VCs</li>
                          <li><code>/latest</code> - Get latest fundraises</li>
                          <li><code>/top</code> - Top raises by Ethos score</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notification Frequency */}
        <div className="bg-vf-card border border-vf-border rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-vf-purple/10 flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6 text-vf-purple" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-vf-text mb-2">Notification Frequency</h3>
              <p className="text-sm text-vf-muted mb-4">
                How often do you want to receive alerts?
              </p>
              
              <div className="space-y-2">
                {[
                  { value: 'realtime', label: 'Real-time', desc: 'Get notified immediately' },
                  { value: 'daily', label: 'Daily Digest', desc: 'Once per day summary' },
                  { value: 'weekly', label: 'Weekly Digest', desc: 'Once per week summary' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      notificationFrequency === option.value
                        ? 'bg-vf-accent/10 border-vf-accent/50'
                        : 'bg-vf-dark border-vf-border hover:border-vf-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={option.value}
                      checked={notificationFrequency === option.value}
                      onChange={(e) => setNotificationFrequency(e.target.value as typeof notificationFrequency)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      notificationFrequency === option.value
                        ? 'border-vf-accent'
                        : 'border-vf-border'
                    }`}>
                      {notificationFrequency === option.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-vf-accent" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-vf-text">{option.label}</p>
                      <p className="text-sm text-vf-muted">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-vf-accent/10 border border-vf-accent/30 text-vf-accent' 
              : 'bg-vf-danger/10 border border-vf-danger/30 text-vf-danger'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>
      </main>
    </div>
  )
}
