import React from "react";

// Components
import { InvoiceLayout } from "@/app/components";

// Helpers
import { formatNumberWithCommas, isDataUrl } from "@/lib/helpers";

// Variables
import { DATE_OPTIONS } from "@/lib/variables";

// Types
import { InvoiceType } from "@/types";

type InvoiceTemplateProps = InvoiceType & {
    translations?: Record<string, string>;
};

const addr = (...parts: (string | undefined | null)[]) =>
    parts.filter((x) => x && x.trim().length > 0).join(", ");

const formatDate = (d: Date | string | undefined) => {
    if (!d) return "";
    if (d instanceof Date) return d.toLocaleDateString(undefined, DATE_OPTIONS);
    return String(d);
};

const InvoiceTemplate = (data: InvoiceTemplateProps) => {
    const { sender, receiver, details, translations = {} } = data;
    const accent = details.accentColor || "#2563EB";

    const t = (key: string, fallback: string) => translations[key] || fallback;

    return (
        <InvoiceLayout data={data}>
            {/* ── Header ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "24px", borderBottom: `3px solid ${accent}`, marginBottom: "28px" }}>
                {/* Sender info */}
                <div>
                    {details.invoiceLogo && (
                        <img src={details.invoiceLogo} style={{ maxWidth: "130px", maxHeight: "80px", marginBottom: "10px", display: "block" }} alt="Logo" />
                    )}
                    <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#1e40af", margin: "0 0 6px" }}>{sender.name}</h1>
                    {sender.address && <p style={{ fontSize: "13px", color: "#6B7280", margin: "2px 0" }}>{sender.address}</p>}
                    {addr(sender.zipCode, sender.city) && <p style={{ fontSize: "13px", color: "#6B7280", margin: "2px 0" }}>{addr(sender.zipCode, sender.city)}</p>}
                    {sender.country && <p style={{ fontSize: "13px", color: "#6B7280", margin: "2px 0" }}>{sender.country}</p>}
                    {sender.email && <p style={{ fontSize: "13px", color: "#6B7280", margin: "6px 0 2px" }}>{sender.email}</p>}
                    {sender.phone && <p style={{ fontSize: "13px", color: "#6B7280", margin: "2px 0" }}>{sender.phone}</p>}
                </div>
                {/* Invoice metadata */}
                <div style={{ textAlign: "right" }}>
                    <h2 style={{ fontSize: "34px", fontWeight: 800, color: "#111827", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "3px" }}>
                        {t("invoiceTitle", "Facture")}
                    </h2>
                    {details.invoiceNumber && (
                        <p style={{ fontSize: "15px", color: "#6B7280", margin: "0 0 18px" }}>#{details.invoiceNumber}</p>
                    )}
                    {(formatDate(details.invoiceDate) || formatDate(details.dueDate)) && (
                        <table style={{ marginLeft: "auto", borderCollapse: "collapse", fontSize: "13px" }}>
                            <tbody>
                                {formatDate(details.invoiceDate) && (
                                    <tr>
                                        <td style={{ color: "#374151", fontWeight: 600, paddingRight: "14px", paddingBottom: "5px" }}>{t("invoiceDate", "Date")} :</td>
                                        <td style={{ color: "#6B7280", paddingBottom: "5px" }}>{formatDate(details.invoiceDate)}</td>
                                    </tr>
                                )}
                                {formatDate(details.dueDate) && (
                                    <tr>
                                        <td style={{ color: "#374151", fontWeight: 600, paddingRight: "14px" }}>{t("dueDate", "Échéance")} :</td>
                                        <td style={{ color: "#6B7280" }}>{formatDate(details.dueDate)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ── Bill To ── */}
            <div style={{ backgroundColor: "#EFF6FF", borderLeft: `4px solid ${accent}`, borderRadius: "0 8px 8px 0", padding: "16px 20px", marginBottom: "28px" }}>
                <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.2px", color: "#93C5FD", fontWeight: 700, margin: "0 0 6px" }}>
                    {t("billTo", "Facturé à")}
                </p>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1E3A5F", margin: "0 0 6px" }}>{receiver.name}</h3>
                {receiver.address && <p style={{ fontSize: "13px", color: "#374151", margin: "2px 0" }}>{receiver.address}</p>}
                {addr(receiver.zipCode, receiver.city) && <p style={{ fontSize: "13px", color: "#374151", margin: "2px 0" }}>{addr(receiver.zipCode, receiver.city)}</p>}
                {receiver.country && <p style={{ fontSize: "13px", color: "#374151", margin: "2px 0" }}>{receiver.country}</p>}
                {receiver.email && <p style={{ fontSize: "13px", color: "#374151", margin: "4px 0 2px" }}>{receiver.email}</p>}
                {receiver.phone && <p style={{ fontSize: "13px", color: "#374151", margin: "2px 0" }}>{receiver.phone}</p>}
            </div>

            {/* ── Items Table ── */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px", fontSize: "13px" }}>
                <thead>
                    <tr style={{ backgroundColor: accent }}>
                        <th style={{ textAlign: "left", padding: "11px 14px", color: "white", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.8px", borderRadius: "6px 0 0 0" }}>
                            {t("item", "Article")}
                        </th>
                        <th style={{ textAlign: "center", padding: "11px 14px", color: "white", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.8px", width: "70px" }}>
                            {t("qty", "Qté")}
                        </th>
                        <th style={{ textAlign: "right", padding: "11px 14px", color: "white", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.8px", width: "115px" }}>
                            {t("rate", "Tarif")}
                        </th>
                        <th style={{ textAlign: "right", padding: "11px 14px", color: "white", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.8px", width: "115px", borderRadius: "0 6px 0 0" }}>
                            {t("amount", "Montant")}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {details.items.map((item, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#F9FAFB" : "white", borderBottom: "1px solid #E5E7EB" }}>
                            <td style={{ padding: "12px 14px" }}>
                                <p style={{ fontWeight: 600, color: "#111827", margin: 0 }}>{item.name}</p>
                                {item.description && (
                                    <p style={{ fontSize: "11px", color: "#6B7280", margin: "3px 0 0", whiteSpace: "pre-line" }}>{item.description}</p>
                                )}
                            </td>
                            <td style={{ textAlign: "center", padding: "12px 14px", color: "#374151" }}>{item.quantity}</td>
                            <td style={{ textAlign: "right", padding: "12px 14px", color: "#374151" }}>
                                {formatNumberWithCommas(Number(item.unitPrice))} {details.currency}
                            </td>
                            <td style={{ textAlign: "right", padding: "12px 14px", fontWeight: 700, color: "#111827" }}>
                                {formatNumberWithCommas(Number(item.total))} {details.currency}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ── Totals ── */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "36px" }}>
                <div style={{ minWidth: "270px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #E5E7EB", fontSize: "13px" }}>
                        <span style={{ color: "#6B7280" }}>{t("subtotal", "Sous-total")}</span>
                        <span style={{ color: "#374151" }}>{formatNumberWithCommas(Number(details.subTotal))} {details.currency}</span>
                    </div>
                    {details.discountDetails?.amount != undefined && details.discountDetails.amount > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #E5E7EB", fontSize: "13px" }}>
                            <span style={{ color: "#6B7280" }}>{t("discount", "Remise")}</span>
                            <span style={{ color: "#DC2626" }}>
                                {details.discountDetails.amountType === "amount"
                                    ? `- ${details.discountDetails.amount} ${details.currency}`
                                    : `- ${details.discountDetails.amount}%`}
                            </span>
                        </div>
                    )}
                    {details.taxDetails?.amount != undefined && details.taxDetails.amount > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #E5E7EB", fontSize: "13px" }}>
                            <span style={{ color: "#6B7280" }}>{t("tax", "TVA")}</span>
                            <span style={{ color: "#374151" }}>
                                {details.taxDetails.amountType === "amount"
                                    ? `+ ${details.taxDetails.amount} ${details.currency}`
                                    : `+ ${details.taxDetails.amount}%`}
                            </span>
                        </div>
                    )}
                    {details.shippingDetails?.cost != undefined && details.shippingDetails.cost > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #E5E7EB", fontSize: "13px" }}>
                            <span style={{ color: "#6B7280" }}>{t("shipping", "Livraison")}</span>
                            <span style={{ color: "#374151" }}>
                                {details.shippingDetails.costType === "amount"
                                    ? `+ ${details.shippingDetails.cost} ${details.currency}`
                                    : `+ ${details.shippingDetails.cost}%`}
                            </span>
                        </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", backgroundColor: accent, borderRadius: "6px", marginTop: "10px" }}>
                        <span style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>{t("total", "Total")}</span>
                        <span style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>
                            {formatNumberWithCommas(Number(details.totalAmount))} {details.currency}
                        </span>
                    </div>
                    {details.totalAmountInWords && (
                        <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "6px", fontStyle: "italic", textAlign: "right", margin: "6px 0 0" }}>
                            {t("totalInWords", "En lettres")} : {details.totalAmountInWords}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Footer: Notes + Payment + Contact ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", paddingTop: "20px", borderTop: "2px solid #E5E7EB" }}>
                <div>
                    {details.additionalNotes && (
                        <div style={{ marginBottom: "16px" }}>
                            <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.2px", color: "#9CA3AF", fontWeight: 700, margin: "0 0 6px" }}>
                                {t("additionalNotes", "Notes")}
                            </p>
                            <p style={{ fontSize: "13px", color: "#374151", margin: 0, whiteSpace: "pre-line" }}>{details.additionalNotes}</p>
                        </div>
                    )}
                    {details.paymentTerms && (
                        <div>
                            <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.2px", color: "#9CA3AF", fontWeight: 700, margin: "0 0 6px" }}>
                                {t("paymentTerms", "Conditions de paiement")}
                            </p>
                            <p style={{ fontSize: "13px", color: "#374151", margin: 0 }}>{details.paymentTerms}</p>
                        </div>
                    )}
                </div>
                <div>
                    {(details.paymentInformation?.bankName || details.paymentInformation?.accountName || details.paymentInformation?.accountNumber) && (
                        <div style={{ marginBottom: "16px" }}>
                            <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.2px", color: "#9CA3AF", fontWeight: 700, margin: "0 0 6px" }}>
                                {t("paymentInformation", "Informations de paiement")}
                            </p>
                            {details.paymentInformation?.bankName && (
                                <p style={{ fontSize: "13px", color: "#374151", margin: "2px 0" }}>
                                    <span style={{ fontWeight: 600 }}>{t("bankName", "Banque")} : </span>{details.paymentInformation.bankName}
                                </p>
                            )}
                            {details.paymentInformation?.accountName && (
                                <p style={{ fontSize: "13px", color: "#374151", margin: "2px 0" }}>
                                    <span style={{ fontWeight: 600 }}>{t("accountName", "Compte")} : </span>{details.paymentInformation.accountName}
                                </p>
                            )}
                            {details.paymentInformation?.accountNumber && (
                                <p style={{ fontSize: "13px", color: "#374151", margin: "2px 0" }}>
                                    <span style={{ fontWeight: 600 }}>{t("accountNumber", "N°")} : </span>{details.paymentInformation.accountNumber}
                                </p>
                            )}
                        </div>
                    )}
                    {(sender.email || sender.phone) && (
                        <div>
                            <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.2px", color: "#9CA3AF", fontWeight: 700, margin: "0 0 6px" }}>
                                {t("contactInformation", "Contact")}
                            </p>
                            {sender.email && <p style={{ fontSize: "13px", color: "#374151", margin: "2px 0" }}>{sender.email}</p>}
                            {sender.phone && <p style={{ fontSize: "13px", color: "#374151", margin: "2px 0" }}>{sender.phone}</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Signature ── */}
            {details?.signature?.data && isDataUrl(details?.signature?.data) ? (
                <div style={{ marginTop: "28px", paddingTop: "16px", borderTop: "1px solid #E5E7EB" }}>
                    <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.2px", color: "#9CA3AF", fontWeight: 700, margin: "0 0 10px" }}>
                        {t("signature", "Signature")}
                    </p>
                    <img src={details.signature.data} style={{ maxWidth: "150px", maxHeight: "70px" }} alt="Signature" />
                </div>
            ) : details.signature?.data ? (
                <div style={{ marginTop: "28px", paddingTop: "16px", borderTop: "1px solid #E5E7EB" }}>
                    <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.2px", color: "#9CA3AF", fontWeight: 700, margin: "0 0 6px" }}>
                        {t("signature", "Signature")}
                    </p>
                    <p style={{ fontSize: "28px", fontWeight: 400, fontFamily: `${details.signature.fontFamily}, cursive`, color: "#111827", margin: 0 }}>
                        {details.signature.data}
                    </p>
                </div>
            ) : null}
        </InvoiceLayout>
    );
};

export default InvoiceTemplate;
