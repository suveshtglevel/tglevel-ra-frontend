// In-memory access token. Kept out of cookies/localStorage on purpose: the
// short-lived access token lives only for the session (defends against XSS
// token theft). It is cleared on logout/401 and lost on full reload — the
// refresh token cookie is what re-establishes a session.
let accessToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};
