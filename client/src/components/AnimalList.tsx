import React from 'react';
import AnimalItem from './AnimalItem';
import { Animal, AnimalList as AnimalListType } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';

interface AnimalListProps {
  list: AnimalListType;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
  showLeftArrow?: boolean;
  showRightArrow?: boolean;
  onMoveLeft?: (animal: Animal) => void;
  onMoveRight?: (animal: Animal) => void;
  className?: string;
}

const AnimalList: React.FC<AnimalListProps> = ({
  list,
  isSelectable = false,
  isSelected = false,
  onSelect,
  showLeftArrow = false,
  showRightArrow = false,
  onMoveLeft,
  onMoveRight,
  className = ""
}) => {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(list.id);
    }
  };

  return (
    <div className={`bg-blue-50 rounded-lg p-6 relative ${className}`} data-list-id={list.id}>
      {isSelectable && (
        <div className="absolute top-4 right-4">
          <Checkbox
            id={`list-${list.id}`}
            checked={isSelected}
            onCheckedChange={handleSelect}
            className="h-5 w-5"
          />
        </div>
      )}

      <div className="mb-3">
        <h2 className="font-semibold text-gray-800 text-lg">
          {list.name} <span className="text-gray-500 font-normal">({list.animals.length})</span>
        </h2>
      </div>
      {list.scientificName && (
        <p className="text-gray-500 text-sm mb-4">{list.scientificName}</p>
      )}

      <div className="space-y-3 h-80 overflow-y-auto pr-2">
        {list.animals.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No animals in this list</p>
          </div>
        ) : (
          list.animals.map((animal) => (
            <AnimalItem
              key={animal.id}
              animal={animal}
              showLeftArrow={showLeftArrow}
              showRightArrow={showRightArrow}
              onMoveLeft={() => onMoveLeft && onMoveLeft(animal)}
              onMoveRight={() => onMoveRight && onMoveRight(animal)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AnimalList;
