# Arclighttrade

Build a high-end, institutional-grade Forex/Commodities Academy & Trading Terminal named "Arclight Academy" for mobile and desktop views.

DESIGN & STYLING SYSTEM (EXACT VAULTA ELECTRIC ROYAL BLUE PALETTE — ZERO NEON GREEN):
1. BASE THEME: Deep Dark Navy/Charcoal background (`#050814`), NOT pure pitch black and NOT light mode.
2. HERO & CARD ACCENTS: Electric Royal Blue / Cobalt gradient (`#2563EB` fading into `#3B82F6`) with frosted glassmorphic overlays and soft ice-blue ambient light glows (`#60A5FA`).
3. QUICK ACTION BUTTONS: Vibrant solid Electric Blue circular icon buttons (`#2563EB`) with crisp white icons.
4. TYPOGRAPHY: High-contrast white for primary numbers/titles, soft ice-blue (`#93C5FD`) for secondary labels/subtitles.
5. ACCENTS: Electric Blue / Cyan (`#2563EB` / `#3B82F6` / `#60A5FA`) for primary actions, active tabs, and positive indicators. Coral Red (`#EF4444`) strictly for Shorts/Invalidations/Stop Loss. ABSOLUTELY NO NEON GREEN anywhere in the UI.
6. COPY & TONE: Institutional private trading desk style. Strictly no hype, gambling aesthetics, or amateur language like "demo", "fake money", or "no risk". Use serious terminology: Simulated Evaluation Capital, Prop Evaluation Desk, Execution Sandbox, Alpha Briefs.

PLATFORM ARCHITECTURE & NAVIGATION:
1. Shell Navigation: Sleek mobile bottom dock bar and desktop glass sidebar with tabs: Dashboard, Academy, Signals, Paper Desk, and Settings.
2. Dashboard (Homepage - Ultra Scannable, Zero Clutter):
   - BLUE HERO CARD: Large balance display "$10,000.00" labelled "Simulated Evaluation Capital", greeting "Good evening, Oyeniran", and session indicator tag "London Session · Active" inside a smooth electric blue gradient glass card.
   - QUICK ACTIONS (4-Icon Grid Bar): Tappable circular action buttons for [ New Trade ] (routes to /paper-desk), [ Signals ] (routes to /signals), [ Academy ] (routes to /academy), and [ Ranks ] (opens leaderboard modal/drawer).
   - DYNAMIC PROGRESS STATUS CARD: Interactive progress card that evaluates completion state. If low (<30%), shows encouragement ("Pace is slow — take a lesson today to build momentum"). If high (>60%), shows commendation ("Strong momentum — complete Module 4 next"). Includes a working [ Resume Lesson ] CTA routing to /academy.
   - ACTIVE SETUPS CAROUSEL: Horizontal scrollable row displaying active signal setup cards (XAU/USD, EUR/USD, GBP/USD) with blue status badges and coral red invalidations.
   - RECENT ACTIVITY STREAM: Minimal list showing recent trade logs and signal alerts.
   - NO embedded charts or execution order tickets on the Dashboard view.

3. Paper Desk (/paper-desk):
   - Primary Asset Focus: Forex Majors (EUR/USD, GBP/USD, USD/JPY) and Gold (XAU/USD) primary, Crypto (BTC, ETH, SOL) secondary.
   - Interactive Chart: TradingView dark technical analysis widget with symbol search and quick-select presets (Gold XAU/USD, EUR/USD, GBP/USD, USD/JPY, BTC, ETH, SOL).
   - Lightweight Execution Engine: Fast reference ticker engine for all assets. When a user clicks Buy/Sell, it MUST capture the current price instantly with zero lag or loading screens.
   - Order Execution Ticket: Dollar-based entry with percentage allocation buttons (25%, 50%, 75%, 100%), Long/Short execution at instant prices, Take Profit / Stop Loss inputs.
   - Active Positions Dock: Dynamic floating PnL calculated on every price tick: (Mark Price - Entry Price) * Units. One-click manual close and SL/TP triggers.

4. Signals Tab (/signals):
   - Institutional trade tickets featuring: Asset, bias (LONG / SHORT), Entry Zone, Invalidation / SL, and tiered targets (TP1, TP2, TP3).
   - Distinguishes Free Daily Signals vs. Locked Premium Subscriber Signals.

5. Academy Tab (/academy):
   - Multi-tiered curriculum modules (Foundations, Technical Analysis, Smart Money Concepts / Order Flow).
   - Video playback container, lesson checklists, and dynamic progress state tracking that synchronizes with the Dashboard momentum card.

6. God Mode Admin Desk (/admin):
   - Hidden from public student navigation bar.
   - Revenue Hub: MRR, ARR, and subscriber analytics.
   - Rapid Signal Broadcaster: Form to post setups directly to the student app (updating the signals feed and dashboard setups carousel).
   - Student Performance Radar: Leaderboard ranking students by discipline score, win rate, and drawdown.

TECHNICAL INSTRUCTIONS:
- Zero hardcoded static arrays for dynamic state: use clean state management so signals, positions, curriculum progress, and account metrics update interactively across the application.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://arclighttrade.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1569ec66-fdfc-42fd-8231-139f42033fc2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
