export interface MembershipPage {
  id: string;
  membershipId: string;  // ID of the membership required to access this page
  title: string;         // Page title
  slug: string;         // URL slug for the page
  content: {
    description?: string;  // Optional page description
    items: ContentItem[];  // List of content items
  };
  isPublished: boolean;
  createdAt: number;
  updatedAt: number;
}

export type ContentType = 
  | 'text'           // Rich text content
  | 'video'          // Video embed/upload
  | 'video-embed'    // Video embed (YouTube/Vimeo)
  | 'audio'          // Audio player
  | 'pdf'            // PDF document
  | 'image'          // Single image
  | 'image-grid';    // Multiple images in a grid

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;       // Title/heading for the content
  content: string;     // HTML content or media URL
  order: number;       // Display order
  images?: string[];   // Array of image URLs for image-grid type
  aspectRatio?: string; // Optional aspect ratio for video embeds
}

export type CreateMembershipPageInput = Omit<MembershipPage, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMembershipPageInput = Partial<CreateMembershipPageInput>;
