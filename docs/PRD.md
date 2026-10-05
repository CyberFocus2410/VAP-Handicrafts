# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# Premium 3D Ecommerce Store for Shell Jewellery, Personalized Gifts & Keepsakes

**Document Version:** 1.0  
**Status:** Ready for implementation planning  
**Product Type:** Full-stack, direct-to-consumer ecommerce website  
**Primary Market:** India  
**Currency:** INR (₹)  
**Primary Payment Method:** UPI through Paytm Payment Gateway  
**Deployment Target:** Vercel  
**Brand Name:** Configurable; final name to be supplied  
**Primary Objective:** Build a visually distinctive, interactive, elegant 3D ecommerce website with a complete shopping, payment, order-management, and email-notification system.

---

# 1. PROJECT OVERVIEW

## 1.1 Product Vision

Build a premium, visually immersive online gifting and accessories store where customers can purchase shell jewellery, bracelet-and-earring combinations, Polaroid photographs, personalized magazines, and relationship-themed cards.

The website must combine the warmth of a personalized gifting brand with the sophistication of a modern luxury ecommerce experience.

Unlike conventional ecommerce templates, the website should use carefully designed 3D environments, layered scrapbook-inspired visuals, interactive product displays, smooth transitions, and tactile interface elements.

However, the website must prioritize usability and conversions. Animations should enhance the shopping experience without slowing down browsing, checkout, or payment.

The final product must be a fully functional, deployable ecommerce application—not a static landing page, design mockup, or frontend-only prototype.

## 1.2 Core Business Goals

1. Establish a recognizable and premium online brand.
2. Sell shell jewellery and personalized gifting products directly to customers.
3. Provide an engaging product-discovery experience through interactive design.
4. Allow customers to browse products, customize eligible items, add products to a persistent cart, and place orders.
5. Accept UPI payments through an approved Paytm Payment Gateway integration.
6. Verify payments securely on the server before confirming orders.
7. Automatically notify the business owner when an order is successfully paid.
8. Send customers order confirmations and payment receipts.
9. Provide a secure administration dashboard for managing products, stock, orders, and fulfilment.
10. Build an architecture that can support additional products, campaigns, and features without requiring a complete rewrite.

## 1.3 Product Principles

- **Premium, not cluttered:** A carefully composed interface with sufficient whitespace.
- **Emotional, not childish:** Romantic and playful details balanced with elegant typography.
- **Interactive, not distracting:** 3D is used purposefully.
- **Real functionality:** Every visible shopping control must work.
- **Secure by design:** Never trust client-side prices, payment screenshots, or browser redirects as proof of payment.
- **Mobile-first:** The complete shopping and checkout experience must work on mobile devices.
- **Accessible:** Animation, contrast, navigation, and controls must accommodate different user needs.
- **Operationally complete:** Orders, inventory, payment states, emails, and customer data must be connected to the backend.

---

# 2. PRODUCTS AND CATALOGUE STRUCTURE

The store must support the following product categories.

## 2.1 Jewellery

### A. Shell Bracelets
Bracelets featuring natural-looking decorative shells, pink beads, white shells, gold-toned details, or other designs matching the supplied product photographs.

### B. Shell Bracelet and Earrings Combos
Coordinated jewellery sets containing a bracelet and matching earrings.

### C. Additional Jewellery Collections
The catalogue should be extensible to include new bead combinations, floral jewellery, ocean-inspired accessories, and future collections.

The uploaded photographs establish the initial visual direction. They must be used as the primary references for the first jewellery listings.

## 2.2 Personalized Keepsakes

### D. Polaroids
Printed photographs in a Polaroid-inspired format.

Possible configurable options include:
- Number of photographs.
- Print dimensions.
- Border style.
- Caption or date.
- Optional personalized text.
- Photo uploads.

### E. Personalized Magazine for a Partner or Loved One
A custom magazine designed around a relationship or special person.

Possible customization fields:
- Recipient name.
- Sender name.
- Relationship or occasion.
- Cover title.
- Personal message.
- Customer-uploaded photographs.
- Selected magazine design or template.
- Additional instructions.

### F. Couple Cards
Romantic cards for partners and couples, including anniversary, birthday, appreciation, and other occasions.

### G. Bestie Cards
Cards for close friends.

### H. Bestfriend Cards
A separate catalogue grouping for best-friend-themed designs, or a collection nested under friendship cards if the owner later chooses to consolidate them.

### I. Sisterhood Cards
Cards for sisters and sister-like relationships.

### J. Brotherhood Cards
Cards for brothers and brother-like relationships.

The catalogue must support adding new categories and collections through the admin dashboard, where practical, without requiring code changes.

## 2.3 Product Classification

Each product must have:

- Unique product ID.
- Product name.
- URL-friendly slug.
- Category and optional subcategory.
- Short description.
- Full description.
- Product photographs.
- Current selling price in INR.
- Optional compare-at price.
- Stock quantity or made-to-order status.
- Active, draft, or archived status.
- SKU or internal product code.
- Product variants, where applicable.
- Personalization options, where applicable.
- Shipping or production information.
- Product dimensions or specifications, when relevant.
- Featured, bestseller, or new-arrival designation.
- SEO title and description.
- Creation and modification timestamps.

Prices and stock quantities must be maintained by the backend. They must never be accepted from the customer’s browser as authoritative values.

## 2.4 Initial Product Data

Use the four uploaded jewellery photographs as initial product-gallery references:

1. Pink shell charm bracelet.
2. Pink shell bracelet and matching earrings set.
3. Purple floral bracelet and earrings set.
4. Ocean-inspired shell and charm chain bracelet.

These are initial product concepts. Actual names, descriptions, prices, SKU values, stock, dimensions, and fulfilment details must be configurable.

The prices shown in any design mockup are illustrative and must not be treated as approved selling prices.

If a product's actual selling price is not available, display a clearly marked placeholder only in development. Production checkout must block purchasing products without valid prices.

Do not fabricate customer reviews, sales figures, stock scarcity, certifications, or product claims.

---

# 3. TARGET AUDIENCE

Primary customer groups include:

1. Young adults purchasing affordable jewellery and accessories.
2. Customers shopping for partners or significant others.
3. Best friends purchasing personalized gifts for each other.
4. Customers buying gifts for siblings and close family members.
5. People purchasing keepsakes for birthdays, anniversaries, friendship celebrations, and other occasions.
6. Customers who want a customized product rather than a generic, mass-produced gift.

## 3.1 Customer Expectations

Customers should be able to:

- Understand what the store sells immediately.
- Browse categories without confusion.
- See clear product photographs and prices.
- Understand the customization process.
- Add products to their cart easily.
- Know the total price before paying.
- Pay using an available UPI method.
- Receive a clear confirmation when the payment is verified.
- Receive an order reference and receipt.
- Contact the business if they need assistance.

---

# 4. BRAND AND VISUAL DESIGN SYSTEM

## 4.1 Creative Direction

The visual identity should combine:

- Soft luxury.
- Romantic editorial design.
- Beach-inspired jewellery photography.
- Personalized scrapbook aesthetics.
- Tactile paper and fabric textures.
- Refined, subtle 3D elements.

The website should feel warm, delicate, premium, expressive, and giftable.

It must not look like a generic marketplace template, a gaming website, a neon 3D experience, or a childish cartoon store.

## 4.2 Colour Palette

