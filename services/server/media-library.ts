export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  path?: string;
  directory?: string;
  category?: string;
  tags?: string[];
  productId?: string;
  width?: number;
  height?: number;
  variants?: {
    thumbnail?: { url: string; size: number };
    small?: { url: string; size: number };
    medium?: { url: string; size: number };
    large?: { url: string; size: number };
    max?: { url: string; size: number };
  };
}
