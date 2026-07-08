import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Invoice } from "@/lib/supabase/types";
import { invoiceTotals } from "@/lib/data/invoices";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#0b0b0b" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  brand: { fontSize: 20, fontWeight: 700, color: "#2a78d6" },
  muted: { color: "#52514e", fontSize: 10 },
  section: { marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid #c3c2b7",
    paddingBottom: 4,
    marginBottom: 4,
    fontWeight: 700,
  },
  tableRow: { flexDirection: "row", paddingVertical: 3, borderBottom: "1px solid #e1e0d9" },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  totals: { marginTop: 12, alignSelf: "flex-end", width: 200 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  grandTotal: { fontWeight: 700, fontSize: 13, borderTop: "1px solid #0b0b0b", paddingTop: 4, marginTop: 4 },
  status: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
  },
});

const STATUS_COLORS: Record<string, string> = {
  draft: "#898781",
  sent: "#eda100",
  paid: "#0ca30c",
};

export function InvoicePdf({ invoice }: { invoice: Invoice }) {
  const items = invoice.invoice_items ?? [];
  const { subtotal, tax, total } = invoiceTotals(invoice);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>SnapPrint</Text>
            <Text style={styles.muted}>3D Printing Studio</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 16, fontWeight: 700 }}>Invoice {invoice.invoice_number}</Text>
            <Text
              style={[styles.status, { backgroundColor: `${STATUS_COLORS[invoice.status]}22`, color: STATUS_COLORS[invoice.status] }]}
            >
              {invoice.status}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.muted}>Bill to</Text>
            <Text style={styles.muted}>Issued {invoice.issue_date}</Text>
          </View>
          <Text style={{ fontWeight: 700 }}>{invoice.client_name}</Text>
          {invoice.client_email ? <Text style={styles.muted}>{invoice.client_email}</Text> : null}
          {invoice.due_date ? <Text style={styles.muted}>Due {invoice.due_date}</Text> : null}
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.colQty}>Qty</Text>
          <Text style={styles.colPrice}>Unit price</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>
        {items.map((it) => (
          <View style={styles.tableRow} key={it.id}>
            <Text style={styles.colDesc}>{it.description}</Text>
            <Text style={styles.colQty}>{Number(it.quantity)}</Text>
            <Text style={styles.colPrice}>${Number(it.unit_price).toFixed(2)}</Text>
            <Text style={styles.colTotal}>${(Number(it.quantity) * Number(it.unit_price)).toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax ({Number(invoice.tax_rate)}%)</Text>
            <Text>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Total</Text>
            <Text>${total.toFixed(2)}</Text>
          </View>
        </View>

        {invoice.notes ? (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.muted}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
