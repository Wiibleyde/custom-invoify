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
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                const module = await import(`@/i18n/locales/${locale}.json`);
                const translations = module.default?.form?.invoicePdf || {};
                setTranslations(translations);
            } catch (error) {
                console.error("Failed to load translations:", error);
                // Fallback to English
                try {
                    const enModule = await import(`@/i18n/locales/en.json`);
                    const enTranslations = enModule.default?.form?.invoicePdf || {};
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
        return { ...data, translations };
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
            <div className="border dark:border-gray-600 rounded-xl my-1">
                <DynamicInvoiceTemplate {...dataWithTranslations} />
            </div>
        </>
    );
}