Use the following as initial design tokens. These can be refined after the brand name and logo are finalized.

| Token | Suggested colour | Usage |
|---|---|---|
| Background | #FAF5EF | Main page background |
| Warm ivory | #FFFDF9 | Cards and content surfaces |
| Blush pink | #E8C1BC | Accents and selected elements |
| Dusty rose | #C9857B | Primary buttons and highlights |
| Deep cocoa | #4A2D28 | Primary text and headings |
| Warm beige | #E7D8C7 | Decorative surfaces |
| Muted lavender | #C7B5D9 | Purple jewellery collection |
| Sage | #B8C0A6 | Optional supporting accent |
| Champagne gold | #B69A67 | Small decorative accents |
| Success | Accessible green tone | Confirmed payment states |
| Error | Accessible red tone | Validation and payment errors |

Do not use all colours equally. Ivory and warm neutrals should dominate; blush and gold should be supporting accents.

Text and controls must maintain accessible contrast.

## 4.3 Typography

Use a refined serif typeface for major headlines and product titles, paired with a clean sans-serif for body text, buttons, form labels, prices, and administrative interfaces.

Typography should establish a clear hierarchy:

- Large editorial hero heading.
- Medium section headings.
- Clear product titles.
- Readable product descriptions.
- Strong price emphasis.
- Compact but legible metadata.

Avoid excessive decorative fonts, all-caps paragraphs, or low-contrast text.

## 4.4 Layout Principles

- Generous whitespace.
- Asymmetrical editorial compositions where appropriate.
- Rounded or softly edged cards.
- Light borders and subtle shadows.
- Large product imagery.
- Restrained decorative elements.
- Consistent spacing and alignment.
- Clear separation between marketing content and transactional controls.

The desktop design may use layered compositions. Mobile layouts must simplify these compositions instead of shrinking the desktop layout indiscriminately.

## 4.5 Reference Imagery

Use the user's actual uploaded shell bracelet and earring photographs as the initial catalogue assets.

The supplied photographs show:

- Brown-and-cream decorative shell beads with pink transparent beads.
- White shell elements paired with pink beads and gold-toned earring hooks.
- Purple floral bead jewellery with pearl-like accents.
- An ocean-inspired chain bracelet featuring shell charms.

Preserve the product's actual appearance. Do not use unrelated generic stock photographs in place of these initial products.

Lifestyle images and additional imagery may be added later if they are consistent with the brand.

---

# 5. WEBSITE INFORMATION ARCHITECTURE

Implement the following public routes.

| Route | Purpose |
|---|---|
| `/` | Homepage and brand introduction |
| `/shop` | Complete product catalogue |
| `/collections/[slug]` | Category or collection listing |
| `/products/[slug]` | Individual product details |
| `/search` | Search results |
| `/cart` | Shopping cart |
| `/checkout` | Customer details and order review |
| `/payment/return` | Payment-return handling and status display |
| `/order-status/[reference]` | Secure order-status experience |
| `/account` | Optional customer account area |
| `/account/orders` | Order history for authenticated customers |
| `/personalize/[product-slug]` | Optional dedicated customization experience |
| `/about` | Brand story |
| `/contact` | Contact information and support |
| `/shipping-policy` | Shipping and delivery terms |
| `/returns-refunds` | Return, cancellation, and refund policy |
| `/privacy-policy` | Privacy and data handling |
| `/terms` | Terms and conditions |
| `/admin` | Private administration dashboard |

The account area may be deferred for the initial launch. Guest checkout must remain available.

Use readable, SEO-friendly URLs and appropriate metadata for product and category pages.

---

# 6. HOMEPAGE REQUIREMENTS

The homepage must introduce the brand, showcase the product range, communicate trust, and guide users into shopping.

## 6.1 Announcement Bar

Display a configurable announcement at the top of the page.

Potential messages include:

- New collection available.
- Personalized gifts for special occasions.
- Shipping or delivery information.
- Free shipping above a threshold, if the business actually offers it.

Do not hardcode promotional offers or shipping thresholds as permanent claims.

The admin should be able to change the announcement text or disable the bar.

## 6.2 Main Navigation

Include:

- Brand logo or wordmark.
- Shop.
- Jewellery.
- Keepsakes.
- Gift collections.
- Our Story.
- Search.
- Cart icon with a live item count.

On mobile, use a compact header and an accessible navigation drawer.

A customer must be able to reach the catalogue and cart easily from any main shopping page.

## 6.3 Hero Section

The hero should feature an editorial composition inspired by the supplied jewellery photographs.

Suggested copy:

**Eyebrow:** GIFTS THAT FEEL LIKE YOU

**Headline:** Little treasures, made to be loved.

**Supporting text:** Shell jewellery and thoughtful keepsakes for your favourite people.

**Primary CTA:** Explore the Collection

The hero may combine:

- A warm, textured surface.
- Shell bracelet and earrings imagery.
- Pink linen and dried florals.
- Floating Polaroid-style details.
- A subtle 3D decorative element.
- Gentle parallax movement.

The main CTA must navigate to the relevant collection or shop page.

Do not make the primary CTA dependent on completing an animation.

## 6.4 Trust Highlights

Show concise value propositions, provided they are factually true.

Examples:

- Thoughtful Gifts.
- Unique Designs.
- Secure Checkout.
- Made with Love.

Only display claims that the business can support. Do not imply handmade production unless the products are actually handmade.

## 6.5 Featured Collections

Show visual collection cards for:

- Shell Bracelets.
- Bracelet and Earring Sets.
- Polaroids.
- Personalized Magazines.
- Couple Cards.
- Bestie and Bestfriend Cards.
- Sisterhood and Brotherhood Cards.

Each collection card must navigate to its relevant listing page.

## 6.6 Featured Products

Show a curated product grid.

Each product card must support:

- Product image.
- Product name.
- Price.
- Optional compare-at price.
- Availability indicator.
- Quick-view or product-detail navigation.
- Wishlist icon only if a real wishlist feature is implemented.
- Add to Cart button or a variant-selection action.

If a product has required variants, clicking Add to Cart should open the variant selector rather than adding an arbitrary default variant.

## 6.7 Personalized Gift Feature

Add a dedicated section explaining that customers can create meaningful gifts for their favourite people.

The CTA should lead to the relevant personalized products or customization interface.

## 6.8 Brand Story

Include a concise brand introduction emphasizing the emotional value of jewellery and personalized keepsakes.

The final copy will be supplied or approved by the business owner.

## 6.9 Footer

Include:

- Shop links.
- Product categories.
- Contact information.
- Shipping and returns policies.
- Privacy policy.
- Terms and conditions.
- Social media links, when available.
- Business contact email.
- Copyright notice.

---

# 7. PRODUCT CATALOGUE AND SEARCH

## 7.1 Product Listing Pages

The `/shop` page and collection pages must support:

- Responsive product grid.
- Category navigation.
- Price filtering.
- Availability filtering.
- Sorting by price.
- Sorting by newest.
- Featured or bestseller sorting, when those designations exist.
- Search.
- Pagination or efficient incremental loading.

Filters should update the displayed results without unnecessarily reloading the entire page.

## 7.2 Search

Search should match product names, descriptions, SKUs where appropriate, and category names.

Search must include:

- Empty-state messaging.
- No-results messaging.
- Clear query control.
- Accessible input and keyboard interaction.

If search suggestions are provided, each suggestion must link to a real product or category.

