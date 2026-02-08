import { Recipe } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from './ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const imageUrl = recipe.imageUrl || PlaceHolderImages[0].imageUrl;

  return (
    <div className="relative group">
      <Link href={`/recipes/${recipe.id}`} className="absolute inset-0 z-10" aria-label={`View ${recipe.name}`}>
        <span className="sr-only">View Recipe</span>
      </Link>
      <Card className="overflow-hidden h-full transition-shadow group-hover:shadow-lg">
        <CardHeader className="p-0 relative">
          <Image
            src={imageUrl}
            alt={recipe.name}
            width={400}
            height={250}
            className="aspect-[16/10] w-full object-cover"
          />
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-bold leading-tight line-clamp-2">
            {recipe.name}
          </CardTitle>
        </CardContent>
      </Card>
      <div className="absolute top-2 right-2 z-20">
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/80 hover:bg-white backdrop-blur-sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Add to collection</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
