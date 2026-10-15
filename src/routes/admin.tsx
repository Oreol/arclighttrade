import {createFileRoute} from '@tanstack/react-router';
import {Admin} from '@/features/admin';
import {pageHead} from '@/features/metadata';
export const Route=createFileRoute('/admin')({head:()=>pageHead('Admin','Authorized Arclight Academy revenue intelligence, Alpha Brief broadcasting and student performance radar.'),component:Admin});
