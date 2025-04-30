import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Animal Lists Schema
export const animalLists = pgTable("animal_lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  scientificName: text("scientific_name"),
});

export const insertAnimalListSchema = createInsertSchema(animalLists).pick({
  name: true,
  scientificName: true,
});

export type InsertAnimalList = z.infer<typeof insertAnimalListSchema>;
export type AnimalList = typeof animalLists.$inferSelect;

// Animals Schema
export const animals = pgTable("animals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  scientificName: text("scientific_name").notNull(),
  listId: integer("list_id").notNull(),
});

export const insertAnimalSchema = createInsertSchema(animals).pick({
  name: true,
  scientificName: true,
  listId: true,
});

export type InsertAnimal = z.infer<typeof insertAnimalSchema>;
export type Animal = typeof animals.$inferSelect;
