export interface Animal {
  id: number;
  name: string;
  scientificName: string;
  listId: number;
}

export interface AnimalList {
  id: number;
  name: string;
  scientificName?: string;
  animals: Animal[];
}

export interface ApiResponse {
  lists: AnimalList[];
}
