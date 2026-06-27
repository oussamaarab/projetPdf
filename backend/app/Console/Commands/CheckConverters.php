<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\Media\BinaryService;

class CheckConverters extends Command
{
    protected $signature = 'conversion:check';
    protected $description = 'Verify that all required external conversion binaries are installed and discoverable on Windows.';

    public function handle(BinaryService $binaries): int
    {
        $tools = [
            'imagemagick' => 'ImageMagick (magick/convert)',
            'ffmpeg'      => 'FFmpeg (ffmpeg)',
            'ffprobe'     => 'FFprobe (ffprobe)',
            'ghostscript' => 'Ghostscript (gswin64c/gs)',
            'libreoffice' => 'LibreOffice (soffice)',
            'seven_zip'   => '7-Zip (7z)',
            'unrar'       => 'UnRAR (unrar)',
        ];

        $this->info("Checking conversion tool executables...\n");
        $allPassed = true;

        foreach ($tools as $key => $name) {
            try {
                $path = $binaries->path($key);
                $this->info("  [✓] {$name}: {$path}");
            } catch (\Exception $e) {
                $this->error("  [✗] {$name}: NOT FOUND");
                $this->line("      " . str_replace("\n", "\n      ", $e->getMessage()) . "\n");
                $allPassed = false;
            }
        }

        if ($allPassed) {
            $this->info("\nAll conversion binaries are properly installed and configured!");
            return 0;
        } else {
            $this->warn("\nSome tools are missing. Please follow the instructions above to install them.");
            return 1;
        }
    }
}
