import PrintCalculator from "@/components/PrintCalculator";

export const metadata = {
  title: "Print Cost Calculator",
};

export default function CalculatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Print Cost Calculator</h1>
        <p className="text-[#898781] mt-2">
          Calculate the cost of a print based on material and labor
        </p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#404040] rounded-lg p-6">
        <PrintCalculator />
      </div>
    </div>
  );
}
