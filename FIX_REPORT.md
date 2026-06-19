# Fix Report — Code Review Remediation

**Date:** 2026-06-17
**Scope:** Apply all High / Medium / Low findings from the code review.
**Branch:** `suvesh` (note: a git rebase was in progress when this work was done; these are working-tree changes, not yet committed).

---

## 1. Summary

| ID | Severity | Finding | Status |
|----|----------|---------|--------|
| H1 | High | CSV / formula injection in "Viewed by" export | ✅ Fixed |
| M1 | Medium | RA could silently lose send-permissions after reload | ✅ Fixed (semantic) — see remaining risk |
| M2 | Medium | Communities without sub-communities never load messages | ⚠️ Partially fixed — backend contract needed (see §4) |
| M3 | Medium | Unhandled promise rejection in attachment download | ✅ Fixed |
| M4 | Medium | `decodeJwt` corrupted non-ASCII claims / ignored padding | ✅ Fixed |
| M5 | Medium | `useMessageStats` not guarded to backend ids | ✅ Fixed |
| M6 | Medium | `pinnedItems` rebuilt every render | ✅ Fixed |
| L1 | Low | Dead Redux reducers + helper | ✅ Removed (references verified) |
| L2 | Low | `serializableCheck: false` no longer needed | ✅ Restored default |
| L3 | Low | Clickable-div a11y on viewer/preview backdrops | ✅ Addressed (Escape + labelled close documented) |
| L4 | Low | Low-contrast text | ◐ Targeted fix (bundle input placeholder); broader pass deferred (see §4) |
| L5 | Low | Unlabeled bundle-name input | ✅ Fixed |
| L6 | Low | Silent empty `API_BASE_URL` | ✅ Fixed |
| L7 | Low | `linkifyHtml` URL interpolation | ✅ Hardened with explicit security-contract comment |

---

## 2. Files Changed

| File | Findings | Lines |
|------|----------|-------|
| `src/modules/dashboard/components/ViewedByPanel.tsx` | H1 | +27 / -2 |
| `src/modules/auth/components/AuthBootstrap.tsx` | M1 | +8 / -1 |
| `src/modules/dashboard/hooks/useDashboard.ts` | M2, M6 | +27 / -11 |
| `src/modules/dashboard/components/FileViewer.tsx` | M3, L3 | +32 / -11 |
| `src/lib/jwt.ts` | M4 | +12 / -3 |
| `src/modules/dashboard/hooks/useMessageStats.ts` | M5 | +5 / -1 |
| `src/store/slices/messageSlice.ts` | L1 | -81 (net) |
| `src/store/index.ts` | L2 | +4 / -4 |
| `src/modules/dashboard/components/MessageComposer.tsx` | L4, L5 | +2 / -1 |
| `src/config/env.ts` | L6 | +9 |
| `src/lib/extractLinks.ts` | L7 | +8 / -2 |

No new files added other than this report. No production dependencies changed.

---

## 3. Diffs

