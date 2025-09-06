// import React, { useRef } from 'react'
// import { Button } from '../ui/button';
// import { Upload } from 'lucide-react';
// import { X } from 'lucide-react';

// const imageUpload = ({ index, image, handleImageUpload, handleClick }: { index: number, image: string, handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void, handleClick: () => void }) => {
 
//     const 
                
//                     const handleClick = () => {
//                   inputRef.current?.click();
//                 };

//                 const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//                   const file = e.target.files?.[0];
//                   if (file) {
//                     const reader = new FileReader();
//                     reader.onload = (e) => {
//                       const imageUrl = e.target?.result as string;
//                       // Here you would update the images array with the new image
//                       console.log("Uploaded image:", imageUrl);
//                     };
//                     reader.readAsDataURL(file);
//                   }
//                 };

//                 return (
//                   <div key={index} className="relative">
//                     <button
//                       className={`aspect-square h-[100px] bg-transparent w-full border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
//                         image
//                           ? "border-primary bg-primary/5"
//                           : "border-muted-foreground hover:border-primary hover:bg-primary/5"
//                       }`}
//                       onClick={handleClick}
//                     >
//                       {image ? (
//                         <img
//                           src={image || "/placeholder.svg"}
//                           alt={`Upload ${index + 1}`}
//                           className="w-full h-full object-cover rounded-lg"
//                         />
//                       ) : (
//                         <div className="text-center">
//                           <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
//                           <p className="text-xs text-white z-10">Tap to upload</p>
//                         </div>
//                       )}
//                     </button>

//                     {image && (
//                       <Button
//                         variant="destructive"
//                         size="sm"
//                         className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           // Here you would remove the image from the images array
//                           console.log("Remove image at index:", index);
//                         }}
//                       >
//                         <X className="w-3 h-3" />
//                       </Button>
//                     )}

//                     <input
//                       ref={inputRef}
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       onChange={handleImageUpload}
//                     />
//                   </div>
//                 );

// export default imageUpload
