"use client";
import { useMutation } from "@apollo/client";
import { CREATE_POST } from "@/graphql/post";
import { useGetAdminSpecializationsQuery } from "@/generated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useRef, useEffect } from "react";

import {
  Loader2,
  PenTool,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Rocket,
  ImagePlus,
  FileVideo,
  Volume2,
  XCircle,
  Scale,
} from "lucide-react";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [specialization, setSpecialization] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [easterEggActive, setEasterEggActive] = useState(false);
  const [konamiCode, setKonamiCode] = useState<string[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const { data: specData } = useGetAdminSpecializationsQuery();

  // Konami Code sequence: ↑↑↓↓←→←→BA
  const konamiSequence = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "KeyB",
    "KeyA",
  ];

  // Easter egg: Konami code detection
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      const newSequence = [...konamiCode, e.code].slice(-10);
      setKonamiCode(newSequence);

      if (
        JSON.stringify(newSequence.slice(-10)) ===
        JSON.stringify(konamiSequence)
      ) {
        setEasterEggActive(true);
        setSuccess("🎉 Konami Code activated! Developer mode enabled! 🚀");
        setTimeout(() => setSuccess(null), 5000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiCode]);

  const [createPost, { loading }] = useMutation(CREATE_POST, {
    onCompleted: () => {
      const successMsg = easterEggActive
        ? "🚀 Post created with developer magic! ✨"
        : "Нийтлэл амжилттай үүслээ!";
      setSuccess(successMsg);

      setTitle("");
      setContent("");
      setSpecialization([]);
      setImage(null);
      setVideo(null);
      setAudio(null);
      setTimeout(() => setSuccess(null), 3000);

      if (imageInputRef.current) imageInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
      if (audioInputRef.current) audioInputRef.current.value = "";
    },
    onError: (error) => {
      setError(error.message || "Нийтлэл үүсгэхэд алдаа гарлаа.");
      setTimeout(() => setError(null), 3000);
    },
  });

  const uploadToCloudflare = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setUploading(false);
      if (data?.url) return data.url;
      setError("Файл илгээхэд алдаа гарлаа.");
      return null;
    } catch {
      setError("Файл илгээхэд алдаа гарлаа.");
      setUploading(false);
      return null;
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video" | "audio"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadToCloudflare(file);
    if (url) {
      if (type === "image") setImage(url);
      else if (type === "video") setVideo(url);
      else if (type === "audio") setAudio(url);
    }
  };

  const removeFile = (type: "image" | "video" | "audio") => {
    if (type === "image") {
      setImage(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
    } else if (type === "video") {
      setVideo(null);
      if (videoInputRef.current) videoInputRef.current.value = "";
    } else if (type === "audio") {
      setAudio(null);
      if (audioInputRef.current) audioInputRef.current.value = "";
    }
  };

  // Easter egg: Triple click detector
  const handleTitleClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 500) {
      setClickCount((prev) => prev + 1);
      if (clickCount >= 2) {
        setTitle("☕ Coding with coffee since 1995 ☕");
        setContent(
          "// TODO: Write amazing code\n// FIXME: Remove this easter egg before production\n// NOTE: If you're reading this, you found our secret! 🎯\n\nconsole.log('Hello, fellow developer! 👋');\n\n// Fun fact: This component has been clicked with love ❤️"
        );
        setClickCount(0);
      }
    } else {
      setClickCount(1);
    }
    setLastClickTime(now);
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      setError("Гарчиг болон агуулгыг бөглөнө үү.");
      setTimeout(() => setError(null), 1500);
      return;
    }
    createPost({
      variables: {
        input: {
          title,
          specialization,
          content: {
            text: content,
            image: image || undefined,
            video: video || undefined,
            audio: audio || undefined,
          },
        },
      },
    });
  };

  const getRandomEmoji = () => {
    const emojis = ["🚀", "⚡", "🔥", "✨", "🎯", "💻", "🎉", "🌟"];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card
        className={`shadow-lg transition-all duration-300 border-none ${
          easterEggActive
            ? "ring-2 ring-purple-500 ring-opacity-50 shadow-purple-200"
            : "hover:shadow-xl"
        }`}
      >
        <CardHeader className="space-y-1">
          <CardTitle
            className="text-2xl font-bold text-[#091c3c] flex items-center gap-2 cursor-pointer select-none"
            onClick={handleTitleClick}
          >
            <PenTool className="h-6 w-6 text-[#091c3c]" />
            Шинэ нийтлэл үүсгэх
            {easterEggActive && (
              <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {easterEggActive ? "🎮 Developer mode activated! " : ""}
            Хэрэглэгчдийн хуулийн мэдлэг олгох зөвлөгөө нийтлэл бичнэ үү
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert
              variant="destructive"
              className="animate-in slide-in-from-top-2"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50 text-green-700 animate-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Title Input */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium flex items-center gap-2"
            >
              Гарчиг
            </Label>
            <Input
              id="title"
              placeholder="Title ..."
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              className={`transition-all duration-200 ${
                easterEggActive
                  ? "border-purple-300 focus:border-purple-500"
                  : ""
              }`}
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {title.length > 60 && "📝 Getting long there!"}
              </div>
              <div className="text-xs text-muted-foreground">
                {title.length}/80
              </div>
            </div>
          </div>

          {/* Content Textarea */}
          <div className="space-y-2">
            <Label
              htmlFor="content"
              className="text-sm font-medium flex items-center gap-2"
            >
              Агуулга
            </Label>
            <Textarea
              id="content"
              placeholder={
                easterEggActive
                  ? "// Write your epic content here 🚀"
                  : "Text..."
              }
              rows={6}
              value={content}
              maxLength={3000}
              onChange={(e) => setContent(e.target.value)}
              className={`transition-all duration-200 resize-none ${
                easterEggActive
                  ? "border-purple-300 focus:border-purple-500 font-mono"
                  : ""
              }`}
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {content.length > 2500 && (
                  <>
                    <Zap className="h-3 w-3" />
                    Almost there!
                  </>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {content.length}/3000
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Салбар
            </Label>
            <div className="flex flex-wrap gap-2">
              {specData?.getAdminSpecializations?.map(
                (spec: { id: string; categoryName: string }) => (
                  <Badge
                    key={spec.id}
                    variant={
                      specialization.includes(spec.id) ? "default" : "outline"
                    }
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 border-gray-200 rounded-4xl ${
                      specialization.includes(spec.id)
                        ? easterEggActive
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                          : "bg-blue-600 hover:bg-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() =>
                      setSpecialization((prev) =>
                        prev.includes(spec.id)
                          ? prev.filter((id) => id !== spec.id)
                          : [...prev, spec.id]
                      )
                    }
                  >
                    {spec.categoryName}
                    {specialization.includes(spec.id) && easterEggActive && (
                      <span className="ml-1">{getRandomEmoji()}</span>
                    )}
                  </Badge>
                )
              )}
            </div>
          </div>

          {/* File Upload Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Image Upload */}
            <div
              className={`border border-dashed rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                easterEggActive
                  ? "border-purple-300 hover:border-purple-500 hover:bg-purple-50"
                  : "border-gray-300 hover:border-green-500 hover:bg-green-50"
              } flex flex-col items-center justify-center relative min-h-[140px]`}
            >
              <Label
                onClick={() => imageInputRef.current?.click()}
                className="cursor-pointer flex flex-col gap-2 items-center w-full"
              >
                <ImagePlus
                  className={`h-8 w-8 ${
                    easterEggActive ? "text-purple-500" : "text-green-600"
                  }`}
                />
                <span className="text-sm font-medium">Зураг</span>
              </Label>
              <Input
                type="file"
                accept="image/*"
                hidden
                ref={imageInputRef}
                onChange={(e) => handleFileUpload(e, "image")}
              />
              {image && (
                <div className="relative mt-2">
                  <img
                    src={image}
                    alt="preview"
                    className="max-h-24 rounded shadow-md"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-white border border-gray-300 hover:bg-red-100"
                    onClick={() => removeFile("image")}
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div
              className={`border border-dashed rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                easterEggActive
                  ? "border-purple-300 hover:border-purple-500 hover:bg-purple-50"
                  : "border-gray-300 hover:border-orange-500 hover:bg-orange-50"
              } flex flex-col items-center justify-center relative min-h-[140px]`}
            >
              <Label
                onClick={() => videoInputRef.current?.click()}
                className="cursor-pointer flex flex-col gap-2 items-center w-full"
              >
                <FileVideo
                  className={`h-8 w-8 ${
                    easterEggActive ? "text-purple-500" : "text-orange-600"
                  }`}
                />
                <span className="text-sm font-medium">Видео</span>
              </Label>
              <Input
                type="file"
                accept="video/*"
                hidden
                ref={videoInputRef}
                onChange={(e) => handleFileUpload(e, "video")}
              />
              {video && (
                <div className="relative mt-2">
                  <video
                    src={video}
                    controls
                    className="max-h-24 rounded shadow-md"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-white border border-gray-300 hover:bg-red-100"
                    onClick={() => removeFile("video")}
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
            </div>

            {/* Audio Upload */}
            <div
              className={`border border-dashed rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                easterEggActive
                  ? "border-purple-300 hover:border-purple-500 hover:bg-purple-50"
                  : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              } flex flex-col items-center justify-center relative min-h-[140px]`}
            >
              <Label
                onClick={() => audioInputRef.current?.click()}
                className="cursor-pointer flex flex-col gap-2 items-center w-full"
              >
                <Volume2
                  className={`h-8 w-8 ${
                    easterEggActive ? "text-purple-500" : "text-blue-600"
                  }`}
                />
                <span className="text-sm font-medium">Аудио</span>
              </Label>
              <Input
                type="file"
                accept="audio/*"
                hidden
                ref={audioInputRef}
                onChange={(e) => handleFileUpload(e, "audio")}
              />
              {audio && (
                <div className="relative mt-2 w-full">
                  <audio
                    src={audio}
                    controls
                    className="w-full max-w-[120px]"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-white border border-gray-300 hover:bg-red-100"
                    onClick={() => removeFile("audio")}
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading || uploading || !title.trim() || !content.trim()}
            className={`w-full h-12 text-base font-medium transition-all duration-300 ${
              easterEggActive
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading || uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {easterEggActive
                  ? "Deploying awesome content..."
                  : uploading
                  ? "Файл илгээж байна..."
                  : "Илгээж байна..."}
              </>
            ) : (
              <>
                {easterEggActive ? (
                  <Rocket className="mr-2 h-4 w-4" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {easterEggActive ? "Launch Post 🚀" : "Нийтлэх"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePost;
