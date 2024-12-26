import React, { useState, useMemo } from "react";
import { Button } from "components/ui/button";
import { Check, Trash2, Grid, List, Tag, Plus, Info, FolderPlus } from "lucide-react";
import type { MediaItem } from "services/server/media-library";
import { Input } from "components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { Badge } from "components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "components/ui/dialog";
import { useToast } from "components/ui/use-toast";

interface MediaLibraryProps {
  items: MediaItem[];
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  selectedUrl?: string;
  onSelect: (item: MediaItem) => void;
  onDelete?: (item: MediaItem) => void;
  onUpdateTags?: (id: string, tags: string[]) => Promise<void>;
  onUpdateCategory?: (id: string, category: string) => Promise<void>;
  isDeleting?: string;
  onCategoryChange?: (category: string) => void;
  onSearch?: (term: string) => void;
  itemsPerPage?: number;
}

const DEFAULT_ITEMS_PER_PAGE = 20;

const CATEGORIES = [
  { value: "all", label: "Alle" },
  { value: "general", label: "Allgemein" },
  { value: "products", label: "Produkte" },
  { value: "banners", label: "Banner" },
  { value: "gallery", label: "Galerie" },
  { value: "uncategorized", label: "Nicht kategorisiert" }
];

export function MediaLibrary({
  items,
  total,
  currentPage,
  onPageChange,
  selectedUrl,
  onSelect,
  onDelete,
  onUpdateTags,
  onUpdateCategory,
  isDeleting,
  onCategoryChange,
  onSearch,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE
}: MediaLibraryProps) {
  const { toast } = useToast();
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

  const allTags = useMemo(() => {
    if (!Array.isArray(items)) return [];
    const tags = new Set<string>();
    items.forEach(item => {
      item?.tags?.forEach((tag: string) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [items]);

  const totalPages = Math.ceil(total / itemsPerPage);

  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return "Unbekannte Größe";
    
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
          title: "Erfolg",
          description: "Tags erfolgreich aktualisiert",
        });
        setEditingTags(null);
      } catch (error) {
        toast({
          title: "Fehler",
          description: "Tags konnten nicht aktualisiert werden",
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
          title: "Erfolg",
          description: "Kategorie erfolgreich aktualisiert",
        });
        setEditingCategory(null);
      } catch (error) {
        toast({
          title: "Fehler",
          description: "Kategorie konnte nicht aktualisiert werden",
          variant: "destructive",
        });
      }
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
    if (onCategoryChange) {
      onCategoryChange(value);
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
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select 
              value={selectedCategory} 
              onValueChange={handleCategorySelect}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kategorie..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
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
            {allTags.map((tag: string) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter((t: string) => t !== tag)
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
          {items.map((item) => (
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
                  <div>{item.category || 'Nicht kategorisiert'}</div>
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
            <div>Datum</div>
            <div>Größe</div>
            <div>Aktionen</div>
          </div>
          <div className="divide-y">
            {items.map((item) => (
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
                      src={item.variants?.thumbnail?.url ?? item.url}
                      alt={getDisplayName(item)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{item.filename}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.category || 'Nicht kategorisiert'}
                    </span>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {item.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>{formatDate(item.createdAt)}</div>
                <div>{formatFileSize(item.size)}</div>
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
                      <FolderPlus className="h-4 w-4" />
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

      {items.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          {searchTerm ? "Keine Bilder entsprechen Ihrer Suche" : "Noch keine Bilder hochgeladen"}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Zeige {((currentPage - 1) * itemsPerPage) + 1} bis {Math.min(currentPage * itemsPerPage, total)} von {total} Elementen
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Zurück
            </Button>
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Weiter
            </Button>
          </div>
        </div>
      )}

      {editingTags && (
        <Dialog open={true} onOpenChange={() => setEditingTags(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tags bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Neuen Tag hinzufügen..."
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
                  Hinzufügen
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {items.find(i => i.id === editingTags)?.tags?.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive"
                    onClick={() => {
                      const item = items.find(i => i.id === editingTags);
                      if (item) {
                        const updatedTags = item.tags?.filter((t: string) => t !== tag) || [];
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
              <DialogTitle>Kategorie bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select
                value={items.find(i => i.id === editingCategory)?.category || 'uncategorized'}
                onValueChange={(category) => {
                  if (editingCategory && CATEGORIES.some(cat => cat.value === category)) {
                    handleCategoryUpdate(editingCategory, category);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie auswählen" />
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
              <DialogTitle>Bildinformationen</DialogTitle>
            </DialogHeader>
            {(() => {
              const item = items.find(i => i.id === showingInfo);
              if (!item) return null;

              return (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Dateiname</h4>
                    <p className="text-sm text-muted-foreground">{item.filename}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Kategorie</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.category || 'Nicht kategorisiert'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Typ</h4>
                    <p className="text-sm text-muted-foreground">{item.contentType}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Größe</h4>
                    <p className="text-sm text-muted-foreground">{formatFileSize(item.size)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Hochgeladen</h4>
                    <p className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</p>
                  </div>
                  {item.variants && (
                    <div>
                      <h4 className="font-medium">Verfügbare Größen</h4>
                      <div className="space-y-2 mt-2">
                        {Object.entries(item.variants).map(([size, variant]) => (
                          <div key={size} className="flex items-center justify-between">
                            <span className="text-sm capitalize">
                              {size} ({formatFileSize(variant?.size)})
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (variant?.url) {
                                  window.open(variant.url, '_blank');
                                }
                              }}
                            >
                              Anzeigen
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
