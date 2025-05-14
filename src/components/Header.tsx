import React from 'react';

// These could be made dynamic via props or context in a future enhancement
const DISPLAY_YEAR = '2025';
const DISPLAY_TERM_STRING = 'Summer'; // Or 'Fall', 'Spring'
const DISPLAY_CAMPUS = 'New Brunswick';

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
            {DISPLAY_YEAR} {DISPLAY_TERM_STRING}
          </span>
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
            {DISPLAY_CAMPUS}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
