import { AddRecipeModal } from '@/components/add-recipe-modal';
import { RecipeCard } from '@/components/recipe-card';
import { Input } from '@/components/ui/input';
import { collections, recipes } from '@/lib/data';
import { Search } from 'lucide-react';

export default function RecipesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">My Recipes</h1>
          <p className="text-muted-foreground">
            Your personal collection of delicious recipes.
          </p>
        </div>
        <AddRecipeModal />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search recipes..." className="pl-10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
