import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BannerThemeColors from '@/components/banner/components/BannerThemeColors';
import { useSuggestedPalette } from '@/components/banner/hooks/useSuggestedPalette';
import type { UseBannerForm } from '@/components/banner/hooks/useBannerForm';

jest.mock('@/components/banner/hooks/useSuggestedPalette');

const mockedPalette = useSuggestedPalette as jest.MockedFunction<typeof useSuggestedPalette>;

// A minimal stand-in for the form hook: just the colour fields the component
// reads plus a spy `set`.
const makeW = (): UseBannerForm =>
  ({
    ctaColor: '#10B981',
    ctaTextColor: '#FFFFFF',
    textColor: '#F8FAFC',
    bgColor: '#0B1F33',
    set: jest.fn(),
  }) as unknown as UseBannerForm;

const palette = {
  cta_button_color: '#FF5733',
  text_color: '#EEEEEE',
  background_color: '#1A1A2E',
  cta_button_text_color: '#123456',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BannerThemeColors', () => {
  it('renders a CTA Button Text Color field', () => {
    mockedPalette.mockReturnValue({ data: undefined, isLoading: false } as never);
    render(<BannerThemeColors w={makeW()} />);
    expect(screen.getByText('CTA Button Text Color')).toBeInTheDocument();
  });

  it('shows a CTA Text swatch in the suggested palette', () => {
    mockedPalette.mockReturnValue({ data: palette, isLoading: false } as never);
    render(<BannerThemeColors w={makeW()} />);
    expect(screen.getByText('CTA Text')).toBeInTheDocument();
  });

  it('applies every suggested colour, including cta_button_text_color, on "Apply all"', async () => {
    mockedPalette.mockReturnValue({ data: palette, isLoading: false } as never);
    const w = makeW();
    render(<BannerThemeColors w={w} />);

    await userEvent.click(screen.getByRole('button', { name: 'Apply all' }));

    expect(w.set).toHaveBeenCalledWith('ctaColor', '#FF5733');
    expect(w.set).toHaveBeenCalledWith('ctaTextColor', '#123456');
    expect(w.set).toHaveBeenCalledWith('textColor', '#EEEEEE');
    expect(w.set).toHaveBeenCalledWith('bgColor', '#1A1A2E');
  });

  it('sets the matching field when a single suggested swatch is clicked', async () => {
    mockedPalette.mockReturnValue({ data: palette, isLoading: false } as never);
    const w = makeW();
    render(<BannerThemeColors w={w} />);

    await userEvent.click(screen.getByRole('button', { name: /Use CTA Text color/i }));
    expect(w.set).toHaveBeenCalledWith('ctaTextColor', '#123456');
  });

  it('skips palette swatches whose colour is not a valid hex', () => {
    mockedPalette.mockReturnValue({
      data: { ...palette, cta_button_text_color: '' },
      isLoading: false,
    } as never);
    render(<BannerThemeColors w={makeW()} />);

    // The "CTA Button Text Color" field label still renders, but the swatch for
    // the empty CTA Text suggestion is filtered out.
    expect(screen.queryByRole('button', { name: /Use CTA Text color/i })).not.toBeInTheDocument();
  });
});
