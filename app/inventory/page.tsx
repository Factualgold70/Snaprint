import { createClient } from "@/lib/supabase/server";
import { getFilaments } from "@/lib/data/filaments";
import InventoryClient from "@/components/InventoryClient";

export const metadata = {
  title: "Filament Inventory",
};

export default async function InventoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  const filaments = await getFilaments(supabase, user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Filament Inventory</h1>
        <p className="text-[#898781] mt-2">
          Add and track your filaments with cost per gram and usage
        </p>
      </div>

      <InventoryClient initialFilaments={filaments} />
    </div>
  );
}
