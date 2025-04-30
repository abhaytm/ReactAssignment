import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Animal } from '@/lib/types';

interface AnimalItemProps {
  animal: Animal;
  showLeftArrow?: boolean;
  showRightArrow?: boolean;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}

const AnimalItem: React.FC<AnimalItemProps> = ({ 
  animal, 
  showLeftArrow = false, 
  showRightArrow = false,
  onMoveLeft,
  onMoveRight 
}) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex justify-between items-center">
      {showLeftArrow && (
        <button 
          className="text-blue-600 hover:text-blue-800 focus:outline-none mr-2"
          onClick={onMoveLeft}
          aria-label="Move left"
        >
          <ArrowLeft size={18} />
        </button>
      )}
      
      <div className={`${!showLeftArrow && !showRightArrow ? '' : 'flex-1 px-3'}`}>
        <h3 className="font-medium text-gray-800">{animal.name}</h3>
        <p className="text-gray-500 text-sm mt-1">{animal.scientificName}</p>
      </div>
      
      {showRightArrow && (
        <button 
          className="text-blue-600 hover:text-blue-800 focus:outline-none ml-2"
          onClick={onMoveRight}
          aria-label="Move right"
        >
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
};

export default AnimalItem;