## 7.3 Product Cards

Product cards should have a consistent layout and image aspect ratio.

On desktop:

- Subtle hover movement.
- Optional image transition.
- Clear product name and price.
- A visible Add to Cart action.

On mobile:

- No hover-only interactions.
- Buttons must be touch-friendly.
- Product titles and prices must remain legible.
- Animations must not block interaction.

## 7.4 Inventory

Each physical product must support one of the following fulfilment models:

- Tracked inventory.
- Made to order.
- Available without quantity tracking, if explicitly configured.

Do not allow a tracked-inventory product to be purchased beyond available stock.

Inventory must be checked again on the server during checkout and before order confirmation.

---

# 8. PRODUCT DETAIL PAGES

Each product page must display:

- Product title.
- Product gallery.
- Price.
- Variant selector, where applicable.
- Stock or availability.
- Quantity selector.
- Product description.
- Specifications.
- Production or dispatch estimate, if known.
- Shipping information.
- Return eligibility information.
- Add to Cart button.
- Related products.
- Product-specific customization controls.

## 8.1 Product Gallery

Support:

- Multiple images.
- Thumbnail navigation.
- Main-image switching.
- Zoom or enlarged-image view.
- Keyboard-accessible controls.
- Mobile swipe navigation, if implemented.

Use the supplied jewellery photographs as the first gallery images for the matching initial products.

Preserve image quality and aspect ratio. Avoid excessive cropping that removes important product details.

## 8.2 Product Variants

Where applicable, variants may include:

- Design.
- Colour.
- Size.
- Quantity or bundle.
- Print format.
- Magazine template.

Variant selection must update the displayed price, SKU, and availability when these vary.

## 8.3 Add to Cart

When a valid product is added:

1. Validate required variants.
2. Validate quantity.
3. Update the cart.
4. Show clear feedback.
5. Update the cart count.
6. Preserve the cart across navigation and refreshes.
7. Provide a clear way to continue shopping or open the cart.

Do not claim an item has been added when a required option is missing or the stock check fails.

---

# 9. PERSONALIZED GIFT BUILDER

Personalized products are an important differentiator and must have a reusable customization system.

## 9.1 Supported Fields

Customization fields should be configurable per product.

Potential field types:

- Single-line text.
- Multiline message.
- Recipient name.
- Sender name.
- Date.
- Occasion selector.
- Design or template selector.
- Caption.
- Photo upload.
- Additional instructions.

A product must specify which fields are required and which are optional.

## 9.2 Customer Experience

The customer should be able to:

1. Select the product.
2. Choose an available design or template.
3. Enter the required information.
4. Upload photographs where applicable.
5. Review the entered details.
6. Add the customized product to the cart.
7. Edit the customization before checkout.

The interface should clearly explain upload requirements and the allowed file formats.

## 9.3 Photo Uploads

Use private storage for customer-uploaded photographs.

Requirements:

- Validate file type and file size.
- Use randomized storage object names.
- Never trust the filename or MIME type alone.
- Use server-side validation.
- Prevent unauthorized access to uploaded files.
- Do not place private uploaded photographs in public, indexable directories.
- Associate uploaded assets with the correct cart item or order.
- Restrict access to authorized staff who need the files for fulfilment.
- Define a retention and deletion policy.

The owner must be able to access the approved personalization details associated with a paid order.

## 9.4 Customization Data Integrity

Each customized cart item must retain its own customization values.

If the same product is purchased twice with different names or photos, the customizations must remain separate.

Changing a customization should update the corresponding cart item, not accidentally overwrite another item.

---

# 10. SHOPPING CART

The cart must be a fully functional shopping component.

## 10.1 Required Features

- List cart items.
- Display product images.
- Display product names and selected variants.
- Display customization summaries.
- Change quantity.
- Remove items.
- Edit customization.
- Display item prices.
- Calculate subtotal.
- Calculate applicable discounts, if implemented.
- Calculate shipping.
- Display the final estimated total.
- Continue shopping.
- Proceed to checkout.

## 10.2 Cart Persistence

For guest customers, persist the cart using a suitable client-side mechanism or anonymous cart identifier.

Do not store payment secrets or sensitive payment credentials in the cart.

At checkout, retrieve current product prices and availability from the backend and recalculate the total.

If a product's price or availability has changed, inform the customer before payment.

## 10.3 Cart Validation

Reject:

- Invalid product IDs.
- Invalid variant IDs.
- Zero or negative quantities.
- Quantities above permitted stock.
- Invalid customization values.
- Manipulated prices or totals.

Never use a total submitted by the browser as the authoritative payment amount.

---

# 11. CHECKOUT

Checkout should be optimized for conversion and reliability.

## 11.1 Checkout Fields

Required fields should be configurable according to the fulfilment and tax requirements of the business.

Typical fields:

- Customer full name.
- Email address.
- Phone number.
- Address line 1.
- Address line 2, optional.
- City.
- State.
- Postal PIN code.
- Country.
- Delivery instructions, optional.

India should be the initial default country.

Validate email addresses, phone numbers, PIN codes, and required address fields on both the client and server.

Collect only the information needed for payment, fulfilment, communication, and legal obligations.

## 11.2 Checkout Summary

Show:

- Items.
- Selected variants.
- Customization summary.
- Quantity.
- Item price.
- Subtotal.
- Shipping charges.
- Applicable discount.
- Final amount payable.

The final amount must be calculated and persisted on the server.

## 11.3 Order Creation

Before initiating payment:

1. Validate the cart and customer details.
2. Retrieve current prices and inventory.
3. Validate customizations.
4. Calculate the final amount.
5. Generate a unique internal order ID.
6. Create a pending-payment order record.
7. Initiate payment through the configured provider.
8. Store the provider's transaction or order reference.
9. Redirect or present the supported checkout experience.

A failed payment must not result in an order being marked paid.

The system should support safe payment retries without creating duplicate paid orders.

---

# 12. PAYMENT GATEWAY: PAYTM AND UPI

## 12.1 Business Requirement

Integrate Paytm Payment Gateway for production checkout, subject to merchant onboarding, approval, and the payment methods enabled for the merchant account.

Customers should be able to pay using the UPI methods presented by the approved Paytm checkout integration.

Support the provider's permitted mobile and desktop payment experiences.

Do not assume that every UPI application, intent flow, QR mode, or payment method will be available for every merchant configuration.

## 12.2 Payment Architecture

All payment initiation and verification must occur through trusted server-side code.

The frontend must never contain:

- Paytm merchant secrets.
- Private signing keys.
- Privileged database credentials.
- Unrestricted administrative credentials.

Use the current official Paytm merchant integration documentation when implementing APIs, SDKs, checksums, signatures, callback handling, and transaction-status checks.

Do not rely on outdated integration examples or invent undocumented endpoints.

## 12.3 Payment Flow

1. Customer submits checkout.
2. Backend validates the order.
3. Backend calculates and stores the final amount.
4. Backend creates the pending-payment order.
5. Backend requests payment initiation using the approved Paytm integration.
6. Customer completes the available payment flow.
7. Paytm returns a callback, redirects the browser, or sends a webhook as supported.
8. Backend validates the response according to Paytm's documented security requirements.
9. Backend independently verifies transaction status with Paytm where required.
10. Backend confirms that the provider transaction corresponds to the expected order, merchant, amount, and currency.
11. Only a verified successful transaction can transition the order to paid.
12. The system triggers fulfilment and email-notification workflows.

