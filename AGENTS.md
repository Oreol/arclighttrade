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
- Use a shared application provider for reactive academy, signals, and execution state across file-based routes; persist signed-in user data through owner-scoped Cloud tables.
- Keep simulation prices independent from the embedded TradingView chart and label them as reference prices, because the chart is not an execution feed.
- Restrict administrative writes and analytics through database role policies; hiding navigation is not an authorization boundary.
