export type BannerStatus = 'Published' | 'Scheduled' | 'Draft';
export type PublishOption = 'now' | 'schedule' | 'draft';

export interface PreviousBanner {
  id: string;
  name: string;
  groupSent: string;
  date: string;
  status: BannerStatus;
}

export interface PreviousPost {
  id: string;
  title: string;
  meta: string;
  status: BannerStatus;
}

export const BANNER_CATEGORIES = ['Webinar', 'Promotion', 'Announcement', 'Course', 'Event'];

// Theme palette suggested from a typical dark trading banner.
export const SUGGESTED_PALETTE = ['#0A1626', '#101B2D', '#26303F', '#10B981', '#34D399'];

export const PREVIOUS_BANNERS: PreviousBanner[] = [
  { id: 'b1', name: 'Diwali Offer Promo', groupSent: 'All Free', date: '20 Oct', status: 'Published' },
  { id: 'b2', name: 'Diwali Offer Promo', groupSent: 'All Free', date: '20 Oct', status: 'Published' },
  { id: 'b3', name: 'Diwali Offer Promo', groupSent: 'All Free', date: '20 Oct', status: 'Published' },
  { id: 'b4', name: 'New Year Bonanza', groupSent: 'Paid Members', date: '02 Jan', status: 'Scheduled' },
  { id: 'b5', name: 'Options Bootcamp', groupSent: 'NF1, NF2', date: '14 Sep', status: 'Draft' },
  { id: 'b6', name: 'Crypto Masterclass', groupSent: 'All Paid', date: '28 Aug', status: 'Published' },
];

export const TOTAL_BANNERS = 24;

export const PREVIOUS_POSTS: PreviousPost[] = [
  { id: 'p1', title: 'Options Trading Basics', meta: '05 June', status: 'Published' },
  { id: 'p2', title: 'Crypto Webinar (Draft)', meta: 'Last edited 2 hrs ago', status: 'Draft' },
  { id: 'p3', title: 'Advanced Swing Strategies', meta: 'Scheduled for 12 June', status: 'Scheduled' },
];
