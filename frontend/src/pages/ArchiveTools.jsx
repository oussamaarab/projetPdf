import { getToolsByCategory } from "../services/toolService";
import ToolCategoryPage from "../components/ToolCategoryPage/ToolCategoryPage";

const tools = getToolsByCategory("archive").map(t => ({ ...t, category: "Archive Tools" }));

export default function ArchiveTools() {
  return (
    <ToolCategoryPage
      tools={tools}
      title="Archive Tools"
      subtitle="Create, extract, and convert archive files. Full support for ZIP, RAR, 7Z, TAR and all major compression formats."
      badgeText="Archive Utilities"
      heroGradient="from-emerald-600 to-teal-700"
      icon="📦"
    />
  );
}