## 12.4 Payment Verification Requirements

Validate the applicable provider response signature or checksum.

Also verify:

- Expected internal order reference.
- Expected provider transaction or order reference.
- Correct merchant account.
- Exact expected amount.
- Correct currency.
- Final successful payment status.
- Transaction consistency with the stored payment attempt.

A browser redirect alone is not proof of payment.

A screenshot, uploaded receipt, client-side success message, or manually modified frontend state must never mark an order as paid.

If a webhook is used, verify its authenticity according to the provider's documentation.

Where appropriate, retrieve the transaction status directly from Paytm to resolve uncertain or delayed callbacks.

## 12.5 Payment State Machine

Implement explicit payment states:

- `created`
- `pending`
- `success`
- `failed`
- `cancelled`
- `expired`
- `refunded`
- `partially_refunded`, if partial refunds are supported.

Transitions must be validated on the server.

A delayed failure callback must not overwrite an already verified successful payment.

A duplicate successful callback must not create another order, send duplicate receipts, or deduct stock twice.

Use database transactions, idempotency controls, and unique provider transaction references where appropriate.

## 12.6 Uncertain Payment Outcomes

If the customer closes the payment window or the provider's response is delayed:

- Do not immediately declare the payment failed.
- Show a pending or verifying status.
- Recheck the transaction through the supported provider status mechanism.
- Permit the customer to revisit the order-status page.
- Prevent a second payment attempt from incorrectly duplicating an existing successful payment.

## 12.7 Direct UPI Alternative

If the business later chooses direct UPI QR or payment links instead of Paytm's gateway, automatic payment verification must not be promised unless a reliable verification integration is available.

A static QR code and a customer-provided screenshot do not independently establish successful payment.

The production implementation must use one clearly defined payment architecture rather than mixing simulated payments, direct UPI, and gateway verification without explicit state handling.

## 12.8 Payment Security

- Keep credentials in server-side environment variables.
- Never log secrets or complete sensitive payment payloads unnecessarily.
- Validate every incoming callback.
- Use HTTPS.
- Enforce amount matching.
- Enforce idempotency.
- Rate-limit sensitive endpoints.
- Maintain an audit trail for payment-state changes.
- Verify refunds against actual provider outcomes.
- Never expose raw provider responses containing sensitive information to customers.

---

# 13. ORDER MANAGEMENT

Every checkout must produce a durable internal order record.

## 13.1 Order Data

An order should include:

- Internal order ID.
- Public order reference.
- Customer name.
- Customer email.
- Customer phone.
- Shipping address.
- Item snapshots.
- Product and variant identifiers.
- Item names and prices at purchase time.
- Quantities.
- Customization snapshots.
- Subtotal.
- Shipping amount.
- Discount amount.
- Final amount.
- Currency.
- Payment state.
- Provider references.
- Fulfilment state.
- Created timestamp.
- Paid timestamp.
- Updated timestamp.

Order items must preserve their original purchased prices and descriptions even if the product catalogue changes later.

## 13.2 Fulfilment Status

Use a separate fulfilment state machine, for example:

- `unfulfilled`
- `processing`
- `packed`
- `shipped`
- `delivered`
- `cancelled`
- `returned`

Do not confuse payment status with fulfilment status.

A paid order may still be awaiting production, packing, or shipment.

## 13.3 Order Status Page

After checkout, show an order-status page containing:

- Public order reference.
- Current payment state.
- Order summary.
- Customer support contact.
- Relevant next steps.

Never expose an order solely through a predictable sequential ID.

Use an authenticated customer session or a securely generated, high-entropy order-access token. Apply appropriate expiration and access controls.

Do not put private customer information in public URLs.

---

# 14. EMAIL AUTOMATION

The system must send two primary transactional email types after a verified successful payment:

1. Order notification to the business owner.
2. Order confirmation and payment receipt to the buyer.

Use a transactional email service such as Resend, or another provider selected for production.

## 14.1 Owner Order Notification

The owner notification should include:

- Order reference.
- Payment status.
- Payment transaction reference.
- Customer name.
- Customer contact details needed for fulfilment.
- Shipping address.
- Products ordered.
- Variants and quantities.
- Personalization information.
- Relevant access links for uploaded customer files.
- Subtotal.
- Shipping.
- Discounts.
- Total amount paid.
- Order creation and payment timestamps.

The email should be formatted as a professional, readable order summary.

Sensitive customer-uploaded content should be linked through an appropriately secured access mechanism rather than exposed publicly.

## 14.2 Buyer Order Confirmation

The buyer email should include:

- Brand logo and name.
- Order reference.
- Order date.
- Itemized products.
- Selected variants.
- Quantities.
- Personalization summary where appropriate.
- Subtotal.
- Shipping charges.
- Discounts.
- Final amount paid.
- Payment status.
- Payment transaction reference, where appropriate.
- Shipping address.
- Support contact.
- Link to the order-status page.
- Relevant shipping and return information.

## 14.3 Payment Receipt

The email must provide a clear payment receipt or receipt-style order confirmation.

Do not misrepresent an ordinary receipt as a GST tax invoice. If a tax invoice is legally required, implement the necessary invoice fields and numbering according to the business's tax obligations.

Do not invent a GSTIN, tax rate, invoice number, or tax registration.

## 14.4 Email Triggering

Emails must be triggered by the backend only after the payment is verified.

Use a durable notification mechanism, such as a database-backed outbox or queued jobs.

Requirements:

- Prevent duplicate notifications on repeated callbacks.
- Retry temporary email failures.
- Record email-delivery attempt status.
- Keep order confirmation separate from payment verification.
- Do not roll back a successful payment merely because email delivery fails.
- Allow the owner to retry failed emails from the admin dashboard.

Suggested email event keys:

- `owner_order_paid:{order_id}`
- `buyer_receipt:{order_id}`

Enforce uniqueness or equivalent idempotency for each notification event.

The customer-facing success page should not depend on the email provider responding successfully.

---

# 15. ADMIN DASHBOARD

Build a private administration dashboard.

The dashboard must not be accessible to ordinary customers.

## 15.1 Authentication and Authorization

- Use a trusted authentication mechanism.
- Restrict administrative access to explicitly authorized accounts.
- Enforce authorization on the server for every admin operation.
- Use role-based permissions if additional staff accounts are introduced.
- Apply rate limiting to authentication endpoints.
- Protect sessions and sensitive administrative actions.
- Record important administrative changes in an audit log.

Do not rely on hiding admin links in the frontend as an access-control mechanism.

## 15.2 Dashboard Overview

Display operational metrics such as:

- Total orders.
- Paid orders.
- Pending payments.
- Revenue from verified paid orders.
- Orders awaiting fulfilment.
- Recently received orders.
- Low-stock products.
- Failed email notifications.

Calculate these metrics from trusted database records, not browser-supplied data.

## 15.3 Product Management

Administrators must be able to:

- Create products.
- Edit products.
- Upload product photographs.
- Reorder product-gallery images.
- Set product prices.
- Set sale prices, if enabled.
- Manage variants.
- Manage stock.
- Set fulfilment models.
- Configure customization fields.
- Assign categories.
- Mark products as featured.
- Publish or unpublish products.
- Archive products.

Validate all changes on the server.

## 15.4 Order Management

Administrators must be able to:

