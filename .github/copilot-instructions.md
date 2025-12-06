# Invoify - AI Coding Agent Instructions

## Project Overview

**Invoify** is a Next.js 15 invoice generator web app with TypeScript, React, and Shadcn UI. It supports multiple languages (i18n), PDF generation via Puppeteer, email delivery, and multiple export formats (JSON, XLSX, CSV, XML). All invoice data persists in browser localStorage for offline access.

### Key Architecture

-   **Frontend**: React with React Hook Form + Zod validation
-   **Backend**: Next.js API routes for PDF generation and email
-   **State Management**: React Context (Invoice, Charges, Signature, Theme, Translation)
-   **PDF Generation**: Puppeteer (production with Sparticuz/Chromium for Vercel)
-   **i18n**: next-intl with 15+ locale files

---

## Critical Developer Workflows

### Local Development

```bash
npm run dev      # Start dev server with Puppeteer (local browser available)
npm run build    # Production build (uses puppeteer-core + Sparticuz)
npm run lint     # TypeScript + ESLint
npm run analyze  # Bundle analysis
```

### Environment Setup

Create `.env.local` with Nodemailer credentials for email features:

```env
NODEMAILER_EMAIL=your_email@example.com
NODEMAILER_PW=your_email_password
```

### Important: Puppeteer Behavior

-   **Development**: Uses system `puppeteer` with `--no-sandbox` (safe locally)
-   **Production**: Uses `puppeteer-core` + Sparticuz/Chromium for Vercel serverless
-   Both are configured in `services/invoice/server/generatePdfService.ts` with conditional imports
-   Timeout: 30s page load, 60s API route max duration

---

## Core Data Flow & State Management

### Invoice State Flow

1. **Entry Point**: `contexts/Providers.tsx` initializes form with React Hook Form + Zod
2. **Hydration**: Loads draft from `localStorage[LOCAL_STORAGE_INVOICE_DRAFT_KEY]` on mount
3. **Contexts** (all in `/contexts/`):
    - `InvoiceContext`: Main state for PDF, savedInvoices, form submission
    - `ChargesContext`: Handles line items (nested in InvoiceContext)
    - `SignatureContext`: Manages signature (draw/type/upload modes)
    - `ThemeProvider`: Dark/light mode
    - `TranslationContext`: Current locale

### Form Schema & Validation

-   **Schema**: `lib/schemas.ts` (Zod, ~176 lines)
-   **Reusable validators**: `fieldValidators` object (name, address, email, date, quantity, etc.)
-   **Default values**: `lib/variables.ts` → `FORM_DEFAULT_VALUES`
-   **Types**: All form types derived via `z.infer<typeof InvoiceSchema>` in `types.ts`

### How Components Access State

```tsx
// Use the form context (provided by Providers)
const { watch, handleSubmit } = useFormContext<InvoiceType>();

// Use invoice operations (PDF generation, export, save)
const { generatePdf, downloadPdf, sendPdfToMail } = useInvoiceContext();
```

---

## Key File Structure & Patterns

### `components/invoice/` - The Main UI Breakdown

-   `InvoiceForm.tsx`: Master form wrapper
-   `InvoiceMain.tsx`: Canvas/preview area
-   `InvoiceActions.tsx`: Top action buttons (generate PDF, export, send)
-   `form/`: Individual form sections (BillFromSection, Items, etc.)
-   `actions/`: PDF operations
    -   `LivePreview.tsx`: Real-time invoice preview (uses `InvoiceMain`)
    -   `PdfViewer.tsx`: Displays generated PDF blob
    -   `FinalPdf.tsx`: Controls PDF generation logic

### `app/api/invoice/` - Server Routes

-   `generate/route.ts`: POST → calls `generatePdfService` (Puppeteer)
-   `export/route.ts`: POST → exports invoice (JSON/CSV/XLSX/XML)
-   `send/route.ts`: POST → sends PDF via Nodemailer

### Service Layer (`services/invoice/`)

-   **client**: `exportInvoice.ts` - Browser-side export logic
-   **server**:
    -   `generatePdfService.ts` - Renders React template → HTML → Puppeteer PDF
    -   `sendPdfToEmailService.ts` - Nodemailer integration
    -   `generatePdfService.ts` - Core PDF generation

### Template System

-   **Dynamic templates** loaded via `getInvoiceTemplate(templateId)` in helpers
-   Located in `components/templates/invoice-pdf/`
-   Each template receives invoice data and renders as React component
-   React DOMServer converts to HTML string → Puppeteer renders → PDF

### i18n Pattern

-   **Routing**: `i18n/routing.ts` defines locales, defaultLocale
-   **Middleware**: Auto-redirects requests to locale prefix (e.g., `/en/`, `/ar/`)
-   **Locales**: JSON files in `i18n/locales/{lang}.json` (ar, en, fr, de, es, ja, etc.)
-   **Usage in components**: `useTranslations()` from next-intl
-   **Note**: Not fully implemented in templates yet (TODO in roadmap)

---

## Important Conventions & Gotchas

### LocalStorage & Drafts

-   Drafts auto-save on form changes via `InvoiceContext`
-   Key: `LOCAL_STORAGE_INVOICE_DRAFT_KEY` from `lib/variables.ts`
-   Dates must be revived when loading (see `Providers.tsx` line ~40)
-   **Never** lose draft on page reload - this is critical UX

