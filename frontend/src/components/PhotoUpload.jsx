import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PhotoUpload({ photos = [], onChange, maxPhotos = 6, minPhotos = 1 }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (photos.length + imageFiles.length > maxPhotos) {
      alert(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    // Convert files to preview URLs
    const newPhotos = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
    }));

    onChange([...photos, ...newPhotos]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  const removePhoto = (id) => {
    const updatedPhotos = photos.filter(photo => photo.id !== id);
    // Revoke object URL to prevent memory leak
    const photoToRemove = photos.find(photo => photo.id === id);
    if (photoToRemove?.preview) {
      URL.revokeObjectURL(photoToRemove.preview);
    }
    onChange(updatedPhotos);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-2 mb-4">
          <AnimatePresence>
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="relative aspect-square rounded-xl sm:rounded-2xl md:rounded-lg overflow-hidden group"
              >
                <img
                  src={photo.preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <motion.button
                  onClick={() => removePhoto(photo.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-2 right-2 md:top-1 md:right-1 bg-[#FF91A4] text-white rounded-full p-1.5 sm:p-2 md:p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 md:w-3 md:h-3" />
                </motion.button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 md:bottom-1 md:left-1 bg-[#FF91A4] text-white text-xs md:text-[10px] px-2 py-1 md:px-1.5 md:py-0.5 rounded-lg md:rounded font-medium">
                    Main
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Area */}
      {photos.length < maxPhotos && (
        <motion.div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            border-2 border-dashed rounded-xl sm:rounded-2xl md:rounded-lg p-6 sm:p-8 md:p-4
            cursor-pointer transition-all
            ${dragActive 
              ? 'border-[#FF91A4] bg-[#FFF0F5]' 
              : 'border-[#FFB6C1] hover:border-[#FF91A4] bg-white'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ y: dragActive ? -5 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {photos.length === 0 ? (
                <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 md:w-10 md:h-10 text-[#FF91A4] mb-3 sm:mb-4 md:mb-2" />
              ) : (
                <Upload className="w-8 h-8 sm:w-12 sm:h-12 md:w-8 md:h-8 text-[#FF91A4] mb-3 sm:mb-4 md:mb-2" />
              )}
            </motion.div>
            
            <p className="text-sm sm:text-base md:text-xs font-medium text-[#212121] mb-1">
              {photos.length === 0 
                ? 'Upload your photos' 
                : `Add more photos (${photos.length}/${maxPhotos})`
              }
            </p>
            <p className="text-xs sm:text-sm md:text-[10px] text-[#757575]">
              Drag & drop or click to browse
            </p>
            <p className="text-xs md:text-[10px] text-[#757575] mt-1">
              {minPhotos} photo minimum, {maxPhotos} maximum
            </p>
          </div>
        </motion.div>
      )}

      {/* Photo Count */}
      {photos.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs sm:text-sm md:text-[10px] text-[#757575] mt-3 md:mt-2 text-center"
        >
          {photos.length} photo{photos.length > 1 ? 's' : ''} uploaded
          {photos.length < minPhotos && (
            <span className="text-[#FF91A4] ml-1">
              (Add at least {minPhotos} photo{minPhotos > 1 ? 's' : ''})
            </span>
          )}
        </motion.p>
      )}
    </div>
  );
}

