import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CargoCell({
  listingId,
  label = 'rHDPE',
  matchScore,
  className = '',
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (listingId) {
      navigate(`/listings/${listingId}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      title={listingId ? `View Recommended Listing #${listingId}` : label}
      className={`relative bg-[#F4F4F6]/90 hover:bg-white border border-[#D5D5DA] hover:border-[#7201FF] rounded-xl p-2 h-full w-full flex flex-col items-center justify-center gap-1 select-none shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer group text-center ${className}`}
    >
      <span className="text-xs md:text-sm font-extrabold tracking-tight text-black group-hover:text-[#7201FF] transition-colors leading-tight">
        {label}
      </span>
      {matchScore && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 leading-none">
          {matchScore}% Match
        </span>
      )}
    </button>
  );
}


