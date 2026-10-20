import React from 'react';
import { useApp } from '../context/AppContext';
import CargoCell from './CargoCell';

export default function CargoGrid() {
  const { matches } = useApp();

  // Sort by composite score descending and take top 8
  const top8 = [...matches]
    .sort((a, b) => (b.composite_score || 0) - (a.composite_score || 0))
    .slice(0, 8);

  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-2 w-full h-full p-1.5 box-border">
      {top8.map((m) => (
        <CargoCell
          key={m.id}
          listingId={m.listingId}
          label={m.material || m.code || 'Secondary Lot'}
          matchScore={m.composite_score}
        />
      ))}
    </div>
  );
}


