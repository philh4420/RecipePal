export interface Recipe {
    id: string;
    name: string;
    ingredients: string[];
    instructions: string;
    servings: number;
    collectionId?: string;
    image: string;
    imageHint: string;
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
  