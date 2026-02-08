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
    breakfast?: Meal;
    lunch?: Meal;
    dinner?: Meal;
  }
  
  export interface MealPlan {
    [date: string]: DayPlan;
  }
  
