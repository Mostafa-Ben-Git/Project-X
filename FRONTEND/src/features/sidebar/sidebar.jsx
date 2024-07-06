'use client';

import { useMediaQuery } from '@uidotdev/usehooks';
import {
  Bell,
  Bookmark,
  Home,
  List,
  Mail,
  MoreHorizontal,
  User,
  Users,
} from 'lucide-react';
import { SidebarButton } from './sidebar-button';
import { SidebarDesktop } from './sidebar-desktop';
import { SidebarMobile } from './sidebar-mobile';

const sidebarItems = {
  links: [
    { label: 'Home', href: '/home', icon: Home },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Messages', href: '/messages', icon: Mail },
    {
      href: '/lists',
      icon: List,
      label: 'Lists',
    },
    {
      href: '/bookmarks',
      icon: Bookmark,
      label: 'Bookmarks',
    },
    {
      href: '/communities',
      icon: Users,
      label: 'Communities',
    },
    {
      href: '/profile',
      icon: User,
      label: 'Profile',
    },
  ],
  extras: (
    <div className='flex flex-col gap-2'>
      <SidebarButton icon={MoreHorizontal} className='w-full'>
        More
      </SidebarButton>
      <SidebarButton
        className='w-full justify-center bg-primary'
        variant='default'
      >
        Tweet
      </SidebarButton>
    </div>
  ),
};

export function Sidebar() {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <SidebarDesktop sidebarItems={sidebarItems} />;
  }

  return <SidebarMobile sidebarItems={sidebarItems} />;
}
