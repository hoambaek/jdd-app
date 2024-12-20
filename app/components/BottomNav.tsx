'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, MessageCircle, Award, User } from 'lucide-react';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/activity',
      icon: <LayoutGrid size={24} />,
      label: 'Activity'
    },
    {
      href: '/chat',
      icon: <MessageCircle size={24} />,
      label: 'Chat'
    },
    {
      href: '/badges',
      icon: <Award size={24} />,
      label: 'Badge'
    },
    {
      href: '/my',
      icon: <User size={24} />,
      label: 'My'
    }
  ];

  return (
    <nav className={styles.bottomNav}>
      {menuItems.map((item) => (
        <Link 
          key={item.href} 
          href={item.href}
          className={pathname === item.href ? styles.active : ''}
        >
          <div className={styles.navItem}>
            {item.icon}
            <span>{item.label}</span>
          </div>
        </Link>
      ))}
    </nav>
  );
} 