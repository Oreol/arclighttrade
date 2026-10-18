<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Keep the shared desk context and consumer hook in a non-component module; provider and every page import that module so Fast Refresh cannot replace context identity independently of the mounted provider.
- Use a shared application provider for reactive academy, signals, and execution state across file-based routes; persist signed-in user data through owner-scoped Cloud tables.
- Embed the official TradingView Advanced Chart after hydration and remount by asset; keep external analysis quotes separate from the shared REST execution state so chart loading never blocks trading.
- Keep pending orders in the owner-scoped account JSON column and execute fills, margin reservations, and liquidations through shared pure trading helpers so all routes observe the same settlement.
- Cross margin thresholds include free account capital; settlement losses remain capped at each position allocation to honor the evaluation loss rule.
- Restrict administrative writes and analytics through database role policies; hiding navigation is not an authorization boundary.
- Keep news scenarios in a shared preset catalog; authenticate news interpretation server functions, keep gateway helpers server-only, and resolve desk/lesson links from the user's accessible live catalog to avoid invented setups.
- Persist terminal AI provider access blocks in the service-only access table and fail closed when the block cannot be checked; clear blocks only after access is restored.
- Cache a single global outlook by UTC day; atomically claim the day before generation, preserve failed/paused attempts without automatic replay, and allow only server-owned cache writes to prevent duplicate billing across users and reloads.

- Store trade reflections inside the existing owner-scoped account history JSON alongside settled trades so journal entries stay synchronized without a second trade ledger.
- Quote state includes source and last successful timestamp; initialize positive offline references and preserve last good values across feed failures so reference execution never depends on network availability.
- Generate synthetic leaderboard peers in a dedicated deterministic catalog; fixed modeled personal placement is explicitly separate from real personal history metrics to avoid presenting a fabricated live competition.
