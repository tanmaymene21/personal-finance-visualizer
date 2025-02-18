'use client';

import React, { useState } from 'react';
import { ModeToggle } from '@/components/ModeToggle';

const Navbar = () => {
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

            <div className="flex items-center space-x-2">
              <ModeToggle />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
