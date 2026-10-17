import {createFileRoute} from '@tanstack/react-router';
import {MarketNews} from '@/features/market-news';
import {pageHead} from '@/features/metadata';
export const Route=createFileRoute('/market-news')({head:()=>pageHead('Market News','Explore preset forex, gold and crypto news scenarios with Arclight AI interpretation and relevant academy and signal links.'),component:MarketNews});