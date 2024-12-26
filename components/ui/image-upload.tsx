import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "components/ui/button";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select";

interface ImageUploadProps {
  onUpload: (file: File, category: string) => Promise<void>;
  isUploading?: boolean;
  accept?: string[];
}

export function ImageUpload({ 
  onUpload, 
  isUploading = false,
  accept = ["image/jpeg", "image/png", "image/webp"]
}: ImageUploadProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("general");

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        await onUpload(selectedFile, selectedCategory);
        setSelectedFile(null);
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
      }
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 cursor-pointer
          transition-colors duration-200 ease-in-out
          flex flex-col items-center justify-center gap-2
          ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300"}
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} disabled={isUploading} />
        <div className="flex flex-col items-center gap-2">
          {isDragActive ? (
            <Upload className="w-8 h-8 text-primary" />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-400" />
          )}
          <div className="text-sm text-center">
            {isDragActive ? (
              <p>Drop the image here</p>
            ) : (
              <>
                <p>Drag & drop an image here, or click to select</p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: {accept.join(", ")}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium mb-2">Selected file:</p>
              <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="products">Products</SelectItem>
                <SelectItem value="banners">Banners</SelectItem>
                <SelectItem value="gallery">Gallery</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
      )}
    </div>
  );
}
