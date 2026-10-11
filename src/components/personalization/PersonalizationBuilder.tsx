"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, Sparkles, Heart, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { type ProductDetail } from "@/server/catalogue/types";
import { useCartStore } from "@/lib/cart/cart-store";
import { PERSONALIZATION_TEMPLATES } from "@/lib/personalization/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PersonalizationBuilderProps {
  product: ProductDetail;
}

export function PersonalizationBuilder({ product }: PersonalizationBuilderProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const [selectedTemplateKey, setSelectedTemplateKey] = React.useState<string>("relationship_licence");

  // Relationship Licence Fields
  const [licenseHolder, setLicenseHolder] = React.useState("");
  const [validFrom, setValidFrom] = React.useState("");
  const [signature, setSignature] = React.useState("");
  const [relationStatus, setRelationStatus] = React.useState("Happily Committed");
  const [licenseType, setLicenseType] = React.useState("Soulmates For Life");
  const [validUntil, setValidUntil] = React.useState("Never Expires");
  const [emergencyContact, setEmergencyContact] = React.useState("Each Other!!");
  const [relationshipId, setRelationshipId] = React.useState("FOREVER US 💖🧿");

  // Polaroid & Note Fields
  const [recipientName, setRecipientName] = React.useState("");
  const [senderName, setSenderName] = React.useState("");
  const [occasion, setOccasion] = React.useState("Anniversary");
  const [caption, setCaption] = React.useState("");
  const [message, setMessage] = React.useState("");

  // Preview Page Tab for Licence (1 = Front, 2 = Back)
  const [licencePage, setLicencePage] = React.useState<1 | 2>(1);

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

    // Client size check (10MB)
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
    if (selectedTemplateKey === "relationship_licence") {
      return Boolean(
        licenseHolder.trim() &&
        validFrom.trim() &&
        signature.trim() &&
        (photoUploadId || previewUrl)
      );
    }
    if (selectedTemplateKey === "polaroid") {
      return Boolean(recipientName.trim() && caption.trim() && (photoUploadId || previewUrl));
    }
    return Boolean(recipientName.trim() && message.trim());
  }, [selectedTemplateKey, licenseHolder, validFrom, signature, photoUploadId, previewUrl, recipientName, caption, message]);

  const handleAddToCart = () => {
    if (!isFormValid || !selectedVariant) return;

    addItem({
      productId: product.id,
      productSlug: product.slug,
      variantId: selectedVariant.id,
      quantity: 1,
      customization: {
        templateId: selectedTemplateKey,
        recipientName: selectedTemplateKey === "relationship_licence" ? licenseHolder.trim() : recipientName.trim(),
        senderName: senderName.trim() || undefined,
        occasion: selectedTemplateKey === "relationship_licence" ? "Partnership / Love" : occasion,
        caption: caption.trim() || undefined,
        message: message.trim() || undefined,
        photoUploadId: photoUploadId || undefined,
        photoPreviewUrl: previewUrl || undefined,
        licenseHolder: licenseHolder.trim() || undefined,
        validFrom: validFrom.trim() || undefined,
        signature: signature.trim() || undefined,
        relationStatus: relationStatus.trim() || undefined,
        licenseType: licenseType.trim() || undefined,
        validUntil: validUntil.trim() || undefined,
        emergencyContact: emergencyContact.trim() || undefined,
        relationshipId: relationshipId.trim() || undefined,
      },
    });

    openDrawer();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* Left Column: Form & Options (7 cols) */}
      <div className="lg:col-span-7 space-y-8 bg-surface p-6 sm:p-8 rounded-lg border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-rose-deep" />
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-deep">
              Personalized Cards & Gifts Studio
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-cocoa">
            Customize for Your Favourite Person
          </h2>
          <p className="mt-1 text-sm text-cocoa-muted leading-relaxed">
            Pair your handcrafted {product.name} with an official Relationship Licence or personalized card.
          </p>
        </div>

        {/* Template Selector */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-cocoa">Choose Card Format:</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.values(PERSONALIZATION_TEMPLATES).map((t) => {
              const isSelected = selectedTemplateKey === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplateKey(t.id)}
                  className={`text-left p-3.5 rounded-md border transition-all ${
                    isSelected
                      ? "border-rose-deep bg-blush/20 ring-1 ring-rose-deep"
                      : "border-border bg-surface hover:border-cocoa/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-cocoa">{t.title.split("—")[0]}</span>
                    {t.badge && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-rose-deep/30 text-rose-deep">
                        {t.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-cocoa-muted line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Variant Picker */}
        {product.variants.length > 1 && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-cocoa">Select Piece Variant:</Label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
                    v.id === selectedVariantId
                      ? "border-rose-deep bg-blush/30 text-rose-deep"
                      : "border-border text-cocoa hover:bg-beige/20"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Fields */}
        <div className="space-y-5 pt-2 border-t border-border/80">
          {/* Photo Upload for Relationship Licence & Polaroid */}
          {(selectedTemplateKey === "relationship_licence" || selectedTemplateKey === "polaroid") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="photoUpload" className="text-xs font-semibold text-cocoa">
                  {selectedTemplateKey === "relationship_licence" ? "Couple Photograph *" : "Photo for Polaroid *"}
                </Label>
                <span className="text-[11px] text-cocoa-muted">JPG, PNG, WebP &bull; Max 10MB</span>
              </div>

              <div className="relative border-2 border-dashed border-border hover:border-rose-deep/60 rounded-md p-5 text-center transition-colors bg-surface-raised/40">
                <input
                  id="photoUpload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blush/40 flex items-center justify-center text-rose-deep">
                    {isUploading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  {previewUrl ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                      <span>Photo selected & loaded ✓ Click to replace</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-medium text-cocoa">
                        Click or drag to upload couple picture
                      </p>
                      <p className="text-[11px] text-cocoa-muted">
                        Automatically framed inside the card
                      </p>
                    </>
                  )}
                </div>
              </div>

              {uploadError && (
                <div className="flex items-center gap-1.5 text-xs text-error">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* TEMPLATE 1: Relationship Licence Fields */}
          {selectedTemplateKey === "relationship_licence" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="licenseHolder" className="text-xs font-medium text-cocoa">
                    License Holder Name(s) *
                  </Label>
                  <Input
                    id="licenseHolder"
                    value={licenseHolder}
                    maxLength={40}
                    placeholder="e.g. Pulkit & Vivana"
                    onChange={(e) => setLicenseHolder(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="validFrom" className="text-xs font-medium text-cocoa">
                    Valid From (Anniversary Date) *
                  </Label>
                  <Input
                    id="validFrom"
                    value={validFrom}
                    maxLength={20}
                    placeholder="e.g. 18/05/2026 or 14 Feb 2024"
                    onChange={(e) => setValidFrom(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signature" className="text-xs font-medium text-cocoa">
                    Authorized Signature *
                  </Label>
                  <Input
                    id="signature"
                    value={signature}
                    maxLength={25}
                    placeholder="e.g. Vivana ♡"
                    onChange={(e) => setSignature(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="relationStatus" className="text-xs font-medium text-cocoa">
                    Relation Status
                  </Label>
                  <Input
                    id="relationStatus"
                    value={relationStatus}
                    maxLength={30}
                    placeholder="Happily Committed"
                    onChange={(e) => setRelationStatus(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="licenseType" className="text-xs font-medium text-cocoa">
                    License Type
                  </Label>
                  <Input
                    id="licenseType"
                    value={licenseType}
                    maxLength={30}
                    placeholder="Soulmates For Life"
                    onChange={(e) => setLicenseType(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="emergencyContact" className="text-xs font-medium text-cocoa">
                    Emergency Contact
                  </Label>
                  <Input
                    id="emergencyContact"
                    value={emergencyContact}
                    maxLength={30}
                    placeholder="Each Other!!"
                    onChange={(e) => setEmergencyContact(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="relationshipId" className="text-xs font-medium text-cocoa">
                  Relationship ID
                </Label>
                <Input
                  id="relationshipId"
                  value={relationshipId}
                  maxLength={30}
                  placeholder="FOREVER US 💖🧿"
                  onChange={(e) => setRelationshipId(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* TEMPLATE 2: Polaroid Fields */}
          {selectedTemplateKey === "polaroid" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="caption" className="text-xs font-medium text-cocoa">
                    Polaroid Caption *
                  </Label>
                  <span className="text-[11px] text-cocoa-muted">{caption.length}/40</span>
                </div>
                <Input
                  id="caption"
                  value={caption}
                  maxLength={40}
                  placeholder="e.g. Forever & Always • Goa 2026"
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="recipientName" className="text-xs font-medium text-cocoa">
                    Recipient Name *
                  </Label>
                  <Input
                    id="recipientName"
                    value={recipientName}
                    maxLength={30}
                    placeholder="e.g. Ananya"
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="senderName" className="text-xs font-medium text-cocoa">
                    From (Your Name)
                  </Label>
                  <Input
                    id="senderName"
                    value={senderName}
                    maxLength={30}
                    placeholder="e.g. Kabir"
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs font-medium text-cocoa">
                  Back of Polaroid Note (Optional)
                </Label>
                <textarea
                  id="message"
                  rows={2}
                  value={message}
                  maxLength={180}
                  placeholder="Write a heartfelt note for the reverse side..."
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-cocoa outline-none focus:border-rose-deep focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}

          {/* TEMPLATE 3: Dedication Note Fields */}
          {selectedTemplateKey === "gift_note" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="recipientName" className="text-xs font-medium text-cocoa">
                    Recipient Name *
                  </Label>
                  <Input
                    id="recipientName"
                    value={recipientName}
                    maxLength={35}
                    placeholder="e.g. Meera"
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="occasion" className="text-xs font-medium text-cocoa">
                    Occasion
                  </Label>
                  <select
                    id="occasion"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full h-10 rounded-sm border border-border bg-surface px-3 py-1 text-xs text-cocoa outline-none focus:border-rose-deep focus:ring-2 focus:ring-ring"
                  >
                    <option value="Anniversary">Anniversary</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Special Moments">Special Moments</option>
                    <option value="Thank You">Thank You</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message" className="text-xs font-medium text-cocoa">
                    Personal Message *
                  </Label>
                  <span className="text-[11px] text-cocoa-muted">{message.length}/220</span>
                </div>
                <textarea
                  id="message"
                  rows={4}
                  value={message}
                  maxLength={220}
                  placeholder="Write a message full of love and warmth..."
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-cocoa outline-none focus:border-rose-deep focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="senderName" className="text-xs font-medium text-cocoa">
                  Sign-off / Your Name (Optional)
                </Label>
                <Input
                  id="senderName"
                  value={senderName}
                  maxLength={35}
                  placeholder="e.g. With love, Rhea"
                  onChange={(e) => setSenderName(e.target.value)}
                />
              </div>
            </div>
          )}
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
            <span>Add Custom Gift to Cart</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          {!isFormValid && (
            <p className="mt-2 text-center text-[11px] text-cocoa-muted">
              {selectedTemplateKey === "relationship_licence"
                ? "Please upload a couple photo and enter names, date, and signature to proceed."
                : selectedTemplateKey === "polaroid"
                ? "Please upload a photo and enter caption and recipient name."
                : "Please enter recipient name and message."}
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Live Visual Preview (5 cols) */}
      <div className="lg:col-span-5 sticky top-28 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-cocoa-muted">
              Live Card Preview
            </span>
            <p className="text-xs text-cocoa-muted">Printed and delivered with your order.</p>
          </div>

          {/* Page toggle for Relationship Licence */}
          {selectedTemplateKey === "relationship_licence" && (
            <div className="flex items-center gap-1 bg-beige/40 p-1 rounded-md text-xs">
              <button
                type="button"
                onClick={() => setLicencePage(1)}
                className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
                  licencePage === 1 ? "bg-surface text-rose-deep shadow-xs font-semibold" : "text-cocoa-muted hover:text-cocoa"
                }`}
              >
                Page 1 (Front)
              </button>
              <button
                type="button"
                onClick={() => setLicencePage(2)}
                className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
                  licencePage === 2 ? "bg-surface text-rose-deep shadow-xs font-semibold" : "text-cocoa-muted hover:text-cocoa"
                }`}
              >
                Page 2 (Back)
              </button>
            </div>
          )}
        </div>

        {/* PREVIEW: Relationship Licence */}
        {selectedTemplateKey === "relationship_licence" && (
          <div className="mx-auto max-w-[360px] bg-[#FFF0F4] p-4 rounded-xl shadow-xl border-2 border-[#FFAEC9] relative overflow-hidden text-cocoa">
            {licencePage === 1 ? (
              /* Front Page */
              <div className="space-y-3">
                {/* Header Banner */}
                <div className="text-center relative pb-1 border-b border-[#FFAEC9]/60">
                  <p className="text-[9px] font-bold text-[#E83E8C] uppercase tracking-widest">
                    💕 Official Partnership Card 💕
                  </p>
                  <h3 className="font-display font-black text-lg text-[#D63384] tracking-tight">
                    RELATIONSHIP LICENCE
                  </h3>
                  <div className="inline-block bg-[#FFD1DC] px-2 py-0.5 rounded-full text-[9px] font-bold text-[#C2185B] mt-0.5">
                    🎀 FOREVER TOGETHER 🎀
                  </div>
                </div>

                {/* Photo & Main Details */}
                <div className="grid grid-cols-12 gap-3 items-center">
                  {/* Photo with heart border */}
                  <div className="col-span-5 flex flex-col items-center">
                    <div className="relative aspect-square w-full rounded-md p-1.5 bg-white border-2 border-[#FF85A1] shadow-xs flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        <Image
                          src={previewUrl}
                          alt="Couple photo preview"
                          fill
                          className="object-cover rounded-xs"
                        />
                      ) : (
                        <div className="text-center p-2 text-[#FF85A1]">
                          <Heart className="w-6 h-6 mx-auto stroke-[1.5] fill-[#FFD1DC]" />
                          <p className="text-[9px] font-medium mt-1">Photo slot</p>
                        </div>
                      )}
                    </div>
                    {/* Signature */}
                    <div className="mt-1.5 text-center">
                      <p className="text-[8px] text-[#A24857] uppercase tracking-wider font-semibold">Signature</p>
                      <p className="font-serif italic text-xs text-[#C2185B] font-bold">
                        {signature || "Your signature ♡"}
                      </p>
                    </div>
                  </div>

                  {/* Licence Information */}
                  <div className="col-span-7 space-y-1.5 text-[10px]">
                    <div className="bg-white/80 p-2 rounded-md border border-[#FFAEC9]/60 space-y-1">
                      <div>
                        <span className="font-bold text-[#A24857] text-[9px] block">LICENSE HOLDER :</span>
                        <p className="font-bold text-xs text-cocoa leading-tight truncate">
                          {licenseHolder || "Couple Names"}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-[#A24857] text-[9px] block">RELATION STATUS :</span>
                        <p className="font-semibold text-[10px] text-cocoa">
                          {relationStatus}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-[#A24857] text-[9px] block">LICENSE TYPE :</span>
                        <p className="font-semibold text-[10px] text-cocoa">
                          {licenseType}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-center">
                      <div className="bg-white/80 p-1 rounded-sm border border-[#FFAEC9]/50">
                        <span className="text-[8px] font-bold text-[#A24857] block">VALID FROM</span>
                        <span className="font-bold text-[9px] text-cocoa truncate block">
                          {validFrom || "Date"}
                        </span>
                      </div>
                      <div className="bg-white/80 p-1 rounded-sm border border-[#FFAEC9]/50">
                        <span className="text-[8px] font-bold text-[#A24857] block">VALID UNTIL</span>
                        <span className="font-bold text-[9px] text-cocoa truncate block">
                          {validUntil}
                        </span>
                      </div>
                    </div>

                    <div className="text-center pt-0.5">
                      <span className="text-[8px] font-bold text-[#C2185B] tracking-wider uppercase">
                        AUTHORIZED BY : UNIVERSE ✨
                      </span>
                    </div>
                  </div>
                </div>

                {/* Love Code Box */}
                <div className="bg-white/90 p-2 rounded-md border border-[#FFAEC9] text-[9px] flex items-center justify-between">
                  <div className="space-y-0.5 font-medium text-[#7C3A48]">
                    <span className="font-bold text-[#C2185B] block text-[10px]">LOVE CODE:</span>
                    <p>&bull; Stay Close &bull; 24/7 Calls &bull; Stay Loyal</p>
                    <p>&bull; &infin; KISSES &bull; &infin; HUGS &bull; &infin; LOVE</p>
                  </div>
                  <div className="text-right text-[11px] font-serif italic font-bold text-[#D63384]">
                    I love you 💕
                  </div>
                </div>
              </div>
            ) : (
              /* Back Page — Terms & Conditions */
              <div className="space-y-3">
                <div className="text-center pb-1 border-b border-[#FFAEC9]/60">
                  <h4 className="font-display font-black text-xs text-[#D63384] tracking-tight uppercase">
                    THIS LICENSE PROVES THAT THE HOLDERS ARE
                  </h4>
                  <div className="inline-block bg-[#FFD1DC] px-2 py-0.5 rounded-full text-[9px] font-bold text-[#C2185B] mt-0.5">
                    ✨ PERFECTLY IN LOVE WITH EACH OTHER!! ✨
                  </div>
                </div>

                {/* Terms list */}
                <div className="bg-white/90 p-2.5 rounded-md border border-[#FFAEC9] space-y-1.5 text-[10px]">
                  <p className="font-bold text-[#C2185B] text-[10px] uppercase">TERMS & CONDITIONS</p>
                  <ul className="space-y-1 text-cocoa font-medium">
                    <li className="flex items-center gap-1.5">
                      <span>💖</span>
                      <span>Kiss tax applies daily 💋</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span>💖</span>
                      <span>Chemistry must be hot 🥵</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span>💖</span>
                      <span>Always choose each other!! 🫂</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span>💖</span>
                      <span>No sleep without resolving the issues</span>
                    </li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                  <div className="bg-white/90 p-1.5 rounded-md border border-[#FFAEC9]">
                    <span className="text-[8px] font-bold text-[#A24857] block">EMERGENCY CONTACT</span>
                    <span className="font-bold text-[10px] text-[#D63384]">
                      {emergencyContact}
                    </span>
                  </div>
                  <div className="bg-white/90 p-1.5 rounded-md border border-[#FFAEC9]">
                    <span className="text-[8px] font-bold text-[#A24857] block">RELATIONSHIP ID</span>
                    <span className="font-bold text-[10px] text-[#D63384]">
                      {relationshipId}
                    </span>
                  </div>
                </div>

                <div className="text-center pt-1 text-[10px] font-bold text-[#C2185B]">
                  🌺 TRUE LOVE IS WHAT NEVER FADES!! 🌺
                </div>
              </div>
            )}
          </div>
        )}

        {/* PREVIEW: Classic Polaroid */}
        {selectedTemplateKey === "polaroid" && (
          <div className="mx-auto max-w-[320px] bg-[#FFFDF9] p-4 pb-6 rounded-sm shadow-xl border border-cocoa/10 transform rotate-1 transition-transform hover:rotate-0">
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
        )}

        {/* PREVIEW: Gift Note */}
        {selectedTemplateKey === "gift_note" && (
          <div className="mx-auto max-w-[340px] bg-[#F7F2EB] p-6 rounded-md shadow-lg border border-[#E2D8CC] relative">
            <div className="border-b border-cocoa/10 pb-3 mb-4 flex items-center justify-between text-xs text-cocoa-muted font-serif">
              <span>VAP Handicrafts</span>
              <span>{occasion}</span>
            </div>
            <div className="space-y-3 font-serif text-cocoa text-sm leading-relaxed min-h-[120px]">
              <p className="font-medium">Dear {recipientName || "Friend"},</p>
              <p className="italic text-xs sm:text-sm text-cocoa/90">
                {message || "Your heartfelt words will be elegantly formatted here onto warm archival stationery."}
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
