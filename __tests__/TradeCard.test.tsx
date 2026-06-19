import { render, screen } from '@testing-library/react';
import TradeCard from '@/components/dashboard/components/TradeCard';
import type { ChatMessage } from '@/store/slices/messageSlice';

const imageAttachment: NonNullable<ChatMessage['attachment']> = {
  name: 'chart.png',
  size: '120 KB',
  fileType: 'image',
  url: 'data:image/png;base64,abc',
};

describe('TradeCard', () => {
  it('renders an attached image inside the card', () => {
    render(<TradeCard content="<p>Booked profit</p>" timestamp="11:30 AM" attachment={imageAttachment} />);
    expect(screen.getByAltText('chart.png')).toBeInTheDocument();
  });

  it('shows the message type and the last 3 chars of the message id', () => {
    render(
      <TradeCard
        content="<p>Booked profit</p>"
        timestamp="11:30 AM"
        messageId="msg_000abc"
        messageType="Trade"
      />
    );
    expect(screen.getByText('Trade')).toBeInTheDocument();
    expect(screen.getByText('#abc')).toBeInTheDocument();
  });

  it('does not inject a fabricated "RESEARCH ANALYSIS" header for plain content', () => {
    render(<TradeCard content="<p>Booked profit</p>" timestamp="11:30 AM" />);
    expect(screen.queryByText(/RESEARCH ANALYSIS/i)).not.toBeInTheDocument();
    expect(screen.getByText('Booked profit')).toBeInTheDocument();
  });

  it('renders the structured layout when the content is a research analysis', () => {
    render(<TradeCard content="<p>✅ RESEARCH ANALYSIS ✅</p>" timestamp="11:30 AM" />);
    expect(screen.getByText(/RESEARCH ANALYSIS/i)).toBeInTheDocument();
  });
});
