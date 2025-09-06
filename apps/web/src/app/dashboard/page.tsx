"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useFileUpload } from "@/lib/use-file-upload";
import {
  Camera,
  ImageIcon,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useId } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [images, setImages] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [uploadedPaths, setUploadedPaths] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [gameType, setGameType] = useState<"INDIVIDUAL" | "GROUP">(
    "INDIVIDUAL"
  );
  const [answer, setAnswer] = useState("");
  const [hint, setHint] = useState("");
  const [time, setTime] = useState(60);
  const [currentStep, setCurrentStep] = useState(1);
  const [games, setGames] = useState<any[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const answerId = useId();
  const hintId = useId();
  const timeId = useId();
  const gameTypeId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    uploadStates,
    uploadFileWithProgress,
    deleteUploadedFile,
    clearUploadState,
  } = useFileUpload();

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/login");
    }
  }, [session, isPending]);

  useEffect(() => {
    if (session) {
      fetchGames();
    }
  }, [session]);

  // Cleanup camera stream when component unmounts or camera closes
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [cameraStream]);

  const startCamera = async (imageIndex: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera if available
      });
      setCameraStream(stream);
      setCurrentImageIndex(imageIndex);
      setIsCameraOpen(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        track.stop();
      });
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setCurrentImageIndex(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && currentImageIndex !== null) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File(
                [blob],
                `camera-capture-${Date.now()}.jpg`,
                {
                  type: "image/jpeg",
                }
              );

              setImages((prev) => {
                const newImages = [...prev];
                newImages[currentImageIndex] = file;
                return newImages;
              });

              // Keep drawer open to show the captured image
              setIsDrawerOpen(true);

              // Show success message briefly
              setShowSuccessMessage(true);
              setTimeout(() => setShowSuccessMessage(false), 2000);
            }
          },
          "image/jpeg",
          0.8
        );
      }
    }
    stopCamera();
  };

  const uploadImage = async (file: File, index: number) => {
    const fileId = `image-${index}`;
    const result = await uploadFileWithProgress(file, fileId);

    if (result.success && result.url) {
      setUploadedUrls((prev) => {
        const newUrls = [...prev];
        newUrls[index] = result.url!;
        return newUrls;
      });

      if (result.path) {
        setUploadedPaths((prev) => {
          const newPaths = [...prev];
          newPaths[index] = result.path!;
          return newPaths;
        });
      }
    }
  };

  const handleFileChange = (file: File, index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index] = file;
      return newImages;
    });
  };

  const handleCreateProjectGame = async () => {
    // Validate game data
    if (!answer.trim()) {
      toast.error("Answer is required");
      return;
    }

    if (!hint.trim()) {
      toast.error("Hint is required");
      return;
    }

    const selectedImages = images.filter((img) => img !== null);
    if (selectedImages.length !== 4) {
      toast.error(
        `Please select all 4 images. Currently selected: ${selectedImages.length}/4`
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // First upload all images
      const uploadPromises = selectedImages.map(async (file, index) => {
        const fileId = `image-${index}`;
        const result = await uploadFileWithProgress(file!, fileId);

        if (result.success && result.url) {
          setUploadedUrls((prev) => {
            const newUrls = [...prev];
            newUrls[index] = result.url!;
            return newUrls;
          });

          if (result.path) {
            setUploadedPaths((prev) => {
              const newPaths = [...prev];
              newPaths[index] = result.path!;
              return newPaths;
            });
          }
        }

        // Update progress
        setUploadProgress((prev) => prev + 100 / selectedImages.length);

        return result;
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter((r) => r.success).length;

      if (successCount !== 4) {
        toast.error(
          `Upload failed. Only ${successCount}/4 images uploaded successfully.`
        );
        return;
      }

      // Get the uploaded URLs
      const imageUrls = results
        .filter((r) => r.success && r.url)
        .map((r) => r.url!);

      // Create project and game together
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/create-game`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gameType,
            imageUrls,
            answer: answer.trim(),
            hint: hint.trim(),
            time,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Game created successfully!");
        // Reset form
        setAnswer("");
        setHint("");
        setTime(60);
        setGameType("INDIVIDUAL");
        setCurrentStep(1);
        setImages([null, null, null, null]);
        setUploadedUrls([null, null, null, null]);
        setUploadedPaths([null, null, null, null]);
        setIsDrawerOpen(false);
        // Refresh games list
        fetchGames();
      } else {
        toast.error(data.message || "Failed to create project and game");
      }
    } catch (error) {
      console.error("Project/Game creation error:", error);
      toast.error("Failed to create project and game. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return answer.trim() && hint.trim();
      case 2:
        return images.filter((img) => img !== null).length === 4;
      default:
        return false;
    }
  };

  const fetchGames = async () => {
    setIsLoadingGames(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/games`
      );
      const data = await response.json();

      if (response.ok) {
        setGames(data.data || []);
      } else {
        console.error("Failed to fetch games:", data.message);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setIsLoadingGames(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <Header /> */}

      <main className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Manage your games</p>
            </div>
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button className="px-4 py-2 font-medium">Create Game</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Create Game</DrawerTitle>
                  <DrawerDescription>
                    Step {currentStep} of 3:{" "}
                    {currentStep === 1
                      ? "Game Details"
                      : currentStep === 2
                      ? "Add Images"
                      : "Review & Create"}
                  </DrawerDescription>
                </DrawerHeader>

                <div className="max-h-[80vh] overflow-y-auto bg-background">
                  <div className="max-w-md mx-auto p-4 space-y-6">
                    {/* Step 1: Game Information */}
                    {currentStep === 1 && (
                      <Card className="bg-transparent border-none border-0">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Game Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label
                              htmlFor={gameTypeId}
                              className="block text-sm font-medium mb-2"
                            >
                              Game Type
                            </label>
                            <select
                              id={gameTypeId}
                              value={gameType}
                              onChange={(e) =>
                                setGameType(
                                  e.target.value as "INDIVIDUAL" | "GROUP"
                                )
                              }
                              className="w-full p-2 border border-input rounded-md bg-background"
                            >
                              <option value="INDIVIDUAL">Individual</option>
                              <option value="GROUP">Group</option>
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor={answerId}
                              className="block text-sm font-medium mb-2"
                            >
                              Answer *
                            </label>
                            <Input
                              id={answerId}
                              value={answer}
                              onChange={(e) => setAnswer(e.target.value)}
                              placeholder="Enter the correct answer"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={hintId}
                              className="block text-sm font-medium mb-2"
                            >
                              Hint *
                            </label>
                            <Input
                              id={hintId}
                              value={hint}
                              onChange={(e) => setHint(e.target.value)}
                              placeholder="Enter a hint for the answer"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={timeId}
                              className="block text-sm font-medium mb-2"
                            >
                              Time Limit (seconds)
                            </label>
                            <Input
                              id={timeId}
                              type="number"
                              value={time}
                              onChange={(e) => setTime(Number(e.target.value))}
                              placeholder="60"
                              className="w-full"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Step 2: Images Section */}
                    {currentStep === 2 && (
                      <Card className="bg-transparent border-none border-0">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            Add 4 Images
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {showSuccessMessage && (
                            <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-800 text-sm text-center">
                              ✅ Image captured successfully!
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map((item, index) => (
                              <div
                                key={`image-slot-${item}`}
                                className="relative"
                              >
                                <div className="relative aspect-square w-full">
                                  {images[index] ? (
                                    <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-primary bg-primary/5">
                                      <Image
                                        src={URL.createObjectURL(
                                          images[index]!
                                        )}
                                        alt={`Upload ${index + 1}`}
                                        fill
                                        className="object-cover"
                                      />

                                      <button
                                        type="button"
                                        onClick={() => {
                                          // Clear local state only
                                          setImages((prev) => {
                                            const newImages = [...prev];
                                            newImages[index] = null;
                                            return newImages;
                                          });
                                        }}
                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:bg-destructive/90 transition-colors"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      className="aspect-square w-full border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                                      onClick={() => {
                                        const fileInput =
                                          document.querySelector(
                                            `input[type="file"][data-index="${index}"]`
                                          ) as HTMLInputElement;
                                        fileInput?.click();
                                      }}
                                    >
                                      <div className="text-center">
                                        <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground">
                                          Tap to upload
                                        </p>
                                      </div>
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        data-index={index}
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            handleFileChange(file, index);
                                          }
                                        }}
                                      />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Find first empty slot and start camera
                                const firstEmptyIndex = images.findIndex(
                                  (img) => img === null
                                );
                                if (firstEmptyIndex !== -1) {
                                  startCamera(firstEmptyIndex);
                                }
                              }}
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Camera
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Find first empty slot and trigger file input
                                const firstEmptyIndex = images.findIndex(
                                  (img) => img === null
                                );
                                if (firstEmptyIndex !== -1) {
                                  const fileInput = document.querySelector(
                                    `input[type="file"][data-index="${firstEmptyIndex}"]`
                                  ) as HTMLInputElement;
                                  fileInput?.click();
                                }
                              }}
                            >
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Gallery
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Step 3: Review & Create */}
                    {currentStep === 3 && (
                      <Card className="bg-transparent border-none border-0">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Review & Create
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">Game Details:</h4>
                            <p>
                              <strong>Type:</strong> {gameType}
                            </p>
                            <p>
                              <strong>Answer:</strong> {answer}
                            </p>
                            <p>
                              <strong>Hint:</strong> {hint}
                            </p>
                            <p>
                              <strong>Time Limit:</strong> {time} seconds
                            </p>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium">
                              Images (
                              {images.filter((img) => img !== null).length}/4):
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {images.map((img, index) => (
                                <div
                                  key={`review-image-${
                                    img ? img.name : `empty-${index}`
                                  }`}
                                  className="aspect-square border rounded-lg overflow-hidden"
                                >
                                  {img ? (
                                    <Image
                                      src={URL.createObjectURL(img)}
                                      alt={`Preview ${index + 1}`}
                                      width={100}
                                      height={100}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                                      No image
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Step Navigation - appears on all steps */}
                    <div className="mt-6">
                      {currentStep === 3 ? (
                        <Button
                          className="w-full"
                          onClick={handleCreateProjectGame}
                          disabled={
                            images.filter((img) => img !== null).length !== 4 ||
                            isUploading ||
                            !answer.trim() ||
                            !hint.trim()
                          }
                        >
                          {isUploading ? (
                            <div className="flex items-center gap-2">
                              <Upload className="w-4 h-4 animate-pulse" />
                              Creating... {Math.round(uploadProgress)}%
                            </div>
                          ) : (
                            `Create Game (${
                              images.filter((img) => img !== null).length
                            }/4 images)`
                          )}
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          {currentStep > 1 && (
                            <Button
                              variant="outline"
                              onClick={prevStep}
                              className="flex-1"
                            >
                              Previous
                            </Button>
                          )}
                          <Button
                            onClick={nextStep}
                            disabled={!canProceedToNext()}
                            className="flex-1"
                          >
                            Next
                          </Button>
                        </div>
                      )}

                      {isUploading && (
                        <div className="mt-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Games List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Games</h2>
              <Button
                variant="outline"
                onClick={fetchGames}
                disabled={isLoadingGames}
              >
                {isLoadingGames ? "Loading..." : "Refresh"}
              </Button>
            </div>

            {isLoadingGames ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading games...</p>
                </div>
              </div>
            ) : games.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-lg">No games yet</p>
                  <p>Create your first game to get started!</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <Card key={game.Id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg truncate">
                          {game.gameName}
                        </CardTitle>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {game.gameType}
                        </span>
                      </div>
                      {game.project && (
                        <CardDescription>
                          Project: {game.project.projectName}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Game Images Preview */}
                      <div className="grid grid-cols-2 gap-2">
                        {(() => {
                          // Pre-filter valid URLs to avoid Next.js processing invalid ones
                          const validUrls = game.imageUrls
                            .slice(0, 4)
                            .filter((url: string) => {
                              return (
                                url &&
                                !url.includes("example.com") &&
                                (url.startsWith("http://") ||
                                  url.startsWith("https://"))
                              );
                            });

                          // Render valid images
                          const validImageElements = validUrls.map(
                            (url: string, index: number) => (
                              <div
                                key={`${game.Id}-image-${index}`}
                                className="aspect-square rounded-lg overflow-hidden bg-muted"
                              >
                                <Image
                                  src={url}
                                  alt={`Game image ${index + 1}`}
                                  width={100}
                                  height={100}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Hide the image and show placeholder on error
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `
                                      <div class="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                                        <ImageIcon class="w-6 h-6" />
                                      </div>
                                    `;
                                    }
                                  }}
                                />
                              </div>
                            )
                          );

                          // Add placeholders for remaining slots
                          const placeholderElements = Array.from({
                            length: Math.max(0, 4 - validUrls.length),
                          }).map((_, index) => (
                            <div
                              key={`${game.Id}-placeholder-${index}`}
                              className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center text-muted-foreground text-xs"
                            >
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          ));

                          return [
                            ...validImageElements,
                            ...placeholderElements,
                          ];
                        })()}
                      </div>

                      {/* Game Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Answer:</span>
                          <span className="font-medium">{game.answer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hint:</span>
                          <span className="font-medium">{game.hint}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time:</span>
                          <span className="font-medium">{game.time}s</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          Play
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Camera Preview Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex-1 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Camera Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={stopCamera}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </Button>
              <Button
                size="lg"
                onClick={capturePhoto}
                className="bg-white text-black hover:bg-white/90 w-16 h-16 rounded-full p-0"
              >
                <Camera className="w-8 h-8" />
              </Button>
              <div className="w-16 h-16" /> {/* Spacer for centering */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
