import { get, post } from './client';
import {
  OverviewResponse,
  DetailResponse,
  FlowResponse,
  MarketCapListResponse,
  MarketCapSummaryResponse,
} from '../types/marketDashboard';

export async function getDashboardOverview(): Promise<OverviewResponse> {
  try {
    return await get<OverviewResponse>('/api/macro/dashboard/overview');
  } catch (error) {
    console.error('Failed to fetch dashboard overview:', error);
    return { success: false, data: { categories: [] } };
  }
}

export async function getValuationDetail(limit = 52): Promise<DetailResponse> {
  try {
    return await get<DetailResponse>('/api/macro/dashboard/valuation', {
      params: { limit },
    });
  } catch (error) {
    console.error('Failed to fetch valuation detail:', error);
    return { success: false, data: { category: 'valuation', question: '', signal: 'neutral', signal_label: '', indicators: [] } };
  }
}

export async function getLiquidityDetail(limit = 52): Promise<DetailResponse> {
  try {
    return await get<DetailResponse>('/api/macro/dashboard/liquidity', {
      params: { limit },
    });
  } catch (error) {
    console.error('Failed to fetch liquidity detail:', error);
    return { success: false, data: { category: 'liquidity', question: '', signal: 'neutral', signal_label: '', indicators: [] } };
  }
}

export async function getFlowDetail(): Promise<FlowResponse> {
  try {
    return await get<FlowResponse>('/api/macro/dashboard/flow');
  } catch (error) {
    console.error('Failed to fetch flow detail:', error);
    return { success: false, data: { category: 'flow', question: '', signal: 'neutral', signal_label: '', indicators: [], sectors: [], style_comparisons: [] } };
  }
}

/* ─── Market Cap (Treemap) ─── */

export async function getMarketCapList(assetType?: string, limit = 200): Promise<MarketCapListResponse> {
  try {
    const params: Record<string, any> = { limit };
    if (assetType) params.asset_type = assetType;
    return await get<MarketCapListResponse>('/api/macro/marketcap', { params });
  } catch (error) {
    console.error('Failed to fetch market cap list:', error);
    return { success: false, data: [], total: 0 };
  }
}

/* ─── AI Interpretation ─── */

export interface MacroKeySignal {
  category: string;
  indicator_id: string;
  indicator_name: string;
  level: 'high' | 'medium' | 'low';
  comment: string;
}

export interface MacroInterpretationPayload {
  overview: string;
  valuation_reading: string;
  liquidity_reading: string;
  flow_reading: string;
  key_signals: MacroKeySignal[];
  vs_yesterday: string | null;
  watchpoints: string[];
}

export interface MacroInterpretation {
  id: string;
  as_of_date: string; // YYYY-MM-DD
  payload: MacroInterpretationPayload;
  dashboard_snapshot: { categories?: any[] };
  provider: string;
  model: string;
  latency_ms: number | null;
  source_tag: string | null;
  created_at: string;
}

export interface InterpretationResponse {
  today: MacroInterpretation | null;
  previous: MacroInterpretation | null;
}

export async function getInterpretation(): Promise<InterpretationResponse> {
  try {
    return await get<InterpretationResponse>('/api/macro/dashboard/interpretation');
  } catch (error) {
    console.error('Failed to fetch interpretation:', error);
    return { today: null, previous: null };
  }
}

export async function generateInterpretation(force = false): Promise<MacroInterpretation | null> {
  try {
    const res = await post<{ status: string; interpretation: MacroInterpretation }>(
      `/api/macro/dashboard/interpretation/generate${force ? '?force=true' : ''}`,
      {},
    );
    return res.interpretation;
  } catch (error) {
    console.error('Failed to generate interpretation:', error);
    return null;
  }
}

export async function getMarketCapSummary(): Promise<MarketCapSummaryResponse> {
  try {
    return await get<MarketCapSummaryResponse>('/api/macro/marketcap/summary');
  } catch (error) {
    console.error('Failed to fetch market cap summary:', error);
    return { success: false, data: { by_type: {}, total_assets: 0, data_date: null } };
  }
}
