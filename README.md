# Golden Bullet

A browser-local challenge tracker and Monte Carlo scenario tool.

## Run locally

Serve the directory with any static HTTP server; no build or dependency installation is required.

```sh
python3 -m http.server 8000
```

## Quality checks

Tests require Node.js 22+.

```sh
node --test tests/*.test.cjs
```

## Behavior and assumptions

- Simulation reports pass, drawdown breach, and unfinished outcomes separately over a 500-trade horizon.
- Terminal states are checked before taking another simulated trade.
- Existing risk escalation and sizing formulas are preserved; regression tests enforce hard-cap, daily-budget, and drawdown constraints.
- Outcome percentages split winning trade outcomes; they do not represent partial position sizes.
- The simulation uses independent outcomes, no fees/slippage, loss-only daily accumulation, and a synthetic daily reset near the budget limit. Trailing drawdown uses each trade's high balance, not end-of-day equity.
- Personal session hours and daily stop rules are not enforced by this model. Suggested risk is a model estimate.
- Trade history can be backed up to JSON, restored after confirmation, or exported to CSV. Restore validates before changing state and reconstructs balances from trades.
- State uses the existing `goldenBullet:v1` storage key. Backups contain your notes and trade data; keep them private. Browser data is not synced between devices.
- Chart.js is loaded from its pinned CDN URL. If unavailable, numerical results remain accessible and the chart shows a status message.

## Release checks

Before merging, verify desktop and 390px mobile layouts, keyboard focus, reload recovery or result freshness, and any changed data import/export flow. CI runs on pull requests and pushes to main. Production publishing remains separate from PR validation.
