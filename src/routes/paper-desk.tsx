import {createFileRoute} from '@tanstack/react-router';
import {PaperDesk} from '@/features/paper-desk';
import {pageHead} from '@/features/metadata';
export const Route=createFileRoute('/paper-desk')({head:()=>pageHead('Paper Desk','Instant reference execution, position management and risk evaluation for forex, gold and digital assets.'),component:PaperDesk});
