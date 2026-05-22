"use client";

import { useEffect, useState, useMemo } from "react";

// Components
import { DynamicInvoiceTemplate, Subheading } from "@/app/components";

// Contexts
import { useLocale } from "next-intl";

// Types
import { InvoiceType } from "@/types";

type LivePreviewProps = {
    data: InvoiceType;
};

export default function LivePreview({ data }: LivePreviewProps) {
    const locale = useLocale();
    const [translations, setTranslations] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                const module = await import(`@/i18n/locales/${locale}.json`);
                const translations = module.default || {};
                setTranslations(translations);
            } catch (error) {
                console.error("Failed to load translations:", error);
                // Fallback to English
                try {
                    const enModule = await import(`@/i18n/locales/en.json`);
                    const enTranslations = enModule.default || {};
                    setTranslations(enTranslations);
                } catch (enError) {
                    console.error("Failed to load English translations:", enError);
                }
            } finally {
                setLoading(false);
            }
        };

        loadTranslations();
    }, [locale]);

    const dataWithTranslations = useMemo(() => {
        const pdfTranslations: Record<string, string> = {
            invoiceTitle: translations.pdf?.invoiceTitle || "Invoice",
            invoiceDate: translations.form?.steps?.invoiceDetails?.issuedDate || "Issue Date",
            dueDate: translations.form?.steps?.invoiceDetails?.dueDate || "Due Date",
            billTo: translations.form?.steps?.fromAndTo?.billTo || "Bill To",
            item: translations.form?.steps?.lineItems?.item || "Item",
            qty: translations.form?.steps?.lineItems?.quantity || "Qty",
            rate: translations.form?.steps?.lineItems?.rate || "Rate",
            amount: translations.form?.steps?.lineItems?.total || "Amount",
            subtotal: translations.form?.steps?.summary?.subTotal || "Subtotal",
            discount: translations.form?.steps?.summary?.discount || "Discount",
            tax: translations.form?.steps?.summary?.tax || "Tax",
            shipping: translations.form?.steps?.summary?.shipping || "Shipping",
            total: translations.form?.steps?.summary?.totalAmount || "Total",
            additionalNotes: translations.form?.steps?.summary?.additionalNotes || "Notes",
            paymentTerms: translations.form?.steps?.summary?.paymentTerms || "Payment Terms",
            bankName: translations.form?.steps?.paymentInfo?.bankName || "Bank Name",
            accountName: translations.form?.steps?.paymentInfo?.accountName || "Account Name",
            accountNumber: translations.form?.steps?.paymentInfo?.accountNumber || "Account Number",
            paymentInformation: translations.pdf?.paymentInformation || "Payment Information",
            contactInformation: translations.pdf?.contactInformation || "Contact",
            signature: translations.pdf?.signature || "Signature",
            totalInWords: translations.pdf?.totalInWords || "Total in words",
        };
        
        return { ...data, translations: pdfTranslations };
    }, [data, translations]);

    if (loading) {
        return (
            <>
                <Subheading>Live Preview:</Subheading>
                <div className="border dark:border-gray-600 rounded-xl my-1 min-h-[60rem] bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </>
        );
    }

    return (
        <>
            <Subheading>Live Preview:</Subheading>
            <div id="invoice-print-root" className="border dark:border-gray-600 rounded-xl my-1">
                <DynamicInvoiceTemplate {...dataWithTranslations} />
            </div>
        </>
    );
}
