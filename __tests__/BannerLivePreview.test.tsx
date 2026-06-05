import { render, screen } from '@testing-library/react';
import BannerLivePreview from '@/modules/banner/components/BannerLivePreview';

// next/image renders an <img> in jsdom; mock it to a plain img so alt/role work.
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as Record<string, string>)} />;
  },
}));

const baseProps = {
  image: 'data:image/png;base64,abc',
  title: 'Smart Trading Masterclass',
  description: '',
  date: '2026-06-08',
  time: '10:00 AM',
  ctaText: 'Register Now',
  ctaColor: '#10B981',
  ctaTextColor: '#FF00AA',
  textColor: '#F8FAFC',
  bgColor: '#0B1F33',
};

describe('BannerLivePreview', () => {
  it('applies the CTA button background and the new cta text color', () => {
    render(<BannerLivePreview {...baseProps} />);
    const cta = screen.getByRole('button', { name: 'Register Now' });
    expect(cta).toHaveStyle({ backgroundColor: '#10B981', color: '#FF00AA' });
  });

  it('uses the background and text colors on the card', () => {
    render(<BannerLivePreview {...baseProps} />);
    expect(screen.getByText('Smart Trading Masterclass')).toHaveStyle({ color: '#F8FAFC' });
  });

  it('falls back to "Register" when no CTA text is provided', () => {
    render(<BannerLivePreview {...baseProps} ctaText="" />);
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('formats an ISO-style date for display', () => {
    render(<BannerLivePreview {...baseProps} />);
    expect(screen.getByText(/08 Jun 2026/)).toBeInTheDocument();
  });
});
