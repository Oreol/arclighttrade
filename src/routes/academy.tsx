import {createFileRoute} from '@tanstack/react-router';
import {Academy} from '@/features/academy';
import {pageHead} from '@/features/metadata';
export const Route=createFileRoute('/academy')({head:()=>pageHead('Academy','Build a disciplined trading process through forex foundations, technical analysis and institutional order flow.'),component:Academy});
