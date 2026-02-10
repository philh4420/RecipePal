export interface Recipe {
    id: string;
    userId: string;
    name: string;
    ingredients: string[];
    instructions: string;
    servings: number;
    url?: string;
    imageUrl?: string;
    prepTime?: number;
    cookTime?: number;
  }
  
  export interface Collection {
    id: string;
    name:string;
  }
  
  export interface Meal {
    recipe: Recipe;
  }
  
  export interface DayPlan {
    date: string; // YYYY-MM-DD
    breakfast?: Meal | null;
    lunch?: Meal | null;
    dinner?: Meal | null;
  }

  export interface MealPlanDocument {
    id: string; // Should be YYYY-MM-DD
    userId: string;
    breakfast?: string; // recipeId
    lunch?: string; // recipeId
    dinner?: string; // recipeId
  }
  
export interface MealPlan {
  [date: string]: DayPlan;
}
