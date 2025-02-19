'use client';

import React from 'react';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const Navbar = () => {
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

      <nav className="bg-background/95 backdrop-blur-xl border-b border-border/40 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-10 h-10 overflow-hidden rounded-md">
                <Image
                  src="/logo.png"
                  alt="Finance Visualizer Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-foreground">
                  Finance Visualizer
                </span>
                <span className="hidden sm:inline-block text-xs text-muted-foreground">
                  Track • Budget • Grow
                </span>
              </div>
            </div>

            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