- View orders.
- Search by order reference.
- Filter by date.
- Filter by payment state.
- Filter by fulfilment state.
- View item and customer details.
- Access authorized personalization files.
- Update fulfilment status.
- Add internal notes.
- Review payment transaction references.
- Review email-notification status.
- Retry eligible failed email notifications.
- Initiate or record refunds through a properly verified workflow.

Never allow an admin interface to mark an unverified transaction as paid merely by changing a dropdown.

Any exceptional manual reconciliation process must require explicit authorization and an audit record.

## 15.5 Configuration

Provide configurable settings for:

- Brand name.
- Logo.
- Contact details.
- Owner notification email.
- Announcement bar.
- Shipping rules.
- Free-shipping threshold, if applicable.
- Store policies.
- Product collections.
- Supported delivery regions.
- Tax and invoice settings, when applicable.

Changes to payment secrets must be handled through secure deployment or secrets-management settings rather than displayed in the admin UI.

---

# 16. 3D EXPERIENCE AND ANIMATION

The 3D experience is a major visual differentiator, but it must remain lightweight and purposeful.

## 16.1 Technology

Preferred implementation:

- Three.js.
- React Three Fiber.
- Drei utilities where appropriate.
- Framer Motion for interface animation.
- CSS transforms for simple effects.
- GSAP only where a complex scroll-timeline genuinely requires it.

Do not introduce multiple overlapping animation systems without a clear reason.

## 16.2 Signature 3D Hero

Create an elegant gift-inspired hero scene.

Possible elements:

- A floating gift box.
- Soft fabric ribbons.
- Shells and pearls.
- Layered Polaroid cards.
- Subtle paper or linen textures.
- Warm ambient lighting.
- A restrained parallax effect.

The scene should reinforce the gifting brand.

It must not obstruct the headline, navigation, or main shopping CTA.

## 16.3 Product Interactions

For product cards:

- Slight elevation on hover.
- Subtle image scaling.
- Smooth state transitions.
- Clear focus states.
- Optional gentle tilt on capable desktop devices.

Avoid aggressive perspective distortion or continuously spinning product cards.

For the initial shell jewellery collection, high-quality photographs should remain the source of truth for product appearance.

True 3D product models may be introduced later if suitable models are available.

## 16.4 Scroll-Based Storytelling

Use subtle animations to transition between:

- Hero section.
- Jewellery collections.
- Scrapbook-inspired keepsakes.
- Featured products.
- Brand story.

Animations should not lock the scroll, hijack navigation, or force users to wait.

## 16.5 Reduced Motion

Respect the user's reduced-motion system preference.

When reduced motion is enabled:

- Disable or simplify nonessential parallax.
- Avoid large continuous movements.
- Replace elaborate transitions with simple fades or immediate state changes.
- Preserve all functionality.

## 16.6 Mobile Performance

On mobile:

- Use simplified 3D scenes.
- Reduce model complexity.
- Limit simultaneous animations.
- Load below-the-fold scenes lazily.
- Avoid rendering invisible canvases.
- Use responsive image sizes.
- Provide a static visual fallback.

The website must remain usable if WebGL is unavailable.

## 16.7 Animation Acceptance Criteria

- Buttons remain clickable during transitions.
- No animation blocks checkout.
- No content is hidden permanently because an animation failed.
- Reduced-motion preferences are respected.
- The site remains navigable without 3D.
- Product information remains readable on small screens.
- The 3D scene does not cause significant layout shifts.

---

# 17. TECHNICAL ARCHITECTURE

## 17.1 Preferred Stack

Use the following architecture unless implementation investigation reveals a concrete incompatibility.

| Layer | Preferred technology |
|---|---|
| Framework | Next.js with App Router |
| Language | TypeScript with strict mode |
| UI | React |
| Styling | Tailwind CSS or an equivalent consistent design system |
| Components | Accessible reusable component library |
| Animation | Framer Motion |
| 3D | Three.js and React Three Fiber |
| Database | PostgreSQL |
| Backend platform | Supabase, including suitable server-side integration |
| Authentication | Supabase Auth or an equivalent trusted mechanism |
| Image storage | Supabase Storage or another suitable object-storage service |
| Payment gateway | Paytm Payment Gateway |
| Transactional email | Resend or equivalent |
| Hosting | Vercel |
| Source control | GitHub |
| Testing | Unit, integration, end-to-end, accessibility and security tests |

The final architecture must be internally consistent. Do not duplicate responsibilities across multiple services without a clear requirement.

## 17.2 Application Structure

Use a modular project structure organized around:

- Application routes.
- Reusable UI components.
- Design tokens.
- Product catalogue.
- Cart and checkout.
- Personalization.
- Order management.
- Payment provider integration.
- Email notifications.
- Admin dashboard.
- Database access.
- Authentication and authorization.
- Validation schemas.
- Logging and monitoring.
- Tests.

Keep payment, inventory, order, and email business logic outside presentational components.

## 17.3 Server-Side Boundaries

Use server-side code for:

- Creating orders.
- Recalculating totals.
- Checking stock.
- Initiating payments.
- Verifying payment status.
- Handling webhooks.
- Updating payment states.
- Triggering transactional emails.
- Enforcing administrative permissions.
- Managing sensitive upload access.

Client-side validation may improve usability but must not replace server-side validation.

## 17.4 Database Access

Use a least-privilege access model.

If Supabase is selected:

- Enable Row Level Security on tables accessible through client-facing APIs.
- Define explicit access policies.
- Keep service-role credentials server-only.
- Use server-side database access for privileged operations.
- Restrict uploaded files through storage policies or secure server-generated access.
- Test access using unauthenticated, authenticated-customer, and admin identities.

A database being hosted by a reputable provider does not automatically make the application secure.

## 17.5 Vercel Deployment

The application must be compatible with the deployment platform's runtime and execution limits.

Requirements:

- Production build succeeds.
- Environment variables are configured for the correct environment.
- No secret is embedded in a client bundle.
- API routes are deployable.
- Webhook endpoints are reachable by the provider.
- Database connectivity is reliable.
- Long-running tasks are handled through suitable durable mechanisms.
- Domain and HTTPS configuration are documented.

Do not assume that in-memory state will persist between serverless function executions.

---

# 18. DATABASE DESIGN

Design a normalized database schema with appropriate foreign keys, indexes, constraints, and timestamps.

The following is the minimum logical model.

## 18.1 `categories`

Fields:

- `id`
- `name`
- `slug`
- `description`
- `image_path`
- `parent_id`, nullable
- `is_active`
- `sort_order`
- `created_at`
- `updated_at`

## 18.2 `products`

Fields:

- `id`
- `category_id`
- `name`
- `slug`
- `short_description`
- `description`
- `status`
- `fulfilment_type`
- `is_featured`
- `created_at`
- `updated_at`

## 18.3 `product_variants`

Fields:

- `id`
- `product_id`
- `sku`
- `variant_name`
- `attributes`, using an appropriately validated structured format
- `price_minor`
- `compare_at_price_minor`, nullable
- `stock_quantity`, nullable for applicable fulfilment models
- `is_active`
- `created_at`
- `updated_at`

Store monetary values as integer minor units, or use an appropriately precise numeric representation. Do not use floating-point arithmetic for financial totals.

## 18.4 `product_images`

Fields:

- `id`
- `product_id`
- `variant_id`, nullable
- `storage_path`
- `alt_text`
- `sort_order`
- `created_at`

