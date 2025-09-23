import { j as jsxRuntimeExports, C as ComprehensiveChart } from "./index-Cs6q_xE3.js";
import "./vendor-CDnoQWfg.js";
import "./icons-t48SPkvB.js";
import "./animations-DyjgXCUB.js";
import "./charts-9rmGjnEM.js";
const BudgetAnalysisChart = ({ year, className }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ComprehensiveChart,
    {
      type: "budget",
      year,
      title: `Análisis Presupuestario Avanzado ${year}`,
      className,
      variant: "bar",
      showControls: true
    }
  );
};
export {
  BudgetAnalysisChart as default
};
