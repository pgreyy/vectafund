// VC/Investor types
export interface VC {
  id: string;
  name: string;
  twitter_handle: string;
  avatar_url?: string;
  description?: string;
  website?: string;
  ethos_score?: number;
  ethos_profile_url?: string;
  category: 'tier1' | 'tier2' | 'tier3' | 'angel';
  created_at: string;
}

// Ethos API response
export interface EthosUser {
  id: number;
  profileId: number;
  displayName: string;
  username: string | null;
  avatarUrl: string;
  description: string | null;
  score: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MERGED';
  userkeys: string[];
  xpTotal: number;
  influenceFactor: number;
  influenceFactorPercentile: number;
  links: {
    profile: string;
    scoreBreakdown: string;
  };
  stats: {
    review: {
      received: {
        negative: number;
        neutral: number;
        positive: number;
      };
    };
    vouch: {
      given: {
        amountWeiTotal: number;
        count: number;
      };
      received: {
        amountWeiTotal: number;
        count: number;
      };
    };
  };
}

// Fundraise types
export interface Fundraise {
  id: string;
  project_name: string;
  project_description?: string;
  project_website?: string;
  project_twitter?: string;
  amount_raised?: number;
  currency: string;
  round_type: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'strategic' | 'unknown';
  announced_date: string;
  source_url?: string;
  source_name?: string;
  lead_investors: string[]; // VC ids
  other_investors: string[]; // VC ids
  total_ethos_score?: number; // Sum of all investor ethos scores
  created_at: string;
}

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  telegram_chat_id?: string;
  telegram_username?: string;
  email_notifications: boolean;
  telegram_notifications: boolean;
  notification_frequency: 'realtime' | 'daily' | 'weekly';
  created_at: string;
}

// User's followed VCs
export interface UserFollow {
  id: string;
  user_id: string;
  vc_id: string;
  created_at: string;
}

// Notification log
export interface Notification {
  id: string;
  user_id: string;
  fundraise_id: string;
  channel: 'email' | 'telegram';
  status: 'pending' | 'sent' | 'failed';
  sent_at?: string;
  created_at: string;
}

// RSS Feed item
export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  content?: string;
  contentSnippet?: string;
  source: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
