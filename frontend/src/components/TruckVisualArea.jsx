import React from 'react';
import CargoGrid from './CargoGrid';

export default function TruckVisualArea() {
  return (
    <div className="w-full max-w-[1720px] mx-auto mb-6">
      <div className="relative w-full min-h-[500px] bg-gradient-to-b from-[#EDEDF0]/70 via-[#F7F7F9] to-white rounded-[28px] border border-gray-200/80 p-6 shadow-xs overflow-hidden flex flex-col justify-center">

        {/* Central Visual Stage */}
        <div className="relative flex-1 flex items-end justify-center w-full my-auto">

          {/* Center: Responsive Truck + Cargo Overlay Container */}
          <div className="relative flex-1 max-w-[1440px] w-full pb-2">
            {/* Unified Relative Wrapper: Anchors truck and cargo grid together */}
            <div className="relative w-full select-none">
              {/* Base Layer (z-1): Complete Truck + Trailer Image */}
              <img
                src="/truck-target.png"
                alt="Truck & Trailer"
                className="w-full h-auto block select-none pointer-events-none relative z-1"
              />

              {/* Overlay Layer (z-2): Cargo Grid perfectly matching trailer box coordinates */}
              <div
                className="absolute z-2"
                style={{
                  left: '29.18%',
                  top: '1.92%',
                  width: '70.59%',
                  height: '70.77%',
                }}
              >
                <CargoGrid />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