### Form Submission Flow

-   `onFormSubmit` in `InvoiceContext` triggers:
    1. Save to savedInvoices (localStorage)
    2. Generate PDF via API
    3. Update `invoicePdf` blob and `pdfUrl`
    4. Display success toast
-   **No server-side persistence** - all data is browser-local

### Exporting Invoices

-   CSV/XLSX uses `@json2csv/node` (server-side)
-   JSON export is client-side via `exportInvoice.ts`
-   XML export also client-side
-   All respects current invoice state

### Currency Handling

-   Currencies JSON: `public/assets/data/currencies.json` (~200 currencies)
-   `fetchCurrencyDetails(currencyCode)` returns beforeDecimal/afterDecimal for number-to-words
-   Price formatting: `formatNumberWithCommas()` and `formatPriceToString()`

### Signature Modes

-   Three modes: draw, type, upload (enum in `types.ts`)
-   Managed by `SignatureContext`
-   Used in PDF templates

---

## Common Task Patterns

### Adding a New Form Field

1. Add to Zod schema in `lib/schemas.ts` (reuse `fieldValidators` if possible)
2. Update `FORM_DEFAULT_VALUES` in `lib/variables.ts`
3. Create form section component in `components/invoice/form/sections/`
4. Import in `InvoiceForm.tsx`
5. Test: form validation auto-applies, localStorage saves, PDF templates display

### Adding a New Invoice Template

1. Create React component in `components/templates/invoice-pdf/`
2. Receives `InvoiceType` as props
3. Add to mapping in `helpers.ts` → `getInvoiceTemplate()`
4. Update `TemplateSelector.tsx` to list new option
5. Template auto-renders in LivePreview and PDF generation

### Modifying the PDF Layout

1. Edit template component in `components/templates/invoice-pdf/`
2. Use Tailwind classes (CDN injected by Puppeteer)
3. **Test locally**: `npm run dev`, generate PDF, verify output
4. **Tip**: Use `@page` CSS rules for page breaks

### Supporting a New Language

1. Add locale file `i18n/locales/{code}.json` (copy from English, translate)
2. Add to `LOCALES` array in `lib/variables.ts`
3. Update `i18n/routing.ts` if needed (usually automatic)
4. Add language option to `LanguageSelector` component
5. Test: Switch lang in UI, verify page URL changes, translations appear

### Debugging PDF Generation Issues

-   Check `generatePdfService.ts` - most issues are in Puppeteer config or Tailwind CSS
-   **Common**: Missing styles → ensure Tailwind CDN URL correct in `lib/variables.ts`
-   **Common**: Page timeout → increase timeout in `page.setContent()` options
-   **Dev vs Prod**: Test with `npm run build && npm start` to simulate production Puppeteer

---

## Build & Deployment

### Next.js Configuration

-   `next.config.js`:
    -   `serverExternalPackages`: Puppeteer/Chromium (bypass bundler)
    -   Webpack ignores `.map` files
    -   Bundle analyzer enabled via `ANALYZE=true npm run analyze`
-   `tsconfig.json`: Strict mode, path alias `@/*` → root

### Environment & Performance

-   Analytics: Vercel Analytics integrated
-   Max API duration: 60s (for PDF generation)
-   Production: Uses Sparticuz Chromium headless browser on Vercel

---

## Key Dependencies to Know

| Package                                  | Purpose                    | Notes                                  |
| ---------------------------------------- | -------------------------- | -------------------------------------- |
| `next-intl`                              | i18n routing & translation | Middleware handles locale detection    |
| `react-hook-form`                        | Form state & validation    | Zod resolvers for type-safe validation |
| `zod`                                    | Schema validation          | All types derived from schemas         |
| `puppeteer-core` / `@sparticuz/chromium` | PDF generation             | Prod/dev conditional in service        |
| `@dnd-kit/*`                             | Drag-drop for items        | For reordering invoice line items      |
| `shadcn/ui` + Radix                      | Component library          | Dialog, form, select, etc.             |
| `nodemailer`                             | Email delivery             | Requires `.env.local` credentials      |
| `@json2csv/node`                         | CSV/XLSX export            | Server-side only                       |

---

## Quick Debugging Tips

1. **Form not saving**: Check localStorage key matches `LOCAL_STORAGE_INVOICE_DRAFT_KEY`
2. **PDF blank**: Verify template component receives invoice data correctly
3. **i18n URLs wrong**: Middleware must run; check `middleware.ts` config
4. **Puppeteer fails on production**: Ensure `serverExternalPackages` includes puppeteer-core
5. **Toasts not showing**: Check `ChargesContext` toast dispatch or `useToasts()` hook
6. **Tailwind not applied**: Puppeteer injects CDN; verify `TAILWIND_CDN` in `lib/variables.ts`

---

## When Adding New Features

-   **Persist state?** → Add to Zod schema, update localStorage hydration
-   **New export format?** → Add to `ExportTypes`, create service in `services/`, add API route
-   **New PDF feature?** → Modify template or add to template selector
-   **Needs i18n?** → Add key to all locale files, use `useTranslations()`
-   **Complex form?** → Break into sections, manage validity in `InvoiceContext`
