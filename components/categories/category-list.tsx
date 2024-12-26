import Image from "next/image";
import Link from "next/link";
import { Category } from "@/types/category";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CategoryListProps {
  categories: Category[];
  className?: string;
}

export default function CategoryList({ categories, className }: CategoryListProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", className)}>
      {categories.map((category) => (
        <Link key={category.id} href={`/categories/${category.slug}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-[4/3]">
              {category.images?.[0] ? (
                <Image
                  src={category.images[0]}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-xl md:text-2xl font-bold text-white text-center px-4">
                  {category.name}
                </h3>
              </div>
            </div>
            {category.description && (
              <div className="p-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              </div>
            )}
          </Card>
        </Link>
      ))}
    </div>
  );
}
