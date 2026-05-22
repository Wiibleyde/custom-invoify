"use client";

// RHF
import { useFormContext } from "react-hook-form";

// ShadCn
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";

// Components
import {
    CurrencySelector,
    DatePickerFormField,
    FormInput,
    FormFile,
    Subheading,
} from "@/app/components";

// Contexts
import { useTranslationContext } from "@/contexts/TranslationContext";

// Types
import { InvoiceType } from "@/types";

const InvoiceDetails = () => {
    const { _t } = useTranslationContext();
    const { control, watch } = useFormContext<InvoiceType>();
    const accentColor = watch("details.accentColor") || "#2563EB";

    return (
        <section className="flex flex-col flex-wrap gap-5">
            <Subheading>{_t("form.steps.invoiceDetails.heading")}:</Subheading>

            <div className="flex flex-row flex-wrap gap-5">
                <div className="flex flex-col gap-2">
                    <FormFile
                        name="details.invoiceLogo"
                        label={_t(
                            "form.steps.invoiceDetails.invoiceLogo.label"
                        )}
                        placeholder={_t(
                            "form.steps.invoiceDetails.invoiceLogo.placeholder"
                        )}
                    />

                    <FormInput
                        name="details.invoiceNumber"
                        label={_t("form.steps.invoiceDetails.invoiceNumber")}
                        placeholder="Invoice number"
                    />

                    <DatePickerFormField
                        name="details.invoiceDate"
                        label={_t("form.steps.invoiceDetails.issuedDate")}
                    />

                    <DatePickerFormField
                        name="details.dueDate"
                        label={_t("form.steps.invoiceDetails.dueDate")}
                    />

                    <CurrencySelector
                        name="details.currency"
                        label={_t("form.steps.invoiceDetails.currency")}
                        placeholder="Select Currency"
                    />

                    <FormField
                        control={control}
                        name="details.accentColor"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex w-full gap-5 items-center text-sm">
                                    <FormLabel className="flex-1">Accent Color:</FormLabel>
                                    <div className="flex-1 flex items-center gap-2">
                                        <FormControl>
                                            <input
                                                type="color"
                                                value={field.value || "#2563EB"}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                className="h-9 w-12 cursor-pointer rounded border p-1"
                                            />
                                        </FormControl>
                                        <span className="text-xs text-muted-foreground font-mono">{accentColor}</span>
                                    </div>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </section>
    );
};

export default InvoiceDetails;
