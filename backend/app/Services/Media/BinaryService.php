<?php

namespace App\Services\Media;

use App\Exceptions\ConversionException;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;

class BinaryService
{
    private static array $resolvedCache = [];

    /**
     * Get the resolved absolute path of a binary.
     */
    public function path(string $binary): string
    {
        if (isset(self::$resolvedCache[$binary])) {
            return self::$resolvedCache[$binary];
        }

        $resolved = $this->resolvePath($binary);
        self::$resolvedCache[$binary] = $resolved;
        return $resolved;
    }

    /**
     * Resolve the path of a binary with fallbacks and standard Windows locations.
     */
    private function resolvePath(string $binary): string
    {
        // 1. Check environment variable override
        $envKey = strtoupper($binary) . '_BINARY';
        if ($binary === 'seven_zip') {
            $envKey = 'SEVEN_ZIP_BINARY';
        }
        $envVal = env($envKey);
        if ($envVal && $this->isExecutable($envVal)) {
            return $envVal;
        }

        // 2. Check path defined in config
        $configVal = config("conversions.binaries.{$binary}");
        if ($configVal && $configVal !== $binary && $this->isExecutable($configVal)) {
            return $configVal;
        }

        // 3. Search Windows PATH or common installation directories
        $candidates = $this->getBinaryCandidates($binary);
        foreach ($candidates as $candidate) {
            // Check if it is a full path and exists
            if ($this->isExecutable($candidate)) {
                return $candidate;
            }

            // Check using system PATH (where command)
            $where = $this->findInSystemPath($candidate);
            if ($where && $this->isExecutable($where)) {
                return $where;
            }
        }

        // 4. Return user-friendly error with installation instructions if not found
        $this->throwMissingBinaryException($binary);
    }

    /**
     * Find candidates for each binary, including standard Windows paths.
     */
    private function getBinaryCandidates(string $binary): array
    {
        return match ($binary) {
            'imagemagick' => [
                'magick.exe',
                'convert.exe',
                // Common installation paths
                ...glob('C:/Program Files/ImageMagick-*/magick.exe'),
                ...glob('C:/Program Files/ImageMagick-*/convert.exe'),
                ...glob('C:/Program Files (x86)/ImageMagick-*/magick.exe'),
                ...glob('C:/Program Files (x86)/ImageMagick-*/convert.exe'),
            ],
            'ffmpeg' => [
                'ffmpeg.exe',
                'C:/Program Files/FFmpeg/bin/ffmpeg.exe',
                'C:/ProgramData/chocolatey/bin/ffmpeg.exe',
                'C:/tools/ffmpeg/bin/ffmpeg.exe',
                ...glob('C:/Users/*/AppData/Local/Microsoft/WindowsApps/ffmpeg.exe'),
            ],
            'ffprobe' => [
                'ffprobe.exe',
                'C:/Program Files/FFmpeg/bin/ffprobe.exe',
                'C:/ProgramData/chocolatey/bin/ffprobe.exe',
                'C:/tools/ffmpeg/bin/ffprobe.exe',
                ...glob('C:/Users/*/AppData/Local/Microsoft/WindowsApps/ffprobe.exe'),
            ],
            'ghostscript' => [
                'gswin64c.exe',
                'gswin32c.exe',
                'gs.exe',
                ...glob('C:/Program Files/gs/gs*/bin/gswin64c.exe'),
                ...glob('C:/Program Files/gs/gs*/bin/gswin32c.exe'),
                ...glob('C:/Program Files (x86)/gs/gs*/bin/gswin32c.exe'),
            ],
            'libreoffice' => [
                'soffice.exe',
                'C:/Program Files/LibreOffice/program/soffice.exe',
                'C:/Program Files (x86)/LibreOffice/program/soffice.exe',
            ],
            'seven_zip' => [
                '7z.exe',
                'C:/Program Files/7-Zip/7z.exe',
                'C:/Program Files (x86)/7-Zip/7z.exe',
                'C:/ProgramData/chocolatey/bin/7z.exe',
                'C:/Program Files/3uTools9/files/patchtools/7z-64/7z.exe',
                'C:/Program Files/3uTools9/files/patchtools/7z-32/7z.exe',
            ],
            'unrar' => [
                'UnRAR.exe',
                'unrar.exe',
                'C:/Program Files/WinRAR/UnRAR.exe',
                'C:/Program Files (x86)/WinRAR/UnRAR.exe',
            ],
            default => [$binary],
        };
    }

