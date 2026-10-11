export interface PersonalizationField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "photo" | "date";
  placeholder?: string;
  defaultValue?: string;
  required: boolean;
  maxLength?: number;
  options?: string[];
  helperText?: string;
}

export interface PersonalizationTemplate {
  id: string;
  title: string;
  description: string;
  badge: string;
  previewType: "licence" | "polaroid" | "card";
  fields: PersonalizationField[];
}

export const PERSONALIZATION_TEMPLATES: Record<string, PersonalizationTemplate> = {
  relationship_licence: {
    id: "relationship_licence",
    title: "Relationship Licence — Official Partnership Card",
    description: "Custom printed couple partnership card with photo slot, anniversary dates, universe authorization, and love terms.",
    badge: "Bestseller Couple Gift",
    previewType: "licence",
    fields: [
      {
        id: "photoUploadId",
        label: "Couple Photo",
        type: "photo",
        required: true,
        helperText: "Upload high-res couple photo (JPG, PNG, WebP up to 10MB). Framed in the pink heart polaroid slot.",
      },
      {
        id: "licenseHolder",
        label: "License Holder Names",
        type: "text",
        placeholder: "e.g. Pulkit & Vivana",
        required: true,
        maxLength: 40,
        helperText: "Names printed on the official partnership card.",
      },
      {
        id: "validFrom",
        label: "Valid From (Anniversary / Date)",
        type: "text",
        placeholder: "e.g. 18/05/2026 or 14 Feb 2024",
        required: true,
        maxLength: 20,
      },
      {
        id: "signature",
        label: "Authorized Signature / Nickname",
        type: "text",
        placeholder: "e.g. Vivana ♡",
        required: true,
        maxLength: 25,
        helperText: "Appears in signature script beneath the photo frame.",
      },
      {
        id: "relationStatus",
        label: "Relation Status",
        type: "text",
        placeholder: "Happily Committed",
        defaultValue: "Happily Committed",
        required: false,
        maxLength: 30,
      },
      {
        id: "licenseType",
        label: "License Type",
        type: "text",
        placeholder: "Soulmates For Life",
        defaultValue: "Soulmates For Life",
        required: false,
        maxLength: 30,
      },
      {
        id: "validUntil",
        label: "Valid Until",
        type: "text",
        placeholder: "Never Expires",
        defaultValue: "Never Expires",
        required: false,
        maxLength: 20,
      },
      {
        id: "emergencyContact",
        label: "Emergency Contact",
        type: "text",
        placeholder: "Each Other!!",
        defaultValue: "Each Other!!",
        required: false,
        maxLength: 30,
      },
      {
        id: "relationshipId",
        label: "Relationship ID",
        type: "text",
        placeholder: "FOREVER US 💖🧿",
        defaultValue: "FOREVER US 💖🧿",
        required: false,
        maxLength: 30,
      },
    ],
  },
  polaroid: {
    id: "polaroid",
    title: "Polaroid Photo Card",
    description: "Your treasured photograph printed in a vintage glossy Polaroid frame with a heartfelt bottom caption.",
    badge: "Classic Memory",
    previewType: "polaroid",
    fields: [
      {
        id: "photoUploadId",
        label: "Upload Your Photo",
        type: "photo",
        required: true,
        helperText: "High resolution JPG, PNG, or WebP (up to 10MB). Framed in a 1:1 polaroid cut.",
      },
      {
        id: "caption",
        label: "Polaroid Caption",
        type: "text",
        placeholder: "e.g. Forever & Always • Goa 2026",
        required: true,
        maxLength: 40,
        helperText: "Printed in handwritten script beneath the photo.",
      },
      {
        id: "recipientName",
        label: "Recipient Name",
        type: "text",
        placeholder: "e.g. Ananya",
        required: true,
        maxLength: 30,
      },
      {
        id: "senderName",
        label: "From (Your Name)",
        type: "text",
        placeholder: "e.g. Kabir",
        required: false,
        maxLength: 30,
      },
      {
        id: "message",
        label: "Back Message (Optional Note)",
        type: "textarea",
        placeholder: "Write a heartfelt message to be printed on the back...",
        required: false,
        maxLength: 180,
      },
    ],
  },
  gift_note: {
    id: "gift_note",
    title: "Handcrafted Dedication Note",
    description: "An artisan message card with elegant calligraphy tucked alongside your handcrafted jewellery.",
    badge: "Complimentary Card",
    previewType: "card",
    fields: [
      {
        id: "recipientName",
        label: "Recipient's Name",
        type: "text",
        placeholder: "e.g. Meera",
        required: true,
        maxLength: 35,
      },
      {
        id: "occasion",
        label: "Occasion",
        type: "select",
        required: false,
        options: ["Birthday", "Anniversary", "Celebration", "Thank You", "Special Moments"],
      },
      {
        id: "message",
        label: "Personal Message",
        type: "textarea",
        placeholder: "May this piece bring you joy and beautiful memories...",
        required: true,
        maxLength: 220,
      },
      {
        id: "senderName",
        label: "Sign-off / Your Name",
        type: "text",
        placeholder: "e.g. With love, Rhea",
        required: false,
        maxLength: 35,
      },
    ],
  },
};
