import {createFileRoute} from '@tanstack/react-router';
import {Signals} from '@/features/signals';
import {pageHead} from '@/features/metadata';
export const Route=createFileRoute('/signals')({head:()=>pageHead('Signals','Institutional forex and gold Alpha Briefs with defined entry zones, invalidation and tiered targets.'),component:Signals});
