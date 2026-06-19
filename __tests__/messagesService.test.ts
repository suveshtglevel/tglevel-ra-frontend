import axiosInstance from '@/services/axios';
import {
  sendMessage,
  getMessages,
  getMessageTypes,
} from '@/components/dashboard/services/messages.service';

jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

// Mock the markdown helpers so the service tests stay focused on request shaping
// and we can assert the conversion is actually applied (not on the conversion
// rules themselves, which have their own coverage).
jest.mock('@/lib/whatsappMarkdown', () => ({
  htmlToWhatsApp: jest.fn((html: string) => `wa:${html}`),
  whatsappToHtml: jest.fn((wa: string) => `html:${wa}`),
  looksLikeHtml: jest.fn((s: string) => s.startsWith('<')),
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

const field = (mock: jest.Mock, name: string): string | null => {
  const form = mock.mock.calls[0][1] as FormData;
  const v = form.get(name);
  return typeof v === 'string' ? v : null;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('sendMessage', () => {
  const base = {
    community_id: 'com_1',
    sub_community_id: 'sub_1',
    type: 3,
  };

  it('serializes core fields and runs content through htmlToWhatsApp', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: { _id: 'm1' } },
    } as never);

    await sendMessage({ ...base, content: '<strong>hi</strong>' });

    const mock = mockedAxios.post as jest.Mock;
    expect(field(mock, 'community_id')).toBe('com_1');
    expect(field(mock, 'sub_community_id')).toBe('sub_1');
    expect(field(mock, 'type')).toBe('3');
    expect(field(mock, 'content')).toBe('wa:<strong>hi</strong>');
    // notification defaults to false when not provided.
    expect(field(mock, 'notification_sent')).toBe('false');
    // The multipart Content-Type is cleared so the browser sets the boundary.
    expect(mock.mock.calls[0][2]).toEqual({ headers: { 'Content-Type': null } });
  });

  it('converts an empty content to an empty string before sending', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: { _id: 'm1' } },
    } as never);

    await sendMessage({ ...base });
    expect(field(mockedAxios.post as jest.Mock, 'content')).toBe('wa:');
  });

  it('appends parent_message_id, images and docs only when present', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: { _id: 'm1' } },
    } as never);

    const imageFile = new File(['i'], 'a.png', { type: 'image/png' });
    const docFile = new File(['d'], 'a.pdf', { type: 'application/pdf' });
    await sendMessage({
      ...base,
      parent_message_id: 'msg_parent',
      notification_sent: true,
      imageFile,
      docFile,
    });

    const form = (mockedAxios.post as jest.Mock).mock.calls[0][1] as FormData;
    expect(form.get('parent_message_id')).toBe('msg_parent');
    expect(form.get('notification_sent')).toBe('true');
    expect(form.get('images')).toBe(imageFile);
    expect(form.get('docs')).toBe(docFile);
  });

  it('returns the inner data object on success', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: { _id: 'm99', content: 'x' } },
    } as never);

    const sent = await sendMessage({ ...base });
    expect(sent._id).toBe('m99');
  });

  it('throws when the backend reports failure', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: false, message: 'Blocked' },
    } as never);
    await expect(sendMessage({ ...base })).rejects.toThrow('Blocked');
  });
});

describe('getMessages', () => {
  it('forwards the community params and converts markdown content to HTML', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        messages: [
          { message_id: '1', community_id: 'com_1', content: '*bold*' },
          { message_id: '2', community_id: 'com_1', content: '<p>legacy</p>' },
        ],
      },
    } as never);

    const msgs = await getMessages('com_1', 'sub_1');

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/messages/get-messages', {
      params: { community_id: 'com_1', sub_community_id: 'sub_1' },
    });
    // Markdown content gets converted...
    expect(msgs[0].content).toBe('html:*bold*');
    // ...but content that already looks like HTML is left untouched.
    expect(msgs[1].content).toBe('<p>legacy</p>');
  });

  it('returns an empty array when messages is missing', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { success: true } } as never);
    await expect(getMessages('c', 's')).resolves.toEqual([]);
  });

  it('throws when success is false', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { success: false } } as never);
    await expect(getMessages('c', 's')).rejects.toThrow('Failed to load messages');
  });
});

describe('getMessageTypes', () => {
  it('normalizes the assorted backend field aliases into a stable shape', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [
          { _id: 'a', message_type_id: '3', name: 'Follow-up' },
          { id: 5, label: 'Alert' },
        ],
      },
    } as never);

    const types = await getMessageTypes();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/messages/types');
    expect(types[0]).toEqual({ _id: 'a', id: 3, name: 'Follow-up' });
    // Falls back to the numeric code for _id and to `label` for the name.
    expect(types[1]).toEqual({ _id: '5', id: 5, name: 'Alert' });
  });

  it('synthesizes a unique key and name when the backend omits everything', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, data: [{}] },
    } as never);

    const types = await getMessageTypes();
    expect(types[0]._id).toBe('0');
    expect(types[0].name).toBe('Type 1');
    expect(Number.isNaN(types[0].id)).toBe(true);
  });

  it('throws when success is false', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { success: false } } as never);
    await expect(getMessageTypes()).rejects.toThrow('Failed to load message types');
  });
});
