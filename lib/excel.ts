import ExcelJS from "exceljs";
import type { Transaction, Invoice } from "@/lib/supabase/types";
import { invoiceTotals } from "@/lib/data/invoices";

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF2A78D6" },
};

function styleHeader(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = HEADER_FILL;
  });
}

export async function buildMonthlyWorkbook(
  month: string,
  transactions: Transaction[],
  invoices: Invoice[]
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SnapPrint";
  workbook.created = new Date();

  const income = transactions.filter((t) => t.type === "income");
  const expenses = transactions.filter((t) => t.type === "expense");
  const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0);

  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [{ width: 24 }, { width: 18 }];
  summarySheet.addRow(["SnapPrint monthly report", month]).font = { bold: true, size: 14 };
  summarySheet.addRow([]);
  const summaryHeader = summarySheet.addRow(["Metric", "Amount"]);
  styleHeader(summaryHeader);
  summarySheet.addRow(["Total income", totalIncome]);
  summarySheet.addRow(["Total expenses", totalExpense]);
  summarySheet.addRow(["Net", totalIncome - totalExpense]);
  summarySheet.addRow(["Invoices issued", invoices.length]);
  summarySheet.addRow([
    "Invoices paid",
    invoices.filter((i) => i.status === "paid").length,
  ]);
  summarySheet.getColumn(2).numFmt = "$#,##0.00";

  const incomeSheet = workbook.addWorksheet("Income");
  incomeSheet.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Category", key: "category", width: 20 },
    { header: "Description", key: "description", width: 32 },
    { header: "Source", key: "source", width: 12 },
    { header: "Amount", key: "amount", width: 14 },
  ];
  styleHeader(incomeSheet.getRow(1));
  for (const t of income) {
    incomeSheet.addRow({
      date: t.occurred_on,
      category: t.category,
      description: t.description,
      source: t.source,
      amount: Number(t.amount),
    });
  }
  incomeSheet.getColumn("amount").numFmt = "$#,##0.00";

  const expenseSheet = workbook.addWorksheet("Expenses");
  expenseSheet.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Category", key: "category", width: 20 },
    { header: "Description", key: "description", width: 32 },
    { header: "Amount", key: "amount", width: 14 },
  ];
  styleHeader(expenseSheet.getRow(1));
  for (const t of expenses) {
    expenseSheet.addRow({
      date: t.occurred_on,
      category: t.category,
      description: t.description,
      amount: Number(t.amount),
    });
  }
  expenseSheet.getColumn("amount").numFmt = "$#,##0.00";

  const invoiceSheet = workbook.addWorksheet("Invoices");
  invoiceSheet.columns = [
    { header: "Number", key: "number", width: 14 },
    { header: "Client", key: "client", width: 24 },
    { header: "Issued", key: "issued", width: 14 },
    { header: "Status", key: "status", width: 12 },
    { header: "Total", key: "total", width: 14 },
  ];
  styleHeader(invoiceSheet.getRow(1));
  for (const inv of invoices) {
    const { total } = invoiceTotals(inv);
    invoiceSheet.addRow({
      number: inv.invoice_number,
      client: inv.client_name,
      issued: inv.issue_date,
      status: inv.status,
      total,
    });
  }
  invoiceSheet.getColumn("total").numFmt = "$#,##0.00";

  return workbook;
}