### H1 — `ViewedByPanel.tsx` (CSV/formula injection)
```diff
+// Escape a value for safe inclusion in a CSV cell. Names/emails are
+// subscriber-controlled, so without this an export is open to two problems:
+//   1. CSV/formula injection — a value starting with = + - @ (or tab/CR) is
+//      executed as a formula when the file is opened in Excel/Sheets. We prefix
+//      it with a single quote so the spreadsheet treats it as text.
+//   2. Field/row corruption — values containing , " or newlines break the
+//      column layout. We wrap every field in quotes and double internal quotes.
+const csvCell = (value: string | null | undefined): string => {
+  const s = String(value ?? '');
+  const guarded = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
+  return `"${guarded.replace(/"/g, '""')}"`;
+};
+
+// UTF-8 byte-order mark ... Built from its code point to keep the source ASCII-only.
+const BOM = String.fromCharCode(0xfeff);
...
-              ...filteredViewers.map((v) => `${v.name},${v.email},${formatSeenAt(v.seen_at)}`),
-            ].join('\n');
-            const blob = new Blob([csv], { type: 'text/csv' });
+              ...filteredViewers.map((v) =>
+                [csvCell(v.name), csvCell(v.email), csvCell(formatSeenAt(v.seen_at))].join(',')
+              ),
+            ].join('\r\n');
+            const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
```

### M1 — `AuthBootstrap.tsx` (incomplete-profile signal)
```diff
-    assignedCommunities: [],
+    // The refresh JWT carries no community assignments, so this profile is
+    // incomplete. Leave it `undefined` ("unknown") rather than `[]` ("none").
+    // All consumers coalesce with `?? []`, so behaviour is unchanged today, but
+    // the value now honestly signals a missing assignment list.
+    assignedCommunities: undefined,
```

### M2 + M6 — `useDashboard.ts` (consistent chat key + memoized pinned items)
```diff
+  // Mirror the fetched messages into the store under the SAME key the feed reads
+  // from (`activeChatId`), so the write key and read key can never diverge.
   useEffect(() => {
-    if (fetchedMessages && selectedSubCommunityId) {
+    if (fetchedMessages && activeChatId) {
       dispatch(
         setMessages({
-          chatId: selectedSubCommunityId,
+          chatId: activeChatId,
           messages: fetchedMessages.map((m) => { ... }),
         })
       );
     }
-  }, [fetchedMessages, selectedSubCommunityId, typeNameById, pinnedIdSet, dispatch]);
+  }, [fetchedMessages, activeChatId, typeNameById, pinnedIdSet, dispatch]);

-  const pinnedItems = (pinnedData ?? []).map((p) => ({
-    id: p.message_id,
-    preview: messagePreview(p.message ?? ''),
-  }));
+  const pinnedItems = useMemo(
+    () => (pinnedData ?? []).map((p) => ({ id: p.message_id, preview: messagePreview(p.message ?? '') })),
+    [pinnedData]
+  );
```

### M3 + L3 — `FileViewer.tsx` (download error handling)
```diff
+import { toast } from 'react-hot-toast';
...
-    const blob = await (await fetch(attachment.url)).blob();
-    const objectUrl = URL.createObjectURL(blob);
-    ... link.click(); document.body.removeChild(link); URL.revokeObjectURL(objectUrl);
+    let objectUrl: string | null = null;
+    try {
+      const blob = await (await fetch(attachment.url)).blob();
+      objectUrl = URL.createObjectURL(blob);
+      ... link.click(); document.body.removeChild(link);
+    } catch {
+      toast.error('Could not download the file. Please try again.');
+    } finally {
+      if (objectUrl) URL.revokeObjectURL(objectUrl);
+    }
```

### M4 — `jwt.ts` (UTF-8 + base64url padding)
```diff
-    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
+    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
+    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
+    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
+    const json = new TextDecoder().decode(bytes);
```

### M5 — `useMessageStats.ts` (guard to backend ids)
```diff
+  const isServerId = !!messageId && !messageId.startsWith('msg-');
   return useQuery({
     ...
-    enabled: Boolean(messageId) && enabled,
+    enabled: isServerId && enabled,
   });
