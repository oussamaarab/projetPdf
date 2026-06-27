import { getToolsByCategory } from "../services/toolService";
import ToolCategoryPage from "../components/ToolCategoryPage/ToolCategoryPage";

const tools = getToolsByCategory("video").map(t => ({ ...t, category: "Video Tools" }));

export default function VideoTools() {
  return (
    <ToolCategoryPage
      tools={tools}
      title="Video Tools"
      subtitle="Convert, compress, trim, and transform video files. Extract audio, create animated GIFs, and support for MP4, AVI, MOV, MKV, and more."
      badgeText="Video Utilities"
      heroGradient="from-cyan-600 to-blue-700"
      icon="🎬"
    />
  );
}
