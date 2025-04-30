import { users, type User, type InsertUser } from "@shared/schema";
import { Animal, AnimalList } from "@/lib/types";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Animal list methods
  getLists(): Promise<AnimalList[]>;
  updateLists(sourceList: AnimalList, newList: AnimalList, targetList: AnimalList): Promise<boolean>;
  createList(newList: AnimalList): Promise<AnimalList>;
  deleteList(listId: number): Promise<boolean>;
  getStoredLists(): AnimalList[];
  setApiData(lists: AnimalList[]): void;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private animalLists: AnimalList[];
  private apiData: AnimalList[] | null;
  currentId: number;
  currentListId: number;

  constructor() {
    this.users = new Map();
    this.animalLists = [];
    this.apiData = null;
    this.currentId = 1;
    this.currentListId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Set the initial data from the API
  setApiData(lists: AnimalList[]) {
    this.apiData = [...lists];
    this.animalLists = [...lists];
    
    // Set the current list ID to be one higher than the highest existing ID
    if (lists && lists.length > 0) {
      const maxId = Math.max(...lists.map(list => list.id));
      this.currentListId = maxId + 1;
    }
  }
  
  async getLists(): Promise<AnimalList[]> {
    return [...this.animalLists];
  }
  
  getStoredLists(): AnimalList[] {
    return this.animalLists;
  }
  
  async updateLists(updatedSourceList: AnimalList, newList: AnimalList, updatedTargetList: AnimalList): Promise<boolean> {
    // Create a map of all lists by id for easy lookup
    const listMap = new Map<number, AnimalList>();
    
    // Add existing lists to the map
    this.animalLists.forEach(list => {
      listMap.set(list.id, list);
    });
    
    // Update the source and target lists
    listMap.set(updatedSourceList.id, updatedSourceList);
    listMap.set(updatedTargetList.id, updatedTargetList);
    
    // Add the new list
    listMap.set(newList.id, newList);
    
    // Convert the map back to an array
    this.animalLists = Array.from(listMap.values());
    
    return true;
  }
  
  async createList(newList: AnimalList): Promise<AnimalList> {
    const id = this.currentListId++;
    // Update the name to use the consistent "List X" format
    const list = { 
      ...newList, 
      id,
      name: `List ${id}`
    };
    this.animalLists.push(list);
    return list;
  }
  
  async deleteList(listId: number): Promise<boolean> {
    // Don't allow deletion of original lists (1 and 2)
    if (listId <= 2) {
      return false;
    }
    
    // Filter out the list to delete
    this.animalLists = this.animalLists.filter(list => list.id !== listId);
    
    return true;
  }
}

export const storage = new MemStorage();
