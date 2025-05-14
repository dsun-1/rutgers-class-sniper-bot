
import React from 'react';

const Header = () => {
  return (
    <header className="bg-rutgers-red text-white shadow-md">
      <div className="container mx-auto py-4 px-4 md:px-6 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <h1 className="text-2xl font-bold tracking-tight">
            Rutgers Course Sniper
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
            2025 Spring
          </span>
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
            New Brunswick
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
