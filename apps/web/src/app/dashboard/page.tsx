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
import { Camera, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// const images = ["/test1.jpeg", "/test2.jpeg", "/test3.jpeg", "/test4.jpeg"];

export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [images, setImages] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/login");
    }
  }, [session, isPending]);

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

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex flex-row gap-5 justify-between">
          <div className="">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Welcome back, {session?.user?.name || "User"}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your account today.
            </p>
          </div>
          <div className="">
            <Drawer>
              <DrawerTrigger>Create New Game</DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Create New Game?</DrawerTitle>
                  <DrawerDescription>
                    Create a new game to play with your friends.
                  </DrawerDescription>
                </DrawerHeader>

                <div className="min-h-screen bg-background">
                  <div className="max-w-md mx-auto p-4 space-y-6">
                    <Card className=" bg-transparent border-none border-0">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ImageIcon className="w-5 h-5" />
                          Step 1: Add 4 Images
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          {[1, 2, 3, 4].map((_, index) => (
                            <div key={index} className="relative">
                              <div className="relative aspect-square w-full">
                                {images[index] ? (
                                  <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-primary bg-primary/5">
                                    <Image
                                      src={URL.createObjectURL(images[index]!)}
                                      alt={`Upload ${index + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                    <button
                                      onClick={() => {
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
                                  <label className="cursor-pointer">
                                    <div className="aspect-square w-full border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors">
                                      <div className="text-center">
                                        <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground">
                                          Tap to upload
                                        </p>
                                      </div>
                                    </div>
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      data-index={index}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setImages((prev) => {
                                            const newImages = [...prev];
                                            newImages[index] = file;
                                            return newImages;
                                          });
                                        }
                                      }}
                                    />
                                  </label>
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
                            onClick={() => {
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
                            <Camera className="w-4 h-4 mr-2" />
                            Camera
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => {
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
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest gaming sessions and achievements.
              </CardDescription>
            </CardHeader>
            <div className="text-center py-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-muted-foreground mx-auto mb-4"
              >
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z" />
                <path d="M3 12h18" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
              <p className="text-muted-foreground mb-4">
                Start playing games to see your activity here.
              </p>
              <Button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <path d="M8 2v4" />
                  <path d="M16 2v4" />
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <path d="M3 10h18" />
                </svg>
                Start Your First Game
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
