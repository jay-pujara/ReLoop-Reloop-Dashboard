import React, { useState } from 'react';
import { Image as ImageIcon, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

export default function MaterialPassport3D({
  materialType = 'rHDPE',
  photos = [],
}) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const displayPhotos = photos && photos.length > 0 ? photos : [
    'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=800&auto=format&fit=crop&q=80',
  ];

  const activePhoto = displayPhotos[selectedPhotoIndex] || displayPhotos[0];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-white border border-gray-200/80 shadow-xs flex flex-col">
      {/* Gallery Header Bar */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white">
            <ImageIcon className="w-4 h-4 text-[#8FFE01]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Verified Specimen
            </span>
            <span className="text-xs font-extrabold text-black">
              {materialType} Photo Gallery
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200/80 shadow-2xs text-xs font-semibold text-gray-700">
          <span className="w-2 h-2 rounded-full bg-[#8FFE01]" />
          <span>{displayPhotos.length} Specimen {displayPhotos.length === 1 ? 'Photo' : 'Photos'}</span>
        </div>
      </div>

      {/* Main Active Photo View */}
      <div className="relative w-full h-[360px] bg-neutral-900 flex items-center justify-center overflow-hidden group">
        <img
          src={activePhoto}
          alt={`Specimen photo ${selectedPhotoIndex + 1}`}
          className="w-full h-full object-contain select-none transition-transform duration-300 group-hover:scale-102"
        />

        {/* Previous / Next Arrow Controls if multiple photos */}
        {displayPhotos.length > 1 && (
          <>
            <button
              onClick={() => setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : displayPhotos.length - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-md"
              title="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedPhotoIndex((prev) => (prev < displayPhotos.length - 1 ? prev + 1 : 0))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-md"
              title="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Counter Badge */}
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10">
          Photo {selectedPhotoIndex + 1} of {displayPhotos.length}
        </div>
      </div>

      {/* Thumbnails Row */}
      {displayPhotos.length > 1 && (
        <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex items-center gap-3 overflow-x-auto">
          {displayPhotos.map((photo, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPhotoIndex(idx)}
              className={`relative h-16 w-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                selectedPhotoIndex === idx
                  ? 'border-[#7201FF] shadow-sm ring-2 ring-[#7201FF]/30 scale-102'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={photo}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
