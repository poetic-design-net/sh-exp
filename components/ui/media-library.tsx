import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Check, Trash2, Grid, List, Tag, Plus, Info, FolderPlus } from "lucide-react";
import type { MediaItem } from "@/services/media-library";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface MediaLibraryProps {
  items: MediaItem[];
  selectedUrl?: string;
  onSelect: (item: MediaItem) => void;
  onDelete?: (item: MediaItem) => void;
  onUpdateTags?: (id: string, tags: string[]) => Promise<void>;
  onUpdateCategory?: (id: string, category: string) => Promise<void>;
  isDeleting?: string;
}

const ITEMS_PER_PAGE = 24;

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "products", label: "Products" },
  { value: "banners", label: "Banners" },
  { value: "gallery", label: "Gallery" },
  { value: "uncategorized", label: "Uncategorized" }
];

export function MediaLibrary({
  items,
  selectedUrl,
  onSelect,
  onDelete,
  onUpdateTags,
  onUpdateCategory,
  isDeleting,
}: MediaLibraryProps) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  const [showingInfo, setShowingInfo] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(items.map(item => item.category || 'uncategorized'));
    return ['all', ...Array.from(cats)];
  }, [items]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach(item => {
      item.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [items]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (selectedCategory !== 'all') {
      result = result.filter(item => 
        selectedCategory === 'uncategorized' 
          ? !item.category 
          : item.category === selectedCategory
      );
    }

    if (selectedTags.length > 0) {
      result = result.filter(item => 
        selectedTags.every(tag => item.tags?.includes(tag))
      );
    }

    if (searchTerm) {
      result = result.filter(item =>
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case "name":
          comparison = a.filename.localeCompare(b.filename);
          break;
        case "size":
          comparison = (a.size || 0) - (b.size || 0);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [items, searchTerm, sortBy, sortOrder, selectedCategory, selectedTags]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredAndSortedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return "Unknown size";
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleTagUpdate = async (itemId: string, tags: string[]) => {
    if (onUpdateTags) {
      try {
        await onUpdateTags(itemId, tags);
        toast({
          title: "Success",
          description: "Tags updated successfully",
        });
        setEditingTags(null);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update tags",
          variant: "destructive",
        });
      }
    }
  };

  const handleCategoryUpdate = async (itemId: string, category: string) => {
    if (onUpdateCategory) {
      try {
        await onUpdateCategory(itemId, category);
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
        setEditingCategory(null);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update category",
          variant: "destructive",
        });
      }
    }
  };

  const getDisplayName = (item: MediaItem) => {
    if (item.tags && item.tags.length > 0) {
      return item.tags.join(', ');
    }
    return item.filename;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center justify-between">
          <div className="flex gap-4 items-center flex-1 flex-wrap">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: "date" | "name" | "size") => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Order..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <Tag className="h-4 w-4" />
          <div className="flex gap-2 flex-wrap">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  );
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-5 gap-2">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              className={`
                relative group aspect-square rounded-lg overflow-hidden
                border-2 transition-all duration-200
                ${selectedUrl === item.url ? "border-primary" : "border-transparent"}
                hover:border-primary/50
              `}
            >
              <img
                src={item.url}
                alt={getDisplayName(item)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => onSelect(item)}
                    className={selectedUrl === item.url ? "bg-primary text-primary-foreground" : ""}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setShowingInfo(item.id)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                  {onUpdateTags && (
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => setEditingTags(item.id)}
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  )}
                  {onUpdateCategory && (
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => setEditingCategory(item.id)}
                    >
                      <FolderPlus className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => onDelete(item)}
                      disabled={isDeleting === item.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="text-xs text-white text-center mt-1">
                  <div>{item.filename}</div>
                  <div>{item.category || 'Uncategorized'}</div>
                  <div>{formatFileSize(item.size)}</div>
                </div>
              </div>
              {isDeleting === item.id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-md">
          <div className="grid grid-cols-[1fr_120px_120px_200px] gap-4 p-3 bg-muted font-medium">
            <div>Name</div>
            <div>Date</div>
            <div>Size</div>
            <div>Actions</div>
          </div>
          <div className="divide-y">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className={`
                  grid grid-cols-[1fr_120px_120px_200px] gap-4 p-3 items-center
                  hover:bg-muted/50 transition-colors
                  ${selectedUrl === item.url ? "bg-primary/10" : ""}
                `}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.variants?.small?.url || item.url}
                      alt={getDisplayName(item)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{item.filename}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.category || 'Uncategorized'}
                    </span>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {item.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>{formatDate(item.createdAt)}</div>
                <div>{formatFileSize(item.variants?.large?.size || item.size)}</div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onSelect(item)}
                    className={selectedUrl === item.url ? "bg-primary text-primary-foreground" : ""}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowingInfo(item.id)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                  {onUpdateTags && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingTags(item.id)}
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  )}
                  {onUpdateCategory && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCategory(item.id)}
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(item)}
                      disabled={isDeleting === item.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {paginatedItems.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          {searchTerm ? "No images match your search" : "No images uploaded yet"}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} items
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {editingTags && (
        <Dialog open={true} onOpenChange={() => setEditingTags(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tags</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTag.trim()) {
                      const item = items.find(i => i.id === editingTags);
                      if (item) {
                        const updatedTags = [...(item.tags || [])];
                        if (!updatedTags.includes(newTag.trim())) {
                          updatedTags.push(newTag.trim());
                          handleTagUpdate(editingTags, updatedTags);
                        }
                        setNewTag('');
                      }
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (newTag.trim()) {
                      const item = items.find(i => i.id === editingTags);
                      if (item) {
                        const updatedTags = [...(item.tags || [])];
                        if (!updatedTags.includes(newTag.trim())) {
                          updatedTags.push(newTag.trim());
                          handleTagUpdate(editingTags, updatedTags);
                        }
                        setNewTag('');
                      }
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {items.find(i => i.id === editingTags)?.tags?.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive"
                    onClick={() => {
                      const item = items.find(i => i.id === editingTags);
                      if (item) {
                        const updatedTags = item.tags?.filter(t => t !== tag) || [];
                        handleTagUpdate(editingTags, updatedTags);
                      }
                    }}
                  >
                    {tag}
                    <Trash2 className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {editingCategory && (
        <Dialog open={true} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select
                value={items.find(i => i.id === editingCategory)?.category || 'uncategorized'}
                onValueChange={(category) => {
                  if (editingCategory) {
                    handleCategoryUpdate(editingCategory, category);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter(cat => cat.value !== 'all').map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showingInfo && (
        <Dialog open={true} onOpenChange={() => setShowingInfo(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Image Information</DialogTitle>
            </DialogHeader>
            {(() => {
              const item = items.find(i => i.id === showingInfo);
              if (!item) return null;

              return (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Filename</h4>
                    <p className="text-sm text-muted-foreground">{item.filename}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Category</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.category || 'Uncategorized'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Type</h4>
                    <p className="text-sm text-muted-foreground">{item.contentType}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Size</h4>
                    <p className="text-sm text-muted-foreground">{formatFileSize(item.size)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Uploaded</h4>
                    <p className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</p>
                  </div>
                  {item.variants && (
                    <div>
                      <h4 className="font-medium">Available Sizes</h4>
                      <div className="space-y-2 mt-2">
                        {Object.entries(item.variants).map(([size, variant]) => (
                          <div key={size} className="flex items-center justify-between">
                            <span className="text-sm capitalize">
                              {size} ({formatFileSize(variant?.size)})
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(variant?.url, '_blank')}
                            >
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
