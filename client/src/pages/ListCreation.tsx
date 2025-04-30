import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Animal, AnimalList as AnimalListType, ApiResponse } from '@/lib/types';
import AnimalListComponent from '@/components/AnimalList';
import ListCreationView from '@/components/ListCreationView';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ListCreation: React.FC = () => {
  const [selectedLists, setSelectedLists] = useState<number[]>([]);
  const [view, setView] = useState<'allLists' | 'listCreation'>('allLists');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sourceList, setSourceList] = useState<AnimalListType | null>(null);
  const [targetList, setTargetList] = useState<AnimalListType | null>(null);
  const { toast } = useToast();

  // Fetch lists data
  const { data, isLoading, isError, refetch } = useQuery<ApiResponse>({
    queryKey: ['/api/lists'],
    retry: 1
  });

  const updateListsMutation = useMutation({
    mutationFn: async (updatedLists: { 
      sourceList: AnimalListType, 
      newList: AnimalListType, 
      targetList: AnimalListType 
    }) => {
      // Set a name for the new list if it doesn't have one or is the default
      if (!updatedLists.newList.name || updatedLists.newList.name.trim() === '') {
        updatedLists.newList.name = `List ${Date.now().toString().slice(-4)}`;
      }
      
      // Ensure the new list has an id property (might be 0 for new lists)
      if (!updatedLists.newList.id) {
        updatedLists.newList.id = 0;
      }
      
      const response = await apiRequest('POST', '/api/lists/update', updatedLists);
      
      // Parse the response to get the new list ID
      const data = await response.json();
      console.log('Server response:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update lists');
      }
      
      return data;
    },
    onSuccess: (data) => {
      setView('allLists');
      setSelectedLists([]);
      refetch();
      toast({
        title: "Success",
        description: "Lists updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update lists: " + (error?.message || 'Unknown error'),
        variant: "destructive"
      });
    }
  });
  
  // Mutation for deleting a list
  const deleteListMutation = useMutation({
    mutationFn: async (listId: number) => {
      const response = await apiRequest('DELETE', `/api/lists/${listId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete list');
      }
      
      return data;
    },
    onSuccess: () => {
      setSelectedLists([]);
      refetch();
      toast({
        title: "Success",
        description: "List deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete list: " + (error?.message || 'Unknown error'),
        variant: "destructive"
      });
    }
  });

  const handleSelectList = (id: number) => {
    if (selectedLists.includes(id)) {
      setSelectedLists(selectedLists.filter(listId => listId !== id));
    } else {
      setSelectedLists([...selectedLists, id]);
    }
    setErrorMessage(null);
  };

  const handleCreateNewList = () => {
    if (selectedLists.length !== 2) {
      setErrorMessage("You should select exactly 2 lists to create a new list");
      return;
    }

    const lists = data?.lists || [];
    const firstSelectedList = lists.find(list => list.id === selectedLists[0]);
    const secondSelectedList = lists.find(list => list.id === selectedLists[1]);

    if (firstSelectedList && secondSelectedList) {
      setSourceList(firstSelectedList);
      setTargetList(secondSelectedList);
      setView('listCreation');
    }
  };

  const handleCancel = () => {
    setView('allLists');
    setSelectedLists([]);
    setErrorMessage(null);
  };

  const handleUpdate = (updatedLists: { 
    sourceList: AnimalListType, 
    newList: AnimalListType, 
    targetList: AnimalListType 
  }) => {
    updateListsMutation.mutate(updatedLists);
  };
  
  const handleDeleteSelectedList = () => {
    // Only allow deletion if a single custom list is selected
    if (selectedLists.length !== 1) {
      setErrorMessage("Please select a single custom list to delete");
      return;
    }
    
    const listId = selectedLists[0];
    
    // Don't allow deletion of original lists
    if (listId <= 2) {
      setErrorMessage("You cannot delete the original lists");
      return;
    }
    
    // Delete the selected list
    deleteListMutation.mutate(listId);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-center mt-4 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">We couldn't fetch the list data. Please try again later.</p>
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const lists: AnimalListType[] = data?.lists || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="container mx-auto p-4 max-w-6xl">
        {view === 'allLists' ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-center mb-8">List Creation</h1>
            
            {errorMessage && (
              <div className="mb-4 text-red-500 text-center">
                {errorMessage}
              </div>
            )}
            
            <div className="flex justify-center gap-4 mb-12">
              <Button 
                onClick={handleCreateNewList}
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors text-lg"
              >
                Create a new list
              </Button>
              {selectedLists.length === 1 && selectedLists[0] > 2 && (
                <Button 
                  onClick={handleDeleteSelectedList}
                  variant="destructive"
                  className="px-6 py-3 rounded-md font-medium text-lg"
                  disabled={deleteListMutation.isPending}
                >
                  {deleteListMutation.isPending ? 'Deleting...' : 'Delete selected list'}
                </Button>
              )}
            </div>
            
            <div className="flex flex-col gap-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {lists
                  .filter(list => list.id <= 2) /* Only show original lists in the grid */
                  .map(list => (
                    <AnimalListComponent
                      key={list.id}
                      list={list}
                      isSelectable
                      isSelected={selectedLists.includes(list.id)}
                      onSelect={handleSelectList}
                    />
                  ))
                }
              </div>
              
              {/* Display all lists below the grid */}
              <div className="mt-8">
                {lists
                  .filter(list => list.id > 2) /* Show only created lists */
                  .map(list => (
                    <AnimalListComponent
                      key={list.id}
                      list={list}
                      isSelectable
                      isSelected={selectedLists.includes(list.id)}
                      onSelect={handleSelectList}
                      className="mb-6 w-full"
                    />
                  ))
                }
                {lists.filter(list => list.id > 2).length === 0 && (
                  <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500">No additional lists yet. Create one by selecting two lists and clicking "Create a new list".</p>
                  </div>
                )}
              </div>
              
              {/* Delete button at the bottom when a custom list is selected */}
              {selectedLists.length === 1 && selectedLists[0] > 2 && (
                <div className="mt-8 flex justify-center">
                  <Button 
                    onClick={handleDeleteSelectedList}
                    variant="destructive"
                    className="px-6 py-3 rounded-md font-medium text-base"
                    disabled={deleteListMutation.isPending}
                  >
                    {deleteListMutation.isPending ? 'Deleting...' : 'Delete Selected List'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          sourceList && targetList && (
            <ListCreationView
              sourceList={sourceList}
              targetList={targetList}
              onCancel={handleCancel}
              onUpdate={handleUpdate}
            />
          )
        )}
      </div>
    </div>
  );
};

export default ListCreation;
