import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface GalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  galleryImages: string[];
  selectedImage: string | null;
  setSelectedImage: (url: string | null) => void;
  selectedImageIndex: number | null;
  setSelectedImageIndex: (idx: number | null) => void;
}

export const GalleryDialog: React.FC<GalleryDialogProps> = ({
  open,
  onOpenChange,
  galleryImages,
  selectedImage,
  setSelectedImage,
  selectedImageIndex,
  setSelectedImageIndex,
}) => {
  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) { setSelectedImage(null); setSelectedImageIndex(null); }
    }}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Previzualizare galerie</DialogTitle>
        </DialogHeader>
        {selectedImage ? (
          <div className="py-4 flex flex-col items-center">
            <div className="relative max-h-[70vh] overflow-hidden">
              {galleryImages.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-muted/60 hover:bg-muted/80 rounded-full p-2"
                    onClick={() => {
                      const len = galleryImages.length;
                      let idx = selectedImageIndex ?? galleryImages.findIndex((img) => `https://darurialese.ro/wp-content/uploads/${img}` === selectedImage);
                      if (idx < 0) idx = 0;
                      const prev = (idx - 1 + len) % len;
                      setSelectedImage(`https://darurialese.ro/wp-content/uploads/${galleryImages[prev]}`);
                      setSelectedImageIndex(prev);
                    }}
                    aria-label="Previous"
                    title="Previous"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-muted/60 hover:bg-muted/80 rounded-full p-2"
                    onClick={() => {
                      const len = galleryImages.length;
                      let idx = selectedImageIndex ?? galleryImages.findIndex((img) => `https://darurialese.ro/wp-content/uploads/${img}` === selectedImage);
                      if (idx < 0) idx = 0;
                      const next = (idx + 1) % len;
                      setSelectedImage(`https://darurialese.ro/wp-content/uploads/${galleryImages[next]}`);
                      setSelectedImageIndex(next);
                    }}
                    aria-label="Next"
                    title="Next"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <img 
                src={selectedImage}
                alt="Imagine galerie mărită"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSelectedImage(null)}
              className="mt-4"
            >
              Înapoi la galerie
            </Button>
          </div>
        ) : (
          <div className="py-4">
            <div className="grid grid-cols-3 gap-4">
              {galleryImages.map((image, index) => (
                <div 
                  key={index} 
                  className="relative aspect-square overflow-hidden rounded-md border border-border cursor-pointer"
                  onClick={() => { setSelectedImage(`https://darurialese.ro/wp-content/uploads/${image}`); setSelectedImageIndex(index); }}
                >
                  <img 
                    src={`https://darurialese.ro/wp-content/uploads/${image}`}
                    alt={`Imagine galerie ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Închide
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryDialog;
