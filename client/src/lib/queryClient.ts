import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { AnimalList, Animal, ApiResponse } from "./types";

// Local storage key for custom lists
const CUSTOM_LISTS_KEY = 'animal_app_custom_lists';
// Local storage key for processed API data
const API_DATA_KEY = 'animal_app_api_data';

// Local storage functions
export function saveCustomLists(lists: AnimalList[]) {
  localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(lists));
}

export function loadCustomLists(): AnimalList[] {
  const stored = localStorage.getItem(CUSTOM_LISTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveApiData(lists: AnimalList[]) {
  localStorage.setItem(API_DATA_KEY, JSON.stringify(lists));
}

export function loadApiData(): AnimalList[] {
  const stored = localStorage.getItem(API_DATA_KEY);
  return stored ? JSON.parse(stored) : [];
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Transform API data from external format to our app format
function transformApiData(apiData: any[]): AnimalList[] {
  // Group animals by list_number
  const listMap: { [key: number]: AnimalList } = {};
      
  apiData.forEach((item: any) => {
    if (!listMap[item.list_number]) {
      listMap[item.list_number] = {
        id: item.list_number,
        name: `List ${item.list_number}`,
        animals: []
      };
    }
    
    listMap[item.list_number].animals.push({
      id: item.id,
      name: item.name,
      scientificName: item.description,
      listId: item.list_number
    });
  });
  
  // Convert the map to an array
  return Object.values(listMap);
}

// Get next ID for a new list
function getNextListId(): number {
  const customLists = loadCustomLists();
  const apiLists = loadApiData();
  const allLists = [...apiLists, ...customLists];
  
  if (allLists.length === 0) {
    return 3; // Start with ID 3 since API data typically has lists 1 and 2
  }
  
  const maxId = Math.max(...allLists.map(list => list.id));
  return maxId + 1;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Handle API lists endpoint
  if (url === '/api/lists' && method === 'GET') {
    try {
      // First check if we have cached API data
      const cachedApiData = loadApiData();
      const customLists = loadCustomLists();
      
      if (cachedApiData.length > 0) {
        // We have cached data, use it combined with custom lists
        const responseData = {
          lists: [...cachedApiData, ...customLists]
        };
        
        return new Response(JSON.stringify(responseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // No cached data, fetch from external API
      console.log('Fetching data from external API...');
      const response = await fetch('https://apis.ccbp.in/list-creation/lists');
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const apiData = await response.json();
      const transformedLists = transformApiData(apiData.lists);
      
      // Cache the transformed API data
      saveApiData(transformedLists);
      
      // Return combined data
      const responseData = {
        lists: [...transformedLists, ...customLists]
      };
      
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Handle update lists endpoint
  if (url === '/api/lists/update' && method === 'POST') {
    try {
      // Process the update request
      const payload = data as { 
        sourceList: AnimalList, 
        newList: AnimalList, 
        targetList: AnimalList 
      };
      
      const customLists = loadCustomLists();
      const newListId = getNextListId();
      
      // Set the ID and name for the new list
      payload.newList.id = newListId;
      payload.newList.name = `List ${newListId}`;
      
      // Update the listId of animals in the new list
      payload.newList.animals = payload.newList.animals.map(animal => ({
        ...animal,
        listId: newListId
      }));
      
      // Update existing custom lists
      const updatedCustomLists = customLists.map(list => 
        list.id === payload.sourceList.id ? payload.sourceList :
        list.id === payload.targetList.id ? payload.targetList : list
      );
      
      // Check if the source or target lists are from the API data (ids 1-2)
      // If so, we need to update the cached API data
      const apiLists = loadApiData();
      const updatedApiLists = apiLists.map(list => 
        list.id === payload.sourceList.id ? payload.sourceList :
        list.id === payload.targetList.id ? payload.targetList : list
      );
      
      // Save the updated API data
      if (payload.sourceList.id <= 2 || payload.targetList.id <= 2) {
        saveApiData(updatedApiLists);
      }
      
      // Add the new list
      const finalCustomLists = [
        ...updatedCustomLists.filter(list => 
          list.id !== payload.sourceList.id && 
          list.id !== payload.targetList.id
        ),
        payload.newList
      ];
      
      // Save the updated custom lists
      saveCustomLists(finalCustomLists);
      
      // Return success response
      return new Response(JSON.stringify({
        success: true,
        message: "Lists updated successfully",
        newListId: payload.newList.id
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error updating lists:', error);
      return new Response(JSON.stringify({
        success: false,
        message: "Failed to update lists",
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Handle delete list endpoint
  if (url.startsWith('/api/lists/') && method === 'DELETE') {
    try {
      // Get the list ID from the URL
      const listId = parseInt(url.split('/').pop() || '0');
      
      // Don't allow deletion of original lists
      if (listId <= 2) {
        return new Response(JSON.stringify({
          success: false,
          message: "Cannot delete original lists"
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Get the custom lists
      const customLists = loadCustomLists();
      
      // Filter out the list to delete
      const updatedCustomLists = customLists.filter(list => list.id !== listId);
      
      // Save the updated custom lists
      saveCustomLists(updatedCustomLists);
      
      // Return success response
      return new Response(JSON.stringify({
        success: true,
        message: "List deleted successfully"
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error deleting list:', error);
      return new Response(JSON.stringify({
        success: false,
        message: "Failed to delete list",
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // This shouldn't be reached in our app
  console.error('Unhandled API request:', method, url);
  return new Response(JSON.stringify({
    error: 'Not implemented'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' }
  });
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await apiRequest('GET', queryKey[0] as string);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
