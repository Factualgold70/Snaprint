import { createClient } from "@/lib/supabase/server";
import { getFilaments } from "@/lib/data/filaments";
import PrintCalculatorWithInventory from "@/components/PrintCalculatorWithInventory";

export const metadata = {
  title: "Print Cost Calculator",
};

export default async function CalculatorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  const filaments = await getFilaments(supabase, user.id);

  if (filaments.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Print Cost Calculator</h1>
          <p className="text-[#898781] mt-2">
            Calculate the cost of a print based on material and labor
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#404040] rounded-lg p-6 text-center space-y-4">
          <p className="text-[#898781]">
            You haven't added any filaments yet. Add your filaments in{" "}
            <a href="/inventory" className="text-[#2a78d6] hover:underline">
              Filament Inventory
            </a>{" "}
            to start calculating print costs.
          </p>
          <a
            href="/inventory"
            className="inline-block px-6 py-2 bg-[#2a78d6] text-white rounded-lg hover:bg-[#1e5aa8] transition-colors"
          >
            Go to Inventory
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Print Cost Calculator</h1>
        <p className="text-[#898781] mt-2">
          Select a filament from inventory and calculate print cost with material
          and labor
        </p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#404040] rounded-lg p-6">
        <PrintCalculatorWithInventory filaments={filaments} />
      </div>
    </div>
  );
}
