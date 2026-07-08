import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { getInvoice } from "@/lib/data/invoices";
import { InvoicePdf } from "@/lib/invoice-pdf";

export async function GET(_req: Request, ctx: RouteContext<"/invoices/[id]/pdf">) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const invoice = await getInvoice(supabase, user.id, id);
  if (!invoice) return new Response("Not found", { status: 404 });

  const buffer = await renderToBuffer(<InvoicePdf invoice={invoice} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`,
    },
  });
}