```

### L1 — `messageSlice.ts` (remove dead code)
Removed: `formatNow()` helper and the `sendMessage`, `sendFileMessage`, `togglePin`, `updateMessageStatus` reducers. Exports reduced to the two actions actually consumed (`setMessages`, `setPinned`).
```diff
-export const { setMessages, sendMessage, sendFileMessage, togglePin, setPinned, updateMessageStatus } = messageSlice.actions;
+export const { setMessages, setPinned } = messageSlice.actions;
```
**Reference verification:** `grep` across `src/` confirmed the four removed actions and `formatNow` had no importers outside the slice; `setMessages`/`setPinned` are used in `useDashboard.ts`. The feed is driven by TanStack Query + `setMessages`/`setPinned`, so the optimistic-update reducers were genuinely dead.

### L2 — `store/index.ts` (restore serializability check)
```diff
-  middleware: (getDefaultMiddleware) =>
-    getDefaultMiddleware({ serializableCheck: false }),
+  // All slices hold only serializable data, so the default middleware is kept.
```
Verified all four slices (`auth`, `community`, `messages`, `tradeJournal`) store only strings/numbers/plain objects after L1.

### L4 + L5 — `MessageComposer.tsx`
```diff
-                  placeholder="Bundle name (optional)"
-                  className="... placeholder:text-slate-300 ..."
+                  placeholder="Bundle name (optional)"
+                  aria-label="Bundle name"
+                  className="... placeholder:text-slate-400 ..."
```

### L6 — `config/env.ts`
```diff
+if (!API_BASE_URL && process.env.NODE_ENV !== 'production') {
+  console.warn('[env] NEXT_PUBLIC_API_BASE_URL is not set; API calls will resolve relative to the app origin.');
+}
```

### L7 — `extractLinks.ts`
Added an explicit SECURITY CONTRACT comment to `linkifyHtml` documenting the two invariants (URL regex excludes quotes/`<>`; output must always pass through `sanitizeHtml`).

---

## 4. Validation Results

All commands run from the repo root on the post-change working tree.

| Command | Result |
|---------|--------|
| `npm run lint` (`eslint`) | ✅ **PASS** — exit 0, no warnings/errors |
| `npx tsc --noEmit` | ✅ **PASS** — exit 0 |
| `npm run build` (`next build`, Next 16.2.6 / Turbopack) | ✅ **PASS** — exit 0; compiled in ~14.7s, all 10 routes generated |

Build route output (all static, unchanged from before):
```
○  /            ○  /banner        ○  /dashboard     ○  /login
○  /_not-found  ○  /trade-feedback ○  /trade-journal ○  /verify-otp
```

---

## 5. Remaining Risks

1. **M2 (communities without sub-communities) is only partially addressed.**
   I aligned the store write-key with the read-key (`activeChatId`) so they cannot diverge, but **did not** change the data-fetch contract. `useMessages` still requires both a community id and a sub-community id, so a community that has *zero* sub-communities still shows an empty feed and no composer.
   The full fix requires sending the community id as the chat target to `get-messages`/`send-message`, and **the backend's behaviour for community-only chats is not verifiable from the frontend.** Fabricating a `sub_community_id` could produce malformed requests. **Action needed:** confirm with the backend team whether community-only chats exist and what params `get-messages`/`send-message` expect for them; then either wire it up or delete the now-misleading `?? selectedCommunityId` fallbacks.

2. **M1 is a semantic/type-honesty fix, not a behavioural recovery.**
   Setting `assignedCommunities: undefined` correctly signals "unknown" instead of "none", but because all consumers coalesce with `?? []`, an RA whose `localStorage` user record is missing while the session token is still valid will **still** be unable to send until the next full login. A complete fix needs a backend **GET profile** endpoint to re-fetch assignments after a silent refresh; none currently exists in `auth.service.ts`. **Action needed:** add a profile endpoint and call it from `AuthBootstrap` when the recovered profile is incomplete.

3. **L4 (contrast) is only partially addressed.**
   I fixed the most concrete instance (bundle-name placeholder `slate-300 → slate-400`). A number of `text-slate-400`/`text-slate-300` meta labels at 9–11px across `ChatFeed.tsx`, `TradeCard.tsx`, and `MessageComposer.tsx` still fall below WCAG AA 4.5:1. A broader recolor is a **design decision** (it changes the visual language) and was intentionally not done unilaterally. **Action needed:** design review to agree on accessible meta-text tokens.

4. **Pre-existing repository state.**
   A `git rebase` was in progress and `CreatePollModal.tsx` carries unrelated uncommitted edits from before this review. These changes were **not** touched. Validation ran against the combined working tree (all green), but the rebase should be completed/aborted before committing these fixes.

5. **No automated test coverage was added.**
   The repo has Jest configured but no tests exercise the changed paths (CSV escaping, JWT decode, download error handling). The fixes were validated via lint/typecheck/build and code review only. **Recommended:** add unit tests for `csvCell`, `decodeJwt` (UTF-8 + padding), and `useMessageStats` id-guarding.
