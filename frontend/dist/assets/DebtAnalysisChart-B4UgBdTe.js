import { j as jsxRuntimeExports, U as UnifiedChart } from "./index-Cs6q_xE3.js";
import "./vendor-CDnoQWfg.js";
import "./icons-t48SPkvB.js";
import "./animations-DyjgXCUB.js";
import "./charts-9rmGjnEM.js";
const DebtAnalysisChart = ({ year, className }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    UnifiedChart,
    {
      type: "debt",
      year,
      title: `Análisis de Deuda ${year}`,
      className,
      variant: "pie",
      showControls: true
    }
  );
};
export {
  DebtAnalysisChart as default
};
