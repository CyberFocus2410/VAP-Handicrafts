"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle2, Sparkles, Heart, AlertCircle, ArrowRight } from "lucide-react";
import { type ProductDetail } from "@/server/catalogue/types";
import { useCartStore } from "@/lib/cart/cart-store";
import { PERSONALIZATION_TEMPLATES, type PersonalizationTemplate } from "@/lib/personalization/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PersonalizationBuilderProps {
  product: ProductDetail;
}

export function PersonalizationBuilder({ product }: PersonalizationBuilderProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [selectedTemplateKey, setSelectedTemplateKey] = React.useState<string>("polaroid");
  const template = PERSONALIZATION_TEMPLATES[selectedTemplateKey] || PERSONALIZATION_TEMPLATES.polaroid;

  // Form state
  const [recipientName, setRecipientName] = React.useState("");
  const [senderName, setSenderName] = React.useState("");
  const [occasion, setOccasion] = React.useState("Birthday");
  const [caption, setCaption] = React.useState("");
  const [message, setMessage] = React.useState("");

  // Upload state
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [photoUploadId, setPhotoUploadId] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // Variant state
  const [selectedVariantId, setSelectedVariantId] = React.useState(
    product.variants[0]?.id || ""
  );

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Client size check
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size exceeds 10MB limit. Please select a smaller photo.");
      return;
    }

    // Local object URL for instant preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setPhotoUploadId(data.assetId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload photo";
      setUploadError(msg);
      setPhotoUploadId(null);
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid = React.useMemo(() => {
    if (selectedTemplateKey === "polaroid") {
      return Boolean(recipientName.trim() && caption.trim() && (photoUploadId || previewUrl));
    }
    return Boolean(recipientName.trim() && message.trim());
  }, [selectedTemplateKey, recipientName, caption, photoUploadId, previewUrl, message]);

  const handleAddToCart = () => {
    if (!isFormValid || !selectedVariant) return;

    addItem({
      productId: product.id,
      productSlug: product.slug,
      variantId: selectedVariant.id,
      quantity: 1,
      customization: {
        templateId: selectedTemplateKey,
        recipientName: recipientName.trim(),
        senderName: senderName.trim() || undefined,
        occasion,
        caption: caption.trim() || undefined,
        message: message.trim() || undefined,
        photoUploadId: photoUploadId || undefined,
        photoPreviewUrl: previewUrl || undefined,
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* Left Column: Form & Options (7 cols) */}
      <div className="lg:col-span-7 space-y-8 bg-surface p-6 sm:p-8 rounded-lg border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-rose-deep" />
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-deep">
              Personalized Keepsake Studio
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-cocoa">
            Customize for Your Favourite Person
          </h2>
          <p className="mt-1 text-sm text-cocoa-muted leading-relaxed">
            Pair your handcrafted {product.name} with a personalized card or polaroid keepsake.
          </p>
        </div>

        {/* Template Selector */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-cocoa">Choose Keepsake Format:</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(PERSONALIZATION_TEMPLATES).map((t) => {
              const isSelected = selectedTemplateKey === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplateKey(t.id)}
                  className={`text-left p-4 rounded-md border transition-all ${
                    isSelected
                      ? "border-rose-deep bg-blush/20 ring-1 ring-rose-deep"
                      : "border-border bg-surface hover:border-cocoa/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-sm text-cocoa">{t.title}</span>
                    <Badge variant={isSelected ? "default" : "secondary"} className="text-[10px]">
                      {t.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-cocoa-muted leading-relaxed">{t.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-5 pt-2">
          {selectedTemplateKey === "polaroid" && (
            <div className="space-y-2">
              <Label htmlFor="photoUpload" className="text-xs font-medium text-cocoa flex items-center justify-between">
                <span>Upload Photograph <span className="text-rose-deep">*</span></span>
                <span className="text-[11px] text-cocoa-muted">JPG, PNG, WebP (Max 10MB)</span>
              </Label>
              <div className="relative border-2 border-dashed border-border rounded-md p-6 text-center hover:bg-bg/50 transition-colors">
                <input
                  id="photoUpload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Upload photo for polaroid card"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-cocoa">
                    {isUploading ? (
                      <span className="animate-spin text-sm">⏳</span>
                    ) : photoUploadId ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-cocoa">
                    {isUploading
                      ? "Verifying & securing image..."
                      : photoUploadId
                      ? "Photo uploaded & secured ✓"
                      : "Click or drag your photo here"}
                  </p>
                  <p className="text-[11px] text-cocoa-muted">
                    Photo is safely encrypted and strictly kept private for order crafting.
                  </p>
                </div>
              </div>
              {uploadError && (
                <div className="flex items-center gap-1.5 text-xs text-error mt-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* Recipient Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="recipientName" className="text-xs font-medium text-cocoa">
                Recipient Name <span className="text-rose-deep">*</span>
              </Label>
              <span className="text-[11px] text-cocoa-muted">{recipientName.length}/30</span>
            </div>
            <Input
              id="recipientName"
              value={recipientName}
              maxLength={30}
              placeholder="e.g. Diya"
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>

          {/* Caption (Polaroid only) */}
          {selectedTemplateKey === "polaroid" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="caption" className="text-xs font-medium text-cocoa">
                  Polaroid Caption <span className="text-rose-deep">*</span>
                </Label>
                <span className="text-[11px] text-cocoa-muted">{caption.length}/40</span>
              </div>
              <Input
                id="caption"
                value={caption}
                maxLength={40}
                placeholder="e.g. Sunsets with you • Mumbai"
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
          )}

          {/* Message (Card or Polaroid Back) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="customMessage" className="text-xs font-medium text-cocoa">
                {selectedTemplateKey === "polaroid" ? "Personal Note (Optional)" : "Personal Message *"}
              </Label>
              <span className="text-[11px] text-cocoa-muted">{message.length}/180</span>
            </div>
            <textarea
              id="customMessage"
              rows={3}
              value={message}
              maxLength={180}
              placeholder="Write a message full of warmth and love..."
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-cocoa outline-none focus:border-rose-deep focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Sender Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="senderName" className="text-xs font-medium text-cocoa">
                Your Name / Sign-off (Optional)
              </Label>
              <span className="text-[11px] text-cocoa-muted">{senderName.length}/30</span>
            </div>
            <Input
              id="senderName"
              value={senderName}
              maxLength={30}
              placeholder="e.g. Always yours, Dev"
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-border/80">
          <Button
            type="button"
            size="lg"
            disabled={!isFormValid || isUploading}
            onClick={handleAddToCart}
            className="w-full justify-center gap-2 py-6 text-sm font-semibold rounded-full shadow-md"
          >
            <span>Add Customized Piece to Cart</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          {!isFormValid && (
            <p className="mt-2 text-center text-[11px] text-cocoa-muted">
              Please enter recipient name and {selectedTemplateKey === "polaroid" ? "upload a photo with caption" : "enter your message"} to proceed.
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Live Visual Preview (5 cols) */}
      <div className="lg:col-span-5 sticky top-28 space-y-6">
        <div className="text-center sm:text-left">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-cocoa-muted">
            Live Keepsake Preview
          </span>
          <p className="text-xs text-cocoa-muted">
            Handcrafted and printed exactly as visualized below.
          </p>
        </div>

        {selectedTemplateKey === "polaroid" ? (
          /* Polaroid Frame Preview */
          <div className="mx-auto max-w-[320px] bg-[#FFFDF9] p-4 pb-6 rounded-sm shadow-xl border border-cocoa/10 transform rotate-1 transition-transform hover:rotate-0">
            {/* Photo Box */}
            <div className="relative aspect-square w-full bg-sand/60 rounded-xs overflow-hidden flex items-center justify-center border border-cocoa/5">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Personalized polaroid preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="p-6 text-center space-y-2 text-cocoa-muted">
                  <Heart className="w-8 h-8 stroke-[1] mx-auto text-rose-deep/40" />
                  <p className="text-xs">Your photo will appear here</p>
                </div>
              )}
            </div>

            {/* Polaroid Bottom Caption */}
            <div className="mt-4 text-center min-h-[48px] flex flex-col justify-center">
              <p className="font-serif italic text-base text-cocoa leading-tight">
                {caption || "Your custom caption here"}
              </p>
              {recipientName && (
                <p className="text-[10px] uppercase tracking-widest text-cocoa-muted mt-1">
                  For {recipientName}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Handwritten Gift Note Preview */
          <div className="mx-auto max-w-[340px] bg-[#F7F2EB] p-6 rounded-md shadow-lg border border-[#E2D8CC] relative">
            <div className="border-b border-cocoa/10 pb-3 mb-4 flex items-center justify-between text-xs text-cocoa-muted font-serif">
              <span>VAP Keepsakes</span>
              <span>{occasion}</span>
            </div>
            <div className="space-y-3 font-serif text-cocoa text-sm leading-relaxed min-h-[120px]">
              <p className="font-medium">Dear {recipientName || "Friend"},</p>
              <p className="italic text-xs sm:text-sm text-cocoa/90">
                {message || "Your heartfelt words will be elegantly formatted here onto warm archival parchment."}
              </p>
              {senderName && (
                <p className="text-right text-xs pt-2 font-medium">
                  — {senderName}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
