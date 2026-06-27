import { getToolsByCategory } from "../services/toolService";
import ToolCategoryPage from "../components/ToolCategoryPage/ToolCategoryPage";

const tools = getToolsByCategory("pdf").map(t => ({ ...t, category: "PDF Tools" }));

export default function PdfTools() {
  return (
    <ToolCategoryPage
      tools={tools}
      title="PDF Tools"
      subtitle="Convert, merge, split, compress, protect, and edit PDF documents with professional-grade precision. 19 powerful tools, all free."
      badgeText="PDF Utilities"
      heroGradient="from-rose-600 to-red-700"
      icon="📄"
    />
  );
}