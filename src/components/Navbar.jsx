'use client';

import React, { useState } from 'react';
import {
  WalletCards,
  Receipt,
  PieChart,
  TrendingUp,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { ModeToggle } from '@/components/ModeToggle';
import { useRouter, usePathname } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(
    pathname === '/' ? 'dashboard' : pathname.slice(1),
  );

  const navItems = [
    {
      name: 'Dashboard',
      icon: <WalletCards className="w-5 h-5" />,
      href: '/',
      id: 'dashboard',
    },
    {
      name: 'Transactions',
      icon: <Receipt className="w-5 h-5" />,
      href: '/transactions',
      id: 'transactions',
    },
    {
      name: 'Analytics',
      icon: <PieChart className="w-5 h-5" />,
      href: '/analytics',
      id: 'analytics',
    },
  ];  

  const handleTabChange = (item) => {
    setActiveTab(item.id);
    router.push(item.href);
  };

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

      <nav className="bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-primary/50 flex items-center justify-center">
                <span className="font-bold text-primary-foreground">F</span>
              </div>
              <span className="font-semibold text-lg text-nowrap">
                Finance Visualizer
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`relative px-4 py-2 transition-all duration-300 ${
                    activeTab === item.id
                      ? 'text-primary'
                      : 'hover:text-primary'
                  }`}
                  onClick={() => handleTabChange(item)}
                >
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>

                  {activeTab === item.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
                  )}
                </Button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <ModeToggle />

              {/* Mobile */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-64">
                    <SheetTitle className="text-lg font-semibold mb-4">
                      Navigation Menu
                    </SheetTitle>
                    <div className="mt-6 flex flex-col space-y-2">
                      {navItems.map((item) => (
                        <Button
                          key={item.id}
                          variant="ghost"
                          className={`justify-start ${
                            activeTab === item.id
                              ? 'bg-primary/10 text-primary'
                              : ''
                          }`}
                          onClick={() => {
                            handleTabChange(item);
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            {item.icon}
                            <span>{item.name}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
