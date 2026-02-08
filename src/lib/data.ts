import type { Recipe, Collection, MealPlan } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const collections: Collection[] = [
  { id: '1', name: 'Quick Weeknight Dinners' },
  { id: '2', name: 'Healthy Salads' },
  { id: '3', name: 'Comfort Food Classics' },
];

export const recipes: Recipe[] = [
  {
    id: '1',
    name: 'Spaghetti Carbonara',
    ingredients: ['200g spaghetti', '100g pancetta', '2 large eggs', '50g pecorino cheese', 'Black pepper'],
    instructions: '...',
    servings: 2,
    collectionId: '1',
    image: PlaceHolderImages[0].imageUrl,
    imageHint: PlaceHolderImages[0].imageHint,
  },
  {
    id: '2',
    name: 'Avocado and Quinoa Salad',
    ingredients: ['1 cup quinoa', '2 cups water', '1 avocado', '1 lemon', 'Cherry tomatoes', 'Cucumber', 'Olive oil'],
    instructions: '...',
    servings: 2,
    collectionId: '2',
    image: PlaceHolderImages[1].imageUrl,
    imageHint: PlaceHolderImages[1].imageHint,
  },
  {
    id: '3',
    name: 'Classic Beef Stew',
    ingredients: ['500g beef chuck', '2 carrots', '2 potatoes', '1 onion', '400g canned tomatoes', 'Beef broth'],
    instructions: '...',
    servings: 4,
    collectionId: '3',
    image: PlaceHolderImages[2].imageUrl,
    imageHint: PlaceHolderImages[2].imageHint,
  },
  {
    id: '4',
    name: 'Sheet Pan Lemon Herb Chicken',
    ingredients: ['4 chicken thighs', '1 lb broccoli florets', '1 lemon', 'Rosemary', 'Thyme', 'Olive oil'],
    instructions: '...',
    servings: 4,
    collectionId: '1',
    image: PlaceHolderImages[3].imageUrl,
    imageHint: PlaceHolderImages[3].imageHint,
  },
    {
    id: '5',
    name: 'Tomato Basil Bruschetta',
    ingredients: ['1 baguette', '4 ripe tomatoes', 'Fresh basil', 'Garlic', 'Extra virgin olive oil'],
    instructions: '...',
    servings: 4,
    image: PlaceHolderImages[4].imageUrl,
    imageHint: PlaceHolderImages[4].imageHint,
  },
  {
    id: '6',
    name: 'Creamy Tomato Soup',
    ingredients: ['1 kg tomatoes', '1 onion', '2 cloves garlic', '1 cup heavy cream', 'Vegetable broth'],
    instructions: '...',
    servings: 4,
    collectionId: '3',
    image: PlaceHolderImages[5].imageUrl,
    imageHint: PlaceHolderImages[5].imageHint,
  },
];

export const mealPlan: MealPlan = {
    // Assuming today is around 2024-07-29 for consistent display
    '2024-07-29': { // Monday
        lunch: { recipe: recipes[1] }, // Avocado and Quinoa Salad
        dinner: { recipe: recipes[0] }, // Spaghetti Carbonara
    },
    '2024-07-30': { // Tuesday
        dinner: { recipe: recipes[3] }, // Sheet Pan Chicken
    },
    '2024-07-31': { // Wednesday
        breakfast: { recipe: recipes[4] }, // Bruschetta (as a light breakfast)
        dinner: { recipe: recipes[2] }, // Beef Stew
    },
    '2024-08-01': { // Thursday
        lunch: { recipe: recipes[1] }, // Leftover Salad
        dinner: { recipe: recipes[5] } // Tomato Soup
    },
    '2024-08-02': { // Friday
        dinner: { recipe: recipes[0] }, // Spaghetti Carbonara again
    }
};