    /**
     * Query system PATH for an executable.
     */
    private function findInSystemPath(string $name): ?string
    {
        if (str_contains($name, '/') || str_contains($name, '\\')) {
            return null; // Don't search system PATH for absolute paths
        }

        $out = [];
        $code = -1;
        exec("where " . escapeshellarg($name) . " 2>NUL", $out, $code);

        if ($code === 0 && !empty($out)) {
            foreach ($out as $path) {
                $path = trim($path);
                // Exclude system convert.exe (which converts FAT to NTFS)
                if (strtolower($name) === 'convert.exe' && str_contains(strtolower($path), 'windows\\system32')) {
                    continue;
                }
                if ($this->isExecutable($path)) {
                    return $path;
                }
            }
        }

        return null;
    }

    private function isExecutable(string $path): bool
    {
        return is_file($path) && (is_executable($path) || str_ends_with(strtolower($path), '.exe'));
    }

    /**
     * Throw detailed exception with installation steps for Windows.
     */
    private function throwMissingBinaryException(string $binary): void
    {
        $info = match ($binary) {
            'imagemagick' => [
                'name' => 'ImageMagick',
                'choco' => 'choco install imagemagick',
                'url' => 'https://imagemagick.org/script/download.php'
            ],
            'ffmpeg', 'ffprobe' => [
                'name' => 'FFmpeg / FFprobe',
                'choco' => 'choco install ffmpeg',
                'url' => 'https://ffmpeg.org/download.html'
            ],
            'ghostscript' => [
                'name' => 'Ghostscript',
                'choco' => 'choco install ghostscript',
                'url' => 'https://ghostscript.com/releases/gsdnld.html'
            ],
            'libreoffice' => [
                'name' => 'LibreOffice',
                'choco' => 'choco install libreoffice',
                'url' => 'https://www.libreoffice.org/download/'
            ],
            'seven_zip' => [
                'name' => '7-Zip',
                'choco' => 'choco install 7zip',
                'url' => 'https://www.7-zip.org/'
            ],
            'unrar' => [
                'name' => 'UnRAR',
                'choco' => 'choco install winrar',
                'url' => 'https://www.rarlab.com/rar_add.htm'
            ],
            default => [
                'name' => $binary,
                'choco' => "choco install $binary",
                'url' => 'https://chocolatey.org/'
            ]
        };

        $msg = "The required conversion tool '{$info['name']}' is not installed or could not be found.\n\n"
             . "To fix this on Windows, you can:\n"
             . "1. Run this command in PowerShell as Administrator:\n"
             . "   {$info['choco']}\n"
             . "2. Or manually download and install it from:\n"
             . "   {$info['url']}\n\n"
             . "After installation, ensure the executable is in your system PATH, or set the environment variable "
             . strtoupper($binary) . "_BINARY in your .env file.";

        throw new ConversionException($msg);
    }

    /**
     * Run a process with resolved PATH to handle internal tool interactions (e.g. magick -> gs).
     */
    public function run(array $command, ?string $workingDirectory = null, ?int $timeout = null): string
    {
        // 1. Resolve paths for standard binaries to inject into the PATH variable
        $binDirectories = [];
        $tools = ['imagemagick', 'ffmpeg', 'ffprobe', 'ghostscript', 'libreoffice', 'seven_zip', 'unrar'];
        foreach ($tools as $tool) {
            try {
                $path = $this->path($tool);
                $binDirectories[] = dirname($path);
            } catch (\Exception $e) {
                // Ignore missing tools if they are not needed for the current command
            }
        }

        // 2. Prepare environment variables (specifically PATH)
        $env = array_merge($_SERVER, $_ENV, getenv() ?: []);
        $parentPath = $env['PATH'] ?? $env['Path'] ?? getenv('PATH') ?: '';
        
        if (!empty($binDirectories)) {
            $uniqueDirs = array_unique($binDirectories);
            $sep = ';'; // Windows path separator
            $env['PATH'] = implode($sep, $uniqueDirs) . $sep . $parentPath;
            $env['Path'] = $env['PATH']; // Ensure case-insensitive PATH match on Windows
        }

        $process = new Process($command, $workingDirectory, $env);
        $process->setTimeout($timeout ?? config('conversions.process_timeout'));
        $process->setIdleTimeout(null);

        Log::info('Starting conversion process.', [
            'command' => $this->redacted($command),
            'cwd' => $workingDirectory,
        ]);

        try {
            $process->run();
        } catch (ProcessTimedOutException $exception) {
            throw new ConversionException('The conversion process timed out.', 504, 'process_timeout');
        }

        $output = trim($process->getOutput().PHP_EOL.$process->getErrorOutput());

        if (! $process->isSuccessful()) {
            Log::warning('Conversion process failed.', [
                'exit_code' => $process->getExitCode(),
                'output' => $output,
            ]);

            $message = $output ?: 'The required conversion tool failed or is not installed.';

            throw new ConversionException($message);
        }

        return $output;
    }

    private function redacted(array $command): array
    {
        return array_map(function ($part) {
            $part = (string) $part;

            return str_contains(strtolower($part), 'password') ? '[redacted]' : $part;
        }, $command);
    }
}
