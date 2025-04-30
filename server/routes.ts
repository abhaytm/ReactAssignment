import type { Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // GET endpoint to fetch animal lists from the external API
  app.get('/api/lists', async (req, res) => {
    try {
      // First check if we already have cached data
      const cachedLists = storage.getStoredLists();
      if (cachedLists && cachedLists.length > 0) {
        return res.json({ lists: cachedLists });
      }
      
      // If no cached data, fetch from the external API
      const response = await axios.get('https://apis.ccbp.in/list-creation/lists');
      
      // Transform the API response to match our expected format
      const apiData = response.data.lists;
      
      // Group animals by list_number
      const listMap: { [key: number]: any } = {};
      
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
      const transformedLists = Object.values(listMap);
      
      // Store the transformed lists in our storage
      storage.setApiData(transformedLists);
      
      res.json({ lists: transformedLists });
    } catch (error) {
      console.error('Error fetching lists from external API:', error);
      res.status(500).json({ 
        error: 'Failed to fetch lists from external API',
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // POST endpoint to update lists after moving items
  app.post('/api/lists/update', async (req, res) => {
    try {
      const { sourceList, newList, targetList } = req.body;
      
      if (!sourceList || !newList || !targetList) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required lists in request body" 
        });
      }
      
      // Assign a new ID to the new list if it doesn't have one yet
      if (!newList.id || newList.id === 0) {
        // Create the new list in storage
        const createdList = await storage.createList(newList);
        newList.id = createdList.id;
      }
      
      // Update the lists in storage
      await storage.updateLists(sourceList, newList, targetList);
      
      res.json({ 
        success: true, 
        message: "Lists updated successfully",
        newListId: newList.id
      });
    } catch (error) {
      console.error('Error updating lists:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to update lists",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // DELETE endpoint to delete a list
  app.delete('/api/lists/:id', async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      
      if (isNaN(listId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid list ID" 
        });
      }
      
      // Don't allow deletion of the original lists
      if (listId <= 2) {
        return res.status(403).json({ 
          success: false, 
          message: "Cannot delete original lists" 
        });
      }
      
      const success = await storage.deleteList(listId);
      
      if (success) {
        res.json({ 
          success: true, 
          message: "List deleted successfully" 
        });
      } else {
        res.status(404).json({ 
          success: false, 
          message: "List not found or could not be deleted" 
        });
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to delete list",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