## 18.5 `carts` and `cart_items`

Store the cart identifier, item references, quantities, selected variants, and validated customization data as appropriate.

If carts are persisted in the database, enforce appropriate access controls for guest and authenticated carts.

## 18.6 `orders`

Fields:

- `id`
- `public_reference`
- `customer_id`, nullable
- `customer_name`
- `customer_email`
- `customer_phone`
- `shipping_address`, with structured validated fields or an appropriate snapshot
- `currency`
- `subtotal_minor`
- `shipping_minor`
- `discount_minor`
- `total_minor`
- `payment_status`
- `fulfilment_status`
- `paid_at`, nullable
- `created_at`
- `updated_at`

Enforce uniqueness on public order references.

## 18.7 `order_items`

Fields:

- `id`
- `order_id`
- `product_id`, nullable if historical retention requires the item to survive product deletion
- `variant_id`, nullable
- `product_name_snapshot`
- `sku_snapshot`
- `variant_snapshot`
- `unit_price_minor`
- `quantity`
- `line_total_minor`
- `customization_snapshot`
- `created_at`

The database must preserve the original purchase details.

## 18.8 `payments`

Fields:

- `id`
- `order_id`
- `provider`
- `provider_order_reference`
- `provider_transaction_reference`, nullable until available
- `amount_minor`
- `currency`
- `status`
- `provider_response_reference`, where useful
- `verified_at`, nullable
- `created_at`
- `updated_at`

Use appropriate uniqueness constraints for provider references.

Store only the provider information needed for reconciliation and support. Avoid storing unnecessary sensitive payloads.

## 18.9 `payment_events`

Store a minimal audit trail of payment events and processing outcomes.

Fields may include:

- `id`
- `payment_id`
- `provider_event_reference`, where available
- `event_type`
- `processing_status`
- `received_at`
- `processed_at`
- `error_code`, where appropriate

Enforce deduplication where the provider supplies stable event identifiers.

## 18.10 `uploaded_assets`

Fields:

- `id`
- `order_item_id`, nullable before order association
- `owner_user_id`, where applicable
- `storage_path`
- `original_filename`, only if needed
- `validated_content_type`
- `file_size`
- `status`
- `created_at`
- `deleted_at`, nullable

Private storage and authorization must be enforced independently of this metadata table.

## 18.11 `email_outbox`

Fields:

- `id`
- `order_id`
- `event_key`
- `recipient`
- `template_type`
- `status`
- `attempt_count`
- `last_error_code`, where appropriate
- `sent_at`, nullable
- `created_at`
- `updated_at`

Enforce uniqueness on the appropriate order and notification event combination.

## 18.12 `admin_audit_logs`

Fields:

- `id`
- `actor_user_id`
- `action`
- `entity_type`
- `entity_id`
- `metadata`, limited to non-sensitive audit information
- `created_at`

Never log passwords, secrets, full payment credentials, or unnecessary personal information.

## 18.13 Schema Design Requirements

- Use foreign keys.
- Index common search and filtering fields.
- Add constraints for valid quantities and monetary values.
- Preserve historical order snapshots.
- Use transactions for critical state changes.
- Apply least-privilege access policies.
- Document migration procedures.
- Provide seed data for development without using real customer information.

---

# 19. SECURITY REQUIREMENTS

Security is a core requirement, not a final polishing task.

## 19.1 Application Security

- Validate all untrusted inputs.
- Use safe database query mechanisms.
- Prevent SQL injection.
- Protect against cross-site scripting.
- Implement appropriate CSRF protections where applicable.
- Configure secure session handling.
- Restrict administrative access.
- Avoid leaking stack traces or internal errors.
- Set appropriate security headers.
- Apply rate limiting to sensitive endpoints.
- Validate uploaded files.
- Prevent unauthorized object access.
- Keep dependencies updated.
- Use secure secret management.
- Maintain production and development environment separation.

## 19.2 Payment Security

- Verify signatures or checksums as required by the provider.
- Check transaction status through trusted server-side mechanisms.
- Verify the amount and order reference.
- Handle repeated callbacks idempotently.
- Prevent unauthorized payment-state changes.
- Record reconciliation outcomes.
- Do not accept client-side success flags as proof.
- Never store UPI PINs or payment credentials.

## 19.3 Business Logic Security

The backend must prevent:

- Price manipulation.
- Unauthorized discounts.
- Stock overselling.
- Cross-customer order access.
- Unauthorized access to uploaded photographs.
- Duplicate payment processing.
- Duplicate order confirmation emails.
- Unauthorized product modifications.
- Unauthorized refund or cancellation actions.

## 19.4 Privacy

- Collect only necessary customer data.
- Explain how uploaded photographs are used.
- Restrict access to customer personalization content.
- Define retention and deletion practices.
- Avoid logging unnecessary personal information.
- Provide appropriate privacy and contact information.
- Apply applicable Indian data-protection and consumer requirements to the actual business model.

## 19.5 Error Handling

Use friendly customer-facing messages.

Do not expose:

- Environment variables.
- API keys.
- Database credentials.
- Internal SQL statements.
- Raw stack traces.
- Private provider responses.
- Other customers' information.

Detailed diagnostics should be recorded securely on the server.

---

# 20. PERFORMANCE AND ACCESSIBILITY

## 20.1 Performance Goals

Target the following Core Web Vitals at the 75th percentile of real user visits, where sufficient field data is available:

- Largest Contentful Paint: no more than 2.5 seconds.
- Interaction to Next Paint: no more than 200 milliseconds.
- Cumulative Layout Shift: no more than 0.1.

These are targets to validate, not claims that can be guaranteed before testing.

Use optimized image formats, responsive images, lazy loading, appropriate caching, and limited client-side JavaScript.

Avoid loading large 3D assets before they are needed.

## 20.2 Accessibility

Target WCAG 2.2 AA where applicable.

Requirements:

- Semantic HTML.
- Keyboard navigation.
- Visible focus indicators.
- Accessible forms.
- Meaningful image alt text.
- Accessible error messages.
- Adequate contrast.
- Reduced-motion support.
- Screen-reader-friendly cart updates.
- Accessible modals and navigation.
- No hover-only functionality.

## 20.3 Responsive Breakpoints

Define a consistent responsive system for:

- Small mobile devices.
- Standard mobile devices.
- Tablets.
- Laptops.
- Wide desktop displays.

The layout must adapt rather than overflow.

Test common mobile browsers and current desktop browsers.

---

# 21. SEO AND ANALYTICS

## 21.1 SEO

Implement:

- Page-specific titles and descriptions.
- Canonical URLs where appropriate.
- Product and category metadata.
- Open Graph metadata.
- XML sitemap.
- Robots configuration.
- Structured data for eligible products.
- Descriptive image alt text.
- Clean URL slugs.
- Appropriate handling of unavailable and archived products.

Do not expose customer data or private order pages to search engines.

## 21.2 Analytics

The system may integrate a privacy-conscious analytics tool after the core application is stable.

Track useful events such as:

- Product viewed.
- Search performed.
- Item added to cart.
- Checkout started.
- Payment initiated.
- Payment verified.
- Order completed.

Do not report a conversion merely because a customer lands on the payment-return page.

A completed purchase event must be based on the trusted backend's verified payment result.

Do not send unnecessary personal information, private personalization content, or payment secrets to analytics providers.

---

