import type {Asset} from './trading';
export const tradingViewSymbols:Record<Asset,string>={
 'XAU/USD':'OANDA:XAUUSD','EUR/USD':'OANDA:EURUSD','GBP/USD':'OANDA:GBPUSD','USD/JPY':'OANDA:USDJPY',
 BTC:'BINANCE:BTCUSDT',ETH:'BINANCE:ETHUSDT',SOL:'BINANCE:SOLUSDT'
};
export const chartIntervals=['1','5','15','60','240','D'] as const;