import { getToolsByCategory } from "../services/toolService";
import ToolCategoryPage from "../components/ToolCategoryPage/ToolCategoryPage";

const tools = getToolsByCategory("image").map(t => ({ ...t, category: "Image Tools" }));

export default function ImageTools() {
  return (
    <ToolCategoryPage
      tools={tools}
      title="Image Tools"
      subtitle="Convert, resize, compress, crop, and optimize images in any format. Supports JPG, PNG, WebP, HEIC, SVG, and 20+ more formats."
      badgeText="Image Utilities"
      heroGradient="from-purple-600 to-violet-700"
      icon="🖼️"
    />
  );
}
