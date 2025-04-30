import React, { useState } from 'react';
import AnimalList from './AnimalList';
import { Animal, AnimalList as AnimalListType } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface ListCreationViewProps {
  sourceList: AnimalListType;
  targetList: AnimalListType;
  onCancel: () => void;
  onUpdate: (newLists: { sourceList: AnimalListType, newList: AnimalListType, targetList: AnimalListType }) => void;
}

const ListCreationView: React.FC<ListCreationViewProps> = ({
  sourceList,
  targetList,
  onCancel,
  onUpdate
}) => {
  // Create a deep copy of the lists to avoid mutating props
  const [currentSourceList, setCurrentSourceList] = useState<AnimalListType>({
    ...sourceList,
    animals: [...sourceList.animals]
  });
  
  const [currentTargetList, setCurrentTargetList] = useState<AnimalListType>({
    ...targetList,
    animals: [...targetList.animals]
  });
  
  const [newList, setNewList] = useState<AnimalListType>({
    id: 0, // Temporary ID
    name: `List 3`, // Simple list name with number
    animals: []
  });

  const moveFromSourceToNew = (animal: Animal) => {
    // Remove from source list
    setCurrentSourceList({
      ...currentSourceList,
      animals: currentSourceList.animals.filter(a => a.id !== animal.id)
    });
    
    // Add to new list
    setNewList({
      ...newList,
      animals: [...newList.animals, { ...animal, listId: 0 }]
    });
  };

  const moveFromTargetToNew = (animal: Animal) => {
    // Remove from target list
    setCurrentTargetList({
      ...currentTargetList,
      animals: currentTargetList.animals.filter(a => a.id !== animal.id)
    });
    
    // Add to new list
    setNewList({
      ...newList,
      animals: [...newList.animals, { ...animal, listId: 0 }]
    });
  };

  const moveFromNewToSource = (animal: Animal) => {
    // Remove from new list
    setNewList({
      ...newList,
      animals: newList.animals.filter(a => a.id !== animal.id)
    });
    
    // Add to source list
    setCurrentSourceList({
      ...currentSourceList,
      animals: [...currentSourceList.animals, { ...animal, listId: currentSourceList.id }]
    });
  };

  const moveFromNewToTarget = (animal: Animal) => {
    // Remove from new list
    setNewList({
      ...newList,
      animals: newList.animals.filter(a => a.id !== animal.id)
    });
    
    // Add to target list
    setCurrentTargetList({
      ...currentTargetList,
      animals: [...currentTargetList.animals, { ...animal, listId: currentTargetList.id }]
    });
  };

  const handleUpdate = () => {
    onUpdate({
      sourceList: currentSourceList,
      newList,
      targetList: currentTargetList
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-center mb-12">Create a New List</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Source List */}
        <AnimalList
          list={currentSourceList}
          showRightArrow
          onMoveRight={moveFromSourceToNew}
        />
        
        {/* New List */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex flex-col gap-3 mb-5">
            <div>
              <h2 className="font-semibold text-gray-800 text-lg">
                New List <span className="text-gray-500 font-normal">({newList.animals.length})</span>
              </h2>
            </div>
          </div>
          
          <div className="space-y-3 h-80 overflow-y-auto pr-2">
            {newList.animals.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>New list</p>
              </div>
            ) : (
              newList.animals.map(animal => (
                <div key={animal.id} className="bg-white rounded-lg p-4 border border-gray-100 flex justify-between items-center">
                  <button
                    className="text-primary hover:text-blue-700 focus:outline-none"
                    onClick={() => moveFromNewToSource(animal)}
                    aria-label="Move to first list"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5"/>
                      <path d="M12 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <div className="flex-1 px-3">
                    <h3 className="font-medium text-gray-800">{animal.name}</h3>
                    <p className="text-gray-500 text-sm">{animal.scientificName}</p>
                  </div>
                  <button
                    className="text-primary hover:text-blue-700 focus:outline-none"
                    onClick={() => moveFromNewToTarget(animal)}
                    aria-label="Move to second list"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/>
                      <path d="M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Target List */}
        <AnimalList
          list={currentTargetList}
          showLeftArrow
          onMoveLeft={moveFromTargetToNew}
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-center mt-12 space-x-6">
        <Button
          variant="outline"
          onClick={onCancel}
          className="px-8 py-3 text-base border-gray-300"
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-base"
        >
          Create
        </Button>
      </div>
    </div>
  );
};

export default ListCreationView;
