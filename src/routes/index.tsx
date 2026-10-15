import {createFileRoute} from '@tanstack/react-router';
import {Dashboard} from '@/features/dashboard';
import {pageHead} from '@/features/metadata';
export const Route=createFileRoute('/')({head:()=>pageHead('Evaluation Dashboard','Your Arclight Academy evaluation capital, institutional Alpha Briefs and learning momentum in one private trading workspace.'),component:Dashboard});
