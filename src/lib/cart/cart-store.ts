import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type CartLineIntent,
  type CustomizationValues,
  areCustomizationsEqual,
} from "./types";

export interface AddItemInput {
  productId: string;
  productSlug: string;
  variantId: string;
  quantity?: number;
  customization?: CustomizationValues;
}

export interface CartStoreState {
  items: CartLineIntent[];
  isDrawerOpen: boolean;
  hasHydrated: boolean;
  lastAddedLineId: string | null;

  // Actions
  addItem: (input: AddItemInput) => string;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  updateCustomization: (lineId: string, customization: CustomizationValues) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  getItemCount: () => number;
  setHasHydrated: (state: boolean) => void;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      hasHydrated: false,
      lastAddedLineId: null,

      addItem: (input: AddItemInput) => {
        const qty = Math.max(1, Math.min(50, input.quantity ?? 1));
        const currentItems = get().items;

        // Check if matching line with IDENTICAL customization exists
        const existingIndex = currentItems.findIndex(
          (item) =>
            item.productId === input.productId &&
            item.variantId === input.variantId &&
            areCustomizationsEqual(item.customization, input.customization)
        );

        if (existingIndex > -1) {
          // Merge quantities for identical items
          const existing = currentItems[existingIndex];
          if (!existing) return "";
          const newQty = Math.min(50, existing.quantity + qty);
          const updated = [...currentItems];
          updated[existingIndex] = {
            ...existing,
            quantity: newQty,
          };
          set({
            items: updated,
            lastAddedLineId: existing.lineId,
            isDrawerOpen: true,
          });
          return existing.lineId;
        }

        // Create separate line item (PRD §9.4)
        const lineId =
          typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const newLine: CartLineIntent = {
          lineId,
          productId: input.productId,
          productSlug: input.productSlug,
          variantId: input.variantId,
          quantity: qty,
          customization: input.customization,
        };

        set({
          items: [...currentItems, newLine],
          lastAddedLineId: lineId,
          isDrawerOpen: true,
        });

        return lineId;
      },

      updateQuantity: (lineId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(lineId);
          return;
        }
        const capped = Math.min(50, quantity);
        set((state) => ({
          items: state.items.map((item) =>
            item.lineId === lineId ? { ...item, quantity: capped } : item
          ),
        }));
      },

      removeItem: (lineId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.lineId !== lineId),
        }));
      },

      updateCustomization: (lineId: string, customization: CustomizationValues) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.lineId === lineId ? { ...item, customization } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], lastAddedLineId: null });
      },

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
    }),
    {
      name: "vap_cart_v1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        // Strictly persist line intent only — never prices or transient UI state
        items: state.items,
      }),
    }
  )
);
