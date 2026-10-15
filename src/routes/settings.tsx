import {createFileRoute} from '@tanstack/react-router';
import {Settings} from '@/features/settings';
import {pageHead} from '@/features/metadata';
export const Route=createFileRoute('/settings')({head:()=>pageHead('Settings','Manage your Arclight Academy member profile, notification preferences and evaluation account.'),component:Settings});
