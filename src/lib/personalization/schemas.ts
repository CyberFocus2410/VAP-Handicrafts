export interface PersonalizationField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "photo" | "date";
  placeholder?: string;
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
  previewType: "polaroid" | "card" | "tag";
  fields: PersonalizationField[];
}

export const PERSONALIZATION_TEMPLATES: Record<string, PersonalizationTemplate> = {
  polaroid: {
    id: "polaroid",
    title: "Polaroid Photo Keepsake Card",
    description: "Your treasured memory preserved in a classic glossy Polaroid print with a custom caption.",
    badge: "Most Popular",
    previewType: "polaroid",
    fields: [
      {
        id: "photoUploadId",
        label: "Upload Your Photo",
        type: "photo",
        required: true,
        helperText: "High resolution JPG, PNG, or WebP (up to 10MB). We crop thoughtfully to a 1:1 polaroid frame.",
      },
      {
        id: "caption",
        label: "Front Caption",
        type: "text",
        placeholder: "e.g. Forever & Always • Goa 2026",
        required: true,
        maxLength: 40,
        helperText: "Printed in handwritten script beneath your photo.",
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
        label: "From (Optional)",
        type: "text",
        placeholder: "e.g. Kabir",
        required: false,
        maxLength: 30,
      },
      {
        id: "occasion",
        label: "Occasion",
        type: "select",
        required: false,
        options: ["Birthday", "Anniversary", "Friendship", "Valentine's", "Sisterhood", "Congratulations"],
      },
      {
        id: "message",
        label: "Back Message (Optional Note)",
        type: "textarea",
        placeholder: "Write a heartfelt message to be printed or handwritten on the back...",
        required: false,
        maxLength: 180,
      },
    ],
  },
  keepsake: {
    id: "keepsake",
    title: "Handcrafted Keepsake Gift Note",
    description: "A wax-sealed textured parchment note tucked inside the jewellery pouch.",
    badge: "Complimentary",
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
        options: ["Birthday", "Anniversary", "Celebration", "Thank You", "Special Keepsake"],
      },
      {
        id: "message",
        label: "Personal Message",
        type: "textarea",
        placeholder: "May this piece bring you the tranquility of the sea...",
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
