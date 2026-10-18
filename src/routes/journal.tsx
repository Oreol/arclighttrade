import {createFileRoute} from '@tanstack/react-router';
import {Journal} from '@/features/journal';
import {pageHead} from '@/features/metadata';
export const Route=createFileRoute('/journal')({head:()=>pageHead('Trading Journal','Review every Arclight evaluation trade, track rule adherence and strengthen disciplined execution.'),component:Journal});