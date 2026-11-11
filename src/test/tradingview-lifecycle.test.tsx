import {act,cleanup,render,screen,fireEvent} from '@testing-library/react';
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {TradingViewChart} from '@/features/tradingview-chart';
describe('TradingView initialization',()=>{
 beforeEach(()=>{vi.useFakeTimers();vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue(null);});
 afterEach(()=>{cleanup();vi.restoreAllMocks();vi.useRealTimers();});
 it('preserves the widget on parent quote rerenders and reloads only for changed asset or timeframe',()=>{const view=render(<TradingViewChart asset="BTC"/>);const script=view.container.querySelector('script');view.rerender(<TradingViewChart asset="BTC"/>);expect(view.container.querySelector('script')).toBe(script);view.rerender(<TradingViewChart asset="ETH"/>);expect(view.container.querySelector('script')).not.toBe(script);expect(screen.queryByRole('button',{name:'5m'})).toBeNull();});
 it('keeps the widget alive when the Paper Desk slot unmounts',async()=>{const {PersistentCharts}=await import('@/features/tradingview-chart');const {chartHost}=await import('@/features/chart-host');render(<PersistentCharts/>);const slot=document.createElement('div');document.body.append(slot);act(()=>chartHost.set({asset:'BTC',slot}));const script=document.body.querySelector('.persistent-chart script');expect(script).not.toBeNull();act(()=>chartHost.set({slot:null}));expect(document.body.querySelector('.persistent-chart script')).toBe(script);act(()=>chartHost.set({slot}));expect(document.body.querySelector('.persistent-chart script')).toBe(script);});
 it('stops loading when the inserted iframe loads',async()=>{const view=render(<TradingViewChart asset="BTC"/>);const host=view.container.querySelector('.tradingview-widget-container');if(!host)throw new Error('Missing host');const frame=document.createElement('iframe');await act(async()=>{host.append(frame);});act(()=>frame.dispatchEvent(new Event('load')));expect(screen.queryByRole('status')).toBeNull();act(()=>vi.advanceTimersByTime(15000));expect(screen.queryByRole('alert')).toBeNull();});
 it('preserves the exact iframe across analysis expansion and restores scroll on exit',async()=>{
  const {PersistentCharts}=await import('@/features/tradingview-chart');const {chartHost}=await import('@/features/chart-host');
  vi.spyOn(window,'scrollTo').mockImplementation(()=>{});
  const slot=document.createElement('div');document.body.append(slot);document.body.style.overflow='auto';
  act(()=>chartHost.set({asset:'BTC',slot,expanded:false}));render(<PersistentCharts/>);
  const host=document.body.querySelector('.persistent-chart .tradingview-widget-container');if(!host)throw new Error('Missing chart');
  const frame=document.createElement('iframe');await act(async()=>host.append(frame));
  act(()=>chartHost.set({expanded:true}));expect(document.body.style.overflow).toBe('hidden');expect(document.body.querySelector('.persistent-chart iframe')).toBe(frame);
  fireEvent.click(screen.getByRole('button',{name:'Exit Chart'}));expect(document.body.style.overflow).toBe('auto');expect(document.body.querySelector('.persistent-chart iframe')).toBe(frame);
  act(()=>chartHost.set({slot:null,expanded:false}));slot.remove();document.body.style.overflow='';
 });
 it('bounds loading and supports a fresh manual retry',()=>{const view=render(<TradingViewChart asset="BTC"/>);const script=view.container.querySelector('script');act(()=>vi.advanceTimersByTime(15000));expect(screen.queryByRole('status')).toBeNull();fireEvent.click(screen.getByRole('button',{name:'Retry chart'}));expect(view.container.querySelector('script')).not.toBe(script);expect(screen.queryByRole('status')).not.toBeNull();});
});