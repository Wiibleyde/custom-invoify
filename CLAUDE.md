# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Dev
bun dev          # Next.js dev server (http://localhost:3000)
bun build        # Production build
bun start        # Start production server
bun lint         # ESLint via next lint
bun analyze      # Bundle analysis (ANALYZE=true next build)
```

**First-time setup:** Puppeteer needs a local Chrome binary to generate PDFs in dev:

```bash
npx puppeteer browsers install chrome
# Installs to .cache/puppeteer/ (gitignored) — required once per clone
```

**Runtime note:** build uses Bun; production Docker image runs on Node 22.

```bash
# Docker
docker build -t invoify .
docker run -p 3000:3000 invoify
```

No test suite exists in this project.

## Architecture

**Next.js 15 App Router** with `next-intl` i18n. URL structure: `/{locale}/...` — middleware rewrites all non-API paths.

### Provider stack (`contexts/Providers.tsx`)

Wraps the entire app in this order:
```
ThemeProvider
  TranslationProvider
    FormProvider (react-hook-form, zod resolver, InvoiceSchema)
      InvoiceContextProvider
        ChargesContextProvider
```

`Providers` is a client component mounted at `app/[locale]/layout.tsx`. The `useFormContext<InvoiceType>()` hook is available anywhere below it.

### Data model

Single flat schema in `lib/schemas.ts` → `InvoiceType` (`types.ts`):
```
InvoiceType
  sender: { name, address, zipCode, city, country, email, phone, customInputs[] }
  receiver: { ...same... }
  details: { invoiceNumber, invoiceDate, dueDate, items[], currency, language, locale,
              taxDetails, discountDetails, shippingDetails, paymentInformation,
              signature, subTotal, totalAmount, totalAmountInWords, pdfTemplate, accentColor, ... }
```

`FORM_DEFAULT_VALUES` in `lib/variables.ts` is the authoritative initial state. Draft auto-saves to `localStorage["invoify:invoiceDraft"]` via a `watch()` subscription in `InvoiceContext`.

### PDF generation

`InvoiceContext.generatePdf` calls `POST /api/invoice/generate` with the current form values as JSON. The server (`services/invoice/server/generatePdfService.ts`) SSR's the React template to static HTML, then uses Puppeteer/Chromium (headless) to print a PDF with a real text layer.

- Dev: `puppeteer` (full, local Chrome)
- Prod: `puppeteer-core` + `@sparticuz/chromium`

Template used: `getInvoiceTemplate(pdfTemplate)` from `lib/helpers.ts` — resolves to `InvoiceTemplate{N}` component. Only `InvoiceTemplate1` exists currently.

### Translation architecture

- **UI**: `next-intl` with `en` and `fr` locales (`i18n/locales/`). Accessed via `useTranslations()` hook.
- **PDF labels**: templates receive a flat `translations: Record<string, string>` prop extracted from the locale JSON at render time. Both `LivePreview.tsx` (client) and `generatePdfService.ts` (server) independently map locale JSON → `pdfTranslations` using the same key set. If adding a new label to templates, update **both** locations.

### Invoice templates

Located at `app/components/templates/invoice-pdf/InvoiceTemplate{N}.tsx`. Each is a React component with signature `(data: InvoiceType & { translations?: Record<string, string> }) => JSX.Element`. They must use **inline styles only** — Puppeteer loads Tailwind from CDN for the server render, but inline styles are safer.

`DynamicInvoiceTemplate` wraps all templates with `next/dynamic` for code splitting.

### Contexts

- **`InvoiceContext`**: PDF blob state, generate/download/print/email/save/import actions. Uses `useFormContext()` internally — must be inside `FormProvider`.
- **`ChargesContext`**: Reactive subtotal/total calculation, discount/tax/shipping toggle state. Watches form via `useWatch`.
- **`SignatureContext`**: Signature drawing state (separate modal).

### API routes

| Route | Purpose |
|---|---|
| `POST /api/invoice/generate` | Server-side PDF via Puppeteer |
| `POST /api/invoice/send` | Email PDF with Nodemailer |
| `POST /api/invoice/export` | Export as JSON/CSV/XML/XLSX/DOCX |

### Key files

| Path | Role |
|---|---|
| `lib/variables.ts` | All constants, env vars, locale list, form defaults |
| `lib/schemas.ts` | Zod schema — source of truth for `InvoiceType` |
| `lib/helpers.ts` | `getInvoiceTemplate`, number formatting, currency lookup |
| `types.ts` | TypeScript types inferred from Zod schemas |
| `app/components/index.ts` | Single barrel export for all app components |

### Locales

Active locales: `en`, `fr` (defined in `lib/variables.ts → LOCALES`). Adding a locale requires:
1. New JSON file in `i18n/locales/`
2. Entry in `LOCALES` array in `lib/variables.ts`

### Environment variables

```
NODEMAILER_EMAIL   # Sender email for PDF delivery
NODEMAILER_PW      # Nodemailer password
GOOGLE_SC_VERIFICATION  # Google Search Console (optional)
```
