import { getToolsByCategory } from "../services/toolService";
import ToolCategoryPage from "../components/ToolCategoryPage/ToolCategoryPage";

const tools = getToolsByCategory("audio").map(t => ({ ...t, category: "Audio Tools" }));

export default function AudioTools() {
  return (
    <ToolCategoryPage
      tools={tools}
      title="Audio Tools"
      subtitle="Convert audio between formats, compress audio files, trim recordings, and more. Supports MP3, WAV, AAC, FLAC, OGG, M4A, and beyond."
      badgeText="Audio Utilities"
      heroGradient="from-amber-500 to-orange-600"
      icon="🎵"
    />
  );
}