# 22. ERROR STATES AND EDGE CASES

The implementation must explicitly handle the following scenarios.

## 22.1 Product and Cart

- Product becomes unavailable during checkout.
- Price changes after the item is added.
- Quantity exceeds stock.
- Required variant is missing.
- Customization is incomplete.
- Upload fails.
- An invalid product ID is submitted.
- Cart contents are lost or corrupted.
- Duplicate cart items have different customizations.

## 22.2 Payment

- Payment initiation fails.
- Customer cancels payment.
- Customer closes the browser.
- Payment remains pending.
- Callback is delayed.
- Callback is repeated.
- Invalid signature is received.
- Transaction amount does not match.
- Provider transaction reference does not match.
- Payment succeeds but the browser never returns.
- Payment succeeds but email delivery fails.
- A payment is later refunded.
- A customer attempts to pay for an already paid order.

## 22.3 Email

- Email service is unavailable.
- Owner email address is misconfigured.
- Buyer email is invalid.
- Provider rate limit is reached.
- Email delivery is delayed.
- Duplicate notification event is received.

Email failure must not change a verified payment into a failed payment.

## 22.4 Administration

- Unauthorized user accesses an admin route.
- Admin changes a price while an item is in a cart.
- Admin archives a product referenced by an existing order.
- Admin attempts to change payment status manually.
- Admin attempts to access an unauthorized customer's upload.
- Admin performs an action twice.

Each critical case must have predictable behaviour, a clear customer message, and suitable logging.

---

# 23. TESTING STRATEGY

Testing must cover both the visual experience and the underlying business logic.

## 23.1 Unit Tests

Test:

- Price calculations.
- Shipping calculations.
- Discount calculations, if enabled.
- Variant validation.
- Quantity validation.
- Customization validation.
- Payment-state transitions.
- Order-state transitions.
- Idempotency rules.
- Email event creation.

## 23.2 Integration Tests

Test:

- Product retrieval from the database.
- Cart validation against actual product data.
- Order creation.
- Inventory checks.
- Payment initiation.
- Signature or checksum validation.
- Payment-status verification.
- Order confirmation.
- Email-outbox processing.
- Access policies for customer uploads.

## 23.3 End-to-End Tests

Test the following complete journeys:

1. Customer browses the store and opens a shell bracelet product.
2. Customer selects a valid variant and adds it to the cart.
3. Customer updates the quantity and sees the correct total.
4. Customer personalizes a gift and uploads an allowed photograph.
5. Customer completes checkout validation.
6. Customer initiates payment.
7. A verified successful payment results in a paid order.
8. The owner notification is generated.
9. The buyer receipt is generated.
10. A repeated callback does not duplicate the order, inventory deduction, or email event.
11. A failed payment does not confirm the order.
12. A manipulated amount is rejected.
13. An unauthorized customer cannot access another customer's order.
14. An unauthorized user cannot access the admin dashboard.
15. The shopping experience works on mobile.
16. The website remains functional with reduced motion and without WebGL.

## 23.4 Payment Testing

Use the payment provider's approved test environment and test credentials where available.

Do not test by transferring real money unnecessarily.

Test successful, failed, cancelled, pending, repeated, and delayed payment outcomes.

Before production launch, verify the live merchant configuration, webhook or callback setup, server-side verification, and reconciliation process.

## 23.5 Browser and Device Testing

Test current versions of:

- Chrome.
- Safari.
- Firefox.
- Edge.
- Android mobile browsers.
- iOS Safari.

Include a lower-powered mobile device to evaluate the 3D experience.

## 23.6 Quality Gates

The project must not be considered production-ready until:

- The production build passes.
- Critical automated tests pass.
- Payment verification is tested.
- Administrative access controls are tested.
- Checkout is tested end to end.
- Email retry and idempotency behaviour is tested.
- No critical or high-severity known security issue remains unresolved.
- The deployed application has working environment configuration and monitoring.

---

# 24. DEVELOPMENT PHASES

Build the project incrementally. Do not attempt to generate the entire application in one unstructured code-generation step.

## Phase 1 — Foundation

Deliverables:

- Project setup.
- Next.js and TypeScript configuration.
- Design tokens.
- Reusable components.
- Global layout.
- Navigation.
- Responsive styling.
- Brand configuration.
- Initial deployment pipeline.

Acceptance criteria:

- The application builds successfully.
- Layout works on mobile and desktop.
- The design system is consistent.
- No production secrets are committed to source control.

## Phase 2 — Visual Experience

Deliverables:

- Homepage.
- Hero section.
- Product collections.
- Featured product grid.
- Initial 3D scene.
- Scroll and hover animations.
- Reduced-motion support.
- Responsive fallbacks.

Acceptance criteria:

- The visual direction matches this PRD.
- The supplied jewellery photographs are used correctly.
- 3D does not block browsing.
- All visible links and buttons have real actions.

## Phase 3 — Catalogue and Product Pages

Deliverables:

- Database schema.
- Product data access.
- Category pages.
- Search and filters.
- Product detail pages.
- Product gallery.
- Variant selection.
- Admin product management.

Acceptance criteria:

- Product information comes from the database.
- Product pages use the correct product assets.
- Prices and availability are consistent.
- Invalid products and variants are handled safely.

## Phase 4 — Cart and Personalization

Deliverables:

- Persistent cart.
- Quantity controls.
- Cart totals.
- Variant handling.
- Personalized product forms.
- Secure photo uploads.
- Server-side validation.

Acceptance criteria:

- Cart operations work.
- Different customized items remain independent.
- Invalid inputs are rejected.
- The server recalculates the checkout total.

## Phase 5 — Checkout and Payment

Deliverables:

- Checkout form.
- Address validation.
- Order creation.
- Paytm integration.
- Payment state machine.
- Verified callbacks or webhooks.
- Transaction-status reconciliation.
- Idempotency protections.

Acceptance criteria:

- Only verified successful payments mark orders as paid.
- Amount mismatches are rejected.
- Duplicate callbacks are safe.
- Pending payments are handled correctly.
- Failed payments do not generate paid-order confirmations.

## Phase 6 — Email and Admin Operations

Deliverables:

- Owner order notification.
- Buyer confirmation and receipt.
- Email outbox and retries.
- Order dashboard.
- Fulfilment management.
- Stock management.
- Administrative audit logs.

Acceptance criteria:

- Paid orders produce the appropriate email events.
- Email failures can be retried.
- Notifications are not duplicated.
- Admin actions are authorized and audited.

## Phase 7 — Hardening and Launch

Deliverables:

- Security testing.
- Accessibility review.
- Performance optimization.
- SEO configuration.
- Error monitoring.
- Production payment testing.
- Policy pages.
- Backup and recovery procedures.
- Production deployment documentation.

Acceptance criteria:

- All critical journeys pass.
- Payment and email integrations work in the production configuration.
- Privacy and business policies are populated with approved content.
- There are no unresolved critical security issues.
- The owner can manage products and fulfil orders independently.

---

# 25. ACCEPTANCE CRITERIA FOR THE COMPLETE PRODUCT

The project is complete only when all of the following are satisfied.

### Design

- [ ] The website has an elegant, light-toned visual identity.
- [ ] Actual shell jewellery photographs are used for the initial products.
- [ ] The homepage includes purposeful 3D or equivalent interactive visual elements.
- [ ] The website is responsive.
- [ ] Animations are subtle and support usability.
- [ ] Reduced-motion and non-WebGL fallbacks work.

