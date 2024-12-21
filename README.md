# Hash Perp

## Overview
A decentralized perp,LP comes from HypherIndex, Open and transparent, Support decentralized liquidation

Isolated Margin Mode

The isolated margin mode depicts the margin placed into a position isolated from the trader's account balance. This mode allows traders to manage their risks accordingly as the maximum amount a trader would lose from liquidation is limited to the position margin placed for that open position.

## Formulas

### For Buy/Long:
```
Liquidation Price (Long) = Entry Price - [(Initial Margin - Maintenance Margin) / Position Size] - (Extra Margin Added / Position Size)
```

### For Sell/Short:
```
Liquidation Price (Short) = Entry Price + [(Initial Margin - Maintenance Margin) / Position Size] + (Extra Margin Added / Position Size)
```

### Notes:
- **Position Value** = Contract Size × Entry Price
- **Initial Margin (IM)** = Position Value / Leverage
- **Maintenance Margin (MM)** = (Position Value × MMR) - Maintenance Margin Deduction
- The Maintenance Margin Rate (MMR) is based on the risk limit tier. For more details please refer to Maintenance Margin (USDT Contracts).

## Examples

### Example 1 (Long):
Trader A placed a long entry of 1 BTC at 20,000 USDT with 50x leverage. Assuming the Maintenance Margin Rate (MMR) is 0.5% and no extra margin is added:

- **Initial Margin** = 1 × 20,000 USDT / 50 = 400 USDT
- **Maintenance Margin** = 1 × 20,000 × 0.5% - 0 = 100 USDT
- **Liquidation Price (LP)** = 20,000 USDT - (400 - 100) = 19,700 USDT

### Example 2 (Short):
Trader B initially placed a short entry of 1 BTC at 20,000 USDT with 50x leverage. Subsequently, he manually added 3,000 USDT more to his position margin. The new Liquidation Price after the margin is added will be calculated as follows:

- **Initial Margin** = 1 × 20,000 USDT / 50 = 400 USDT
- **MMR** = 0.5%
- **Maintenance Margin** = 1 × 20,000 × 0.5% - 0 = 100 USDT
- **Liquidation Price (LP)** = [20,000 USDT + (400 - 100)] + (3,000 / 1) = 23,300 USDT

### Example 3 (Long, funding fee deducted from position margin):
Trader placed a long position of 1 BTC at 20,000 USDT with 50x leverage. The Initial Liquidation Price is 19,700 USDT (refer to Example 1 above). However, the trader has incurred 200 USDT in funding fees and he has insufficient available balance to cover the funding fees.

When traders have insufficient available balance to cover the funding fees, the funding fees will be deducted from the position margin. Therefore, the decrease in position margin will then move the Liquidation Price nearer to the Mark Price, making the position more prone to be liquidated.

- **Initial Margin** = 1 × 20,000 USDT / 50 = 400 USDT
- **MMR** = 0.5%
- **Maintenance Margin** = 1 × 20,000 × 0.5% - 0 = 100 USDT
- **Liquidation Price (LP)** = [20,000 - (400 - 100)] - (-200 / 1) = 19,900 USDT

## Tech Stack
- Backend: Solidity

## Demo
- Demo Video: https://youtube.com/watch?v=...
- Project Deck: https://docs.google.com/presentation/d/...

## Team
- Zisu - Full Stack Developer