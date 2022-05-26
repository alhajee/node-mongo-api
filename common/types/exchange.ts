export type Exchange = {
  id: string;
  name: string;
  accountId: string;
  apiKey?: string;
  apiSecret?: string;
  config?: TradeConfig[];
};

export type TradeConfig = {};
