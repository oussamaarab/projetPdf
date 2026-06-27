<?php

namespace App\Services\Conversions;

use App\Exceptions\ToolNotFoundException;

class ToolCatalog
{
    public function all(): array
    {
        return collect($this->definitions())
            ->map(fn (array $tool, string $id) => ['id' => $id] + $tool)
            ->values()
            ->all();
    }

    public function ids(): array
    {
        return array_keys($this->definitions());
    }

    public function find(string $id): ?array
    {
        $tool = $this->definitions()[$id] ?? null;

        return $tool ? ['id' => $id] + $tool : null;
    }

    public function findOrFail(string $id): array
    {
        return $this->find($id) ?? throw new ToolNotFoundException($id);
    }

    public function byCategory(string $category): array
    {
        return array_values(array_filter(
            $this->all(),
            fn (array $tool) => $tool['category'] === $category
        ));
    }

    private function definitions(): array
    {
        return [
            'merge-pdf' => $this->tool('Merge PDF', 'pdf', 'merge', ['pdf'], 'pdf', true),
            'split-pdf' => $this->tool('Split PDF', 'pdf', 'split', ['pdf'], 'zip'),
            'compress-pdf' => $this->tool('Compress PDF', 'pdf', 'compress', ['pdf'], 'pdf'),
            'rotate-pdf' => $this->tool('Rotate PDF', 'pdf', 'rotate', ['pdf'], 'pdf'),
            'unlock-pdf' => $this->tool('Unlock PDF', 'pdf', 'unlock', ['pdf'], 'pdf'),
            'protect-pdf' => $this->tool('Protect PDF', 'pdf', 'protect', ['pdf'], 'pdf'),
            'watermark-pdf' => $this->tool('Watermark PDF', 'pdf', 'watermark', ['pdf'], 'pdf'),
            'remove-pages' => $this->tool('Remove PDF Pages', 'pdf', 'remove-pages', ['pdf'], 'pdf'),
            'extract-pages' => $this->tool('Extract PDF Pages', 'pdf', 'extract-pages', ['pdf'], 'pdf'),
            'reorder-pages' => $this->tool('Reorder PDF Pages', 'pdf', 'reorder-pages', ['pdf'], 'pdf'),
            'pdf-to-word' => $this->tool('PDF to Word', 'pdf', 'office-convert', ['pdf'], 'docx'),
            'pdf-to-powerpoint' => $this->tool('PDF to PowerPoint', 'pdf', 'office-convert', ['pdf'], 'pptx'),
            'pdf-to-ppt' => $this->tool('PDF to PowerPoint', 'pdf', 'office-convert', ['pdf'], 'pptx'),
            'pdf-to-jpg' => $this->tool('PDF to JPG', 'pdf', 'pdf-to-images', ['pdf'], 'zip'),
            'word-to-pdf' => $this->tool('Word to PDF', 'pdf', 'office-to-pdf', ['doc', 'docx', 'odt', 'rtf'], 'pdf'),
            'excel-to-pdf' => $this->tool('Excel to PDF', 'pdf', 'office-to-pdf', ['xls', 'xlsx', 'ods', 'csv'], 'pdf'),
            'powerpoint-to-pdf' => $this->tool('PowerPoint to PDF', 'pdf', 'office-to-pdf', ['ppt', 'pptx', 'odp'], 'pdf'),
            'ppt-to-pdf' => $this->tool('PowerPoint to PDF', 'pdf', 'office-to-pdf', ['ppt', 'pptx', 'odp'], 'pdf'),
            'jpg-to-pdf' => $this->tool('JPG to PDF', 'pdf', 'images-to-pdf', ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'], 'pdf', true),
            'image-to-pdf' => $this->tool('Image to PDF', 'pdf', 'images-to-pdf', ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'], 'pdf', true),
            'pdf-to-html' => $this->tool('PDF to HTML', 'pdf', 'office-convert', ['pdf'], 'html'),
            'html-to-pdf' => $this->tool('HTML to PDF', 'pdf', 'office-to-pdf', ['html', 'htm'], 'pdf'),
            'sign-pdf' => $this->tool('Sign PDF', 'pdf', 'watermark', ['pdf'], 'pdf'),
            'ocr-pdf' => $this->tool('OCR PDF', 'pdf', 'passthrough', ['pdf'], 'pdf'),

            'jpg-to-png' => $this->image('JPG to PNG', 'convert', ['jpg', 'jpeg'], 'png'),
            'png-to-jpg' => $this->image('PNG to JPG', 'convert', ['png'], 'jpg'),
            'jpg-to-webp' => $this->image('JPG to WebP', 'convert', ['jpg', 'jpeg'], 'webp'),
            'webp-to-jpg' => $this->image('WebP to JPG', 'convert', ['webp'], 'jpg'),
            'png-to-webp' => $this->image('PNG to WebP', 'convert', ['png'], 'webp'),
            'webp-to-png' => $this->image('WebP to PNG', 'convert', ['webp'], 'png'),
            'jpg-to-svg' => $this->image('JPG to SVG', 'convert', ['jpg', 'jpeg'], 'svg'),
            'svg-to-jpg' => $this->image('SVG to JPG', 'convert', ['svg'], 'jpg'),
            'png-to-svg' => $this->image('PNG to SVG', 'convert', ['png'], 'svg'),
            'svg-to-png' => $this->image('SVG to PNG', 'convert', ['svg'], 'png'),
            'resize-image' => $this->image('Resize Image', 'resize', ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'], null),
            'compress-image' => $this->image('Compress Image', 'compress', ['jpg', 'jpeg', 'png', 'webp'], null),
            'crop-image' => $this->image('Crop Image', 'crop', ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'], null),
            'rotate-image' => $this->image('Rotate Image', 'rotate', ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'], null),
            'flip-image' => $this->image('Flip Image', 'flip', ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'], null),
            'watermark-image' => $this->image('Watermark Image', 'watermark', ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'], null),
            'remove-background' => $this->image('Remove Background', 'remove-background', ['jpg', 'jpeg', 'png', 'webp'], 'png'),
            'image-to-ico' => $this->image('Image to ICO', 'convert', ['jpg', 'jpeg', 'png'], 'ico'),
            'ico-to-png' => $this->image('ICO to PNG', 'convert', ['ico'], 'png'),
            'bmp-to-png' => $this->image('BMP to PNG', 'convert', ['bmp'], 'png'),
            'png-to-bmp' => $this->image('PNG to BMP', 'convert', ['png'], 'bmp'),
            'tiff-to-jpg' => $this->image('TIFF to JPG', 'convert', ['tif', 'tiff'], 'jpg'),
            'jpg-to-tiff' => $this->image('JPG to TIFF', 'convert', ['jpg', 'jpeg'], 'tiff'),
            'optimize-image' => $this->image('Optimize Images', 'optimize', ['jpg', 'jpeg', 'png', 'webp'], null),
            'heic-to-jpg' => $this->image('HEIC to JPG', 'convert', ['heic', 'heif'], 'jpg'),

            'mp4-to-avi' => $this->video('MP4 to AVI', 'convert', ['mp4'], 'avi'),
            'avi-to-mp4' => $this->video('AVI to MP4', 'convert', ['avi'], 'mp4'),
            'mp4-to-mov' => $this->video('MP4 to MOV', 'convert', ['mp4'], 'mov'),
            'mov-to-mp4' => $this->video('MOV to MP4', 'convert', ['mov'], 'mp4'),
            'mp4-to-mkv' => $this->video('MP4 to MKV', 'convert', ['mp4'], 'mkv'),
            'mkv-to-mp4' => $this->video('MKV to MP4', 'convert', ['mkv'], 'mp4'),
            'mp4-to-webm' => $this->video('MP4 to WebM', 'convert', ['mp4'], 'webm'),
            'webm-to-mp4' => $this->video('WebM to MP4', 'convert', ['webm'], 'mp4'),
            'compress-video' => $this->video('Compress Video', 'compress', ['mp4', 'mov', 'avi', 'mkv', 'webm'], 'mp4'),
            'trim-video' => $this->video('Trim Video', 'trim', ['mp4', 'mov', 'avi', 'mkv', 'webm'], null),
            'rotate-video' => $this->video('Rotate Video', 'rotate', ['mp4', 'mov', 'avi', 'mkv', 'webm'], null),
            'extract-frames' => $this->video('Extract Frames', 'frames', ['mp4', 'mov', 'avi', 'mkv', 'webm'], 'zip'),
            'change-resolution' => $this->video('Change Resolution', 'resolution', ['mp4', 'mov', 'avi', 'mkv', 'webm'], 'mp4'),
            'change-fps' => $this->video('Change FPS', 'fps', ['mp4', 'mov', 'avi', 'mkv', 'webm'], 'mp4'),
            'merge-videos' => $this->video('Merge Videos', 'merge', ['mp4', 'mov', 'avi', 'mkv', 'webm'], 'mp4', true),
            'extract-audio' => $this->video('Extract Audio', 'audio', ['mp4', 'mov', 'avi', 'mkv', 'webm'], 'mp3'),
            'video-to-mp3' => $this->video('Video to MP3', 'audio', ['mp4', 'mov', 'avi', 'mkv', 'webm'], 'mp3'),
            'video-to-gif' => $this->video('Video to GIF', 'gif', ['mp4', 'mov', 'avi', 'mkv', 'webm'], 'gif'),
            'gif-to-video' => $this->video('GIF to Video', 'convert', ['gif'], 'mp4'),

            'mp3-to-wav' => $this->audio('MP3 to WAV', 'convert', ['mp3'], 'wav'),
            'wav-to-mp3' => $this->audio('WAV to MP3', 'convert', ['wav'], 'mp3'),
            'mp3-to-aac' => $this->audio('MP3 to AAC', 'convert', ['mp3'], 'aac'),
            'aac-to-mp3' => $this->audio('AAC to MP3', 'convert', ['aac'], 'mp3'),
            'mp3-to-flac' => $this->audio('MP3 to FLAC', 'convert', ['mp3'], 'flac'),
            'flac-to-mp3' => $this->audio('FLAC to MP3', 'convert', ['flac'], 'mp3'),
            'mp3-to-ogg' => $this->audio('MP3 to OGG', 'convert', ['mp3'], 'ogg'),
            'ogg-to-mp3' => $this->audio('OGG to MP3', 'convert', ['ogg'], 'mp3'),
            'm4a-to-mp3' => $this->audio('M4A to MP3', 'convert', ['m4a'], 'mp3'),
            'compress-audio' => $this->audio('Compress Audio', 'compress', ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'], 'mp3'),
            'merge-audio' => $this->audio('Merge Audio', 'merge', ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'], 'mp3', true),
            'trim-audio' => $this->audio('Trim Audio', 'trim', ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'], null),
            'normalize-audio' => $this->audio('Normalize Audio', 'normalize', ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'], 'mp3'),
            'change-bitrate' => $this->audio('Change Bitrate', 'bitrate', ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'], 'mp3'),
            'audio-metadata' => $this->audio('Audio Metadata', 'metadata', ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'], 'mp3'),

            'zip-files' => $this->archive('Create ZIP', 'create', ['*'], 'zip', true),
            'create-zip' => $this->archive('Create ZIP', 'create', ['*'], 'zip', true),
            'unzip-files' => $this->archive('Extract ZIP', 'extract', ['zip'], 'zip'),
            'extract-zip' => $this->archive('Extract ZIP', 'extract', ['zip'], 'zip'),
            'rar-to-zip' => $this->archive('RAR to ZIP', 'convert', ['rar'], 'zip'),
            '7z-to-zip' => $this->archive('7Z to ZIP', 'convert', ['7z'], 'zip'),
            'tar-to-zip' => $this->archive('TAR to ZIP', 'convert', ['tar'], 'zip'),
            'tar-gz-to-zip' => $this->archive('TAR.GZ to ZIP', 'convert', ['gz', 'tgz'], 'zip'),
            'zip-to-7z' => $this->archive('ZIP to 7Z', 'convert', ['zip'], '7z'),
            'zip-to-tar' => $this->archive('ZIP to TAR', 'convert', ['zip'], 'tar'),
            'extract-archive' => $this->archive('Extract Archive', 'extract', ['zip', 'rar', '7z', 'tar', 'gz', 'tgz'], 'zip'),
            'compress-archive' => $this->archive('Compress Archive', 'create', ['*'], 'zip', true),
            'password-protected-archive' => $this->archive('Password Protected Archive', 'create', ['*'], 'zip', true),
        ];
    }

    private function image(string $name, string $operation, array $input, ?string $output): array
    {
        return $this->tool($name, 'image', $operation, $input, $output);
    }

    private function video(string $name, string $operation, array $input, ?string $output, bool $multiple = false): array
    {
        return $this->tool($name, 'video', $operation, $input, $output, $multiple);
    }

    private function audio(string $name, string $operation, array $input, ?string $output, bool $multiple = false): array
    {
        return $this->tool($name, 'audio', $operation, $input, $output, $multiple);
    }

    private function archive(string $name, string $operation, array $input, string $output, bool $multiple = false): array
    {
        return $this->tool($name, 'archive', $operation, $input, $output, $multiple);
    }

    private function tool(
        string $name,
        string $category,
        string $operation,
        array $inputExtensions,
        ?string $outputExtension,
        bool $multiple = false
    ): array {
        return [
            'name' => $name,
            'category' => $category,
            'operation' => $operation,
            'input_extensions' => array_map(fn ($extension) => strtolower($extension), $inputExtensions),
            'output_extension' => $outputExtension,
            'accepts_multiple' => $multiple,
            'queued' => true,
        ];
    }
}
