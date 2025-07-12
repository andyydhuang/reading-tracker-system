import React from 'react';

interface HeroSectionProps {
  onReadMore: () => void;
}

export function HeroSection({
  onReadMore
}: HeroSectionProps) {
  return (
    <section className="bg-[#FFD767] py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Left column */}
          <div className="flex justify-center items-start pt-0">
            <h1 className="text-6xl text-[#382110] text-left w-full pl-8">
            </h1>
          </div>
          
          {/* Right column */}
          <div></div>
        </div>
      </div>
    </section>
  );
}