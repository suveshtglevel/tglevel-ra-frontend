import { mapUserJournalToRow } from '@/modules/trade-journal/constants/customerTradeJournalData';
import type { BackendUserTradeJournal } from '@/modules/trade-journal/services/tradeJournals.service';

const baseJournal: BackendUserTradeJournal = {
  _id: '6a216f0e8a438d20983c2d13',
  user_id: 'usr_4ea4e43c-769d-4a96-9a10-9aa3164b46be',
  user_name: '8097191043',
  phone_number: '8097191043',
  entry: 2350,
  exit: 2500,
  qty: 500,
  points: 150,
  pnl: 75000,
  trade_date: '2026-06-04T12:26:54.449Z',
};

describe('mapUserJournalToRow', () => {
  it('maps the API fields onto the table row shape', () => {
    const row = mapUserJournalToRow(baseJournal);
    expect(row).toMatchObject({
      id: '6a216f0e8a438d20983c2d13',
      name: '8097191043',
      mobile: '8097191043',
      entry: 2350,
      exit: 2500,
      qty: 500,
      points: 150,
      pnl: 75000,
    });
  });

  it('slices the trade_date down to a yyyy-mm-dd string', () => {
    expect(mapUserJournalToRow(baseJournal).date).toBe('2026-06-04');
  });

  it('falls back to the phone number, then "Unknown", for a missing name', () => {
    const noName = mapUserJournalToRow({ ...baseJournal, user_name: '' });
    expect(noName.name).toBe('8097191043');

    const nothing = mapUserJournalToRow({ ...baseJournal, user_name: '', phone_number: undefined });
    expect(nothing.name).toBe('Unknown');
    expect(nothing.mobile).toBe('—');
  });

  it('assigns the same avatar colour for the same user across calls', () => {
    const a = mapUserJournalToRow(baseJournal);
    const b = mapUserJournalToRow({ ...baseJournal, _id: 'different-id' });
    // Colour is keyed off user_id, so it stays stable even when _id changes.
    expect(a.avatarColor).toBe(b.avatarColor);
  });
});