### Catalogue

- [ ] All nine requested product groupings are supported.
- [ ] Product pages contain accurate product details.
- [ ] Search and collection navigation work.
- [ ] Product variants and stock are handled correctly.
- [ ] Product information can be managed from the admin dashboard.

### Shopping

- [ ] Add to Cart works.
- [ ] Cart contents persist appropriately.
- [ ] Quantities can be changed.
- [ ] Items can be removed.
- [ ] Personalization is retained per cart item.
- [ ] Checkout totals are recalculated by the backend.

### Payments

- [ ] Paytm integration uses approved merchant configuration.
- [ ] Supported UPI payment methods are presented correctly.
- [ ] Payment verification is server-side.
- [ ] Order references and amounts are verified.
- [ ] Duplicate callbacks are handled safely.
- [ ] Pending and failed payments do not produce false success states.

### Emails

- [ ] The owner receives a paid-order notification.
- [ ] The buyer receives an order confirmation and receipt.
- [ ] Emails contain accurate order details.
- [ ] Email failures can be retried.
- [ ] Duplicate payment callbacks do not duplicate notifications.

### Administration

- [ ] Admin access is protected.
- [ ] Products can be created, updated, published, and archived.
- [ ] Orders can be searched and managed.
- [ ] Stock can be updated.
- [ ] Personalization files can be accessed only by authorized staff.
- [ ] Important administrative actions are logged.

### Production

- [ ] Environment variables are configured securely.
- [ ] Database policies are tested.
- [ ] Production build succeeds.
- [ ] Payment and email integrations are tested.
- [ ] Policies and contact details are populated.
- [ ] Deployment, backup, and recovery instructions exist.

---

# 26. EXPLICITLY OUT OF SCOPE FOR THE INITIAL RELEASE

Unless separately approved, do not spend initial development time on:

- A native Android or iOS application.
- Complex AI-powered gift recommendations.
- A marketplace supporting multiple independent sellers.
- A loyalty-points ecosystem.
- Subscription billing.
- Advanced 3D configurators requiring custom 3D assets for every product.
- Automated manufacturing or printing integrations.
- Complex courier aggregation.
- Multi-currency checkout.
- Multi-language support.
- Automated marketing campaigns beyond essential transactional communications.
- Customer reviews populated with invented content.

The architecture should permit future expansion without making these features prerequisites for launch.

---

# 27. CONFIGURATION REQUIRED BEFORE PRODUCTION

The following details must be supplied or finalized by the business owner.

| Item | Required decision |
|---|---|
| Brand name | Final store name |
| Brand assets | Logo and final typography preferences |
| Product catalogue | Actual product names and descriptions |
| Pricing | Approved selling prices |
| Inventory | Stock quantities or made-to-order rules |
| Product variants | Actual available options |
| Product images | Final images for every product |
| Personalization | Required fields and product templates |
| Shipping | Serviceable areas, charges and delivery estimates |
| Returns | Applicable cancellation, return and refund policies |
| Contact details | Support email and business contact information |
| Owner notifications | Destination email address |
| Payment gateway | Approved Paytm merchant account and credentials |
| Email service | Verified sender domain and service credentials |
| Database | Production project and access policies |
| Domain | Final website domain |
| Tax settings | Applicable business and invoicing requirements |

Do not invent missing values. Use development configuration until the owner provides the production details.

---

# 28. IMPLEMENTATION INSTRUCTIONS FOR CLAUDE

You are the lead full-stack engineer responsible for implementing this PRD.

Your objective is to deliver a complete, maintainable, production-oriented ecommerce application.

## 28.1 Before Writing Code

1. Inspect the existing repository and its current state.
2. Identify the framework, dependencies, existing routes, assets, and reusable components.
3. Review the uploaded jewellery photographs.
4. Map the current project structure against this PRD.
5. Identify any missing infrastructure, credentials, or business decisions.
6. Propose a phased implementation plan.
7. Record architectural decisions and assumptions.
8. Do not overwrite working code without understanding its purpose.

If no repository exists, initialize the project with the specified architecture.

## 28.2 Implementation Rules

- Use TypeScript strict mode.
- Build reusable, accessible components.
- Keep UI components separate from business logic.
- Use validated schemas for API inputs.
- Keep all sensitive operations server-side.
- Use database migrations for schema changes.
- Use environment variables for configuration.
- Never hardcode production credentials.
- Never use mock payment success in production code.
- Never trust client-side prices or payment status.
- Never create fake order confirmations.
- Do not fabricate product details, stock, reviews, or business policies.
- Use the supplied product photographs as the initial catalogue references.
- Implement meaningful loading, empty, success, and error states.
- Avoid dead buttons, placeholder links, and decorative controls that appear functional.
- Add tests alongside critical business logic.
- Keep the application deployable at every major milestone.

## 28.3 Handling Missing Credentials

If Paytm credentials, email credentials, database access, or production configuration are unavailable:

1. Continue implementing the relevant architecture.
2. Create a clearly isolated integration layer.
3. Document the exact missing configuration.
4. Provide safe test or development behaviour where appropriate.
5. Make it impossible for development-only payment success to be mistaken for real payment success.
6. Do not claim a production integration is complete until it has been configured and tested.

Development payment simulators must be explicitly disabled in production builds.

## 28.4 Required Documentation

Create and maintain:

- `README.md`
- `.env.example`
- Database migration files.
- Database seed scripts for non-production data.
- Payment integration documentation.
- Email configuration documentation.
- Deployment instructions.
- Testing instructions.
- Security notes.
- Architecture documentation.
- A list of outstanding owner decisions.

Do not place actual secrets in `.env.example`.

## 28.5 Progress Reporting

At the end of every implementation phase, report:

- What was implemented.
- Which files were created or modified.
- Which tests were run.
- Which tests passed or failed.
- Which environment variables are needed.
- Which integrations are working.
- Which integrations still need credentials or provider approval.
- Which known issues remain.
- What the next implementation phase will cover.

Do not claim features work merely because their UI exists.

## 28.6 Final Delivery Requirements

The final deliverable must include:

1. Complete source code.
2. Responsive, polished storefront.
3. Actual initial jewellery product imagery.
4. Working catalogue and product detail pages.
5. Functional cart.
6. Personalization and private upload support.
7. Checkout and order creation.
8. Paytm payment integration with server-side verification.
9. Idempotent payment processing.
10. Owner and buyer email workflows.
11. Protected admin dashboard.
12. Database schema and migrations.
13. Automated tests.
14. Secure environment configuration.
15. Deployment instructions.
16. Production readiness checklist.
17. Explicit disclosure of any feature that remains unconfigured or incomplete.

The final result should be an elegant and emotionally engaging shopping experience backed by a reliable ecommerce system—not merely a beautiful homepage.

---

# 29. FINAL PRODUCT DEFINITION

The finished website should feel like a premium online gifting boutique built around shell jewellery, memories, and meaningful relationships.

Its visual identity should be recognizable through soft colours, editorial layouts, subtle 3D interactions, shell-inspired imagery, and scrapbook-like keepsakes.

Its commerce system must be equally strong: accurate product data, reliable cart behaviour, secure checkout, verified payments, durable order records, automated email receipts, private personalization uploads, and a protected owner dashboard.

**The guiding principle is simple: create an experience customers remember, and an ecommerce system the business can depend on.**