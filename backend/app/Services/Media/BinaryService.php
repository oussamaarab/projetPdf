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
     * Return true when running on Linux / Docker / Render.
     */
    private function isLinux(): bool
    {
        return PHP_OS_FAMILY !== 'Windows';
    }

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
     * Resolve a binary path, checking (in order):
     *  1. Environment variable override  (e.g. FFMPEG_BINARY)
     *  2. config('conversions.binaries.*')
     *  3. Known OS-specific candidate paths
     *  4. System PATH via `which` (Linux) or `where` (Windows)
     */
    private function resolvePath(string $binary): string
    {
        // 1. Environment variable
        $envKey = $binary === 'seven_zip' ? 'SEVEN_ZIP_BINARY' : strtoupper($binary) . '_BINARY';
        $envVal = env($envKey);
        if ($envVal && $this->isExecutable($envVal)) {
            return $envVal;
        }

        // 2. Laravel config value
        $configVal = config("conversions.binaries.{$binary}");
        if ($configVal && $configVal !== $binary && $this->isExecutable($configVal)) {
            return $configVal;
        }

        // 3. Candidate list (OS-specific absolute paths + bare names)
        foreach ($this->getBinaryCandidates($binary) as $candidate) {
            // Direct absolute path check
            if ((str_contains($candidate, '/') || str_contains($candidate, '\\')) && $this->isExecutable($candidate)) {
                return $candidate;
            }

            // Bare name → search system PATH
            $found = $this->findInSystemPath($candidate);
            if ($found && $this->isExecutable($found)) {
                return $found;
            }
        }

        $this->throwMissingBinaryException($binary);
    }

    /**
     * Return ordered list of candidate names / absolute paths for a given logical binary.
     */
    private function getBinaryCandidates(string $binary): array
    {
        if ($this->isLinux()) {
            return match ($binary) {
                'imagemagick'  => ['magick', 'convert'],
                'ffmpeg'       => ['ffmpeg'],
                'ffprobe'      => ['ffprobe'],
                'ghostscript'  => ['gs'],
                'libreoffice'  => ['soffice', 'libreoffice'],
                'seven_zip'    => ['7z', '7za', '7zr'],
                'unrar'        => ['unrar', 'unrar-free'],
                default        => [$binary],
            };
        }

        // Windows
        return match ($binary) {
            'imagemagick' => array_filter([
                'magick.exe',
                'convert.exe',
                ...(glob('C:/Program Files/ImageMagick-*/magick.exe')   ?: []),
                ...(glob('C:/Program Files/ImageMagick-*/convert.exe')  ?: []),
                ...(glob('C:/Program Files (x86)/ImageMagick-*/magick.exe')  ?: []),
                ...(glob('C:/Program Files (x86)/ImageMagick-*/convert.exe') ?: []),
            ]),

            'ffmpeg' => array_filter([
                'ffmpeg.exe',
                'C:/Program Files/FFmpeg/bin/ffmpeg.exe',
                'C:/ProgramData/chocolatey/bin/ffmpeg.exe',
                'C:/tools/ffmpeg/bin/ffmpeg.exe',
                ...(glob('C:/Users/*/AppData/Local/Microsoft/WindowsApps/ffmpeg.exe') ?: []),
            ]),

            'ffprobe' => array_filter([
                'ffprobe.exe',
                'C:/Program Files/FFmpeg/bin/ffprobe.exe',
                'C:/ProgramData/chocolatey/bin/ffprobe.exe',
                'C:/tools/ffmpeg/bin/ffprobe.exe',
                ...(glob('C:/Users/*/AppData/Local/Microsoft/WindowsApps/ffprobe.exe') ?: []),
            ]),

            'ghostscript' => array_filter([
                'gswin64c.exe',
                'gswin32c.exe',
                'gs.exe',
                ...(glob('C:/Program Files/gs/gs*/bin/gswin64c.exe')          ?: []),
                ...(glob('C:/Program Files/gs/gs*/bin/gswin32c.exe')          ?: []),
                ...(glob('C:/Program Files (x86)/gs/gs*/bin/gswin32c.exe')    ?: []),
            ]),

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
     * Search the system PATH for a bare binary name using `which` (Linux) or `where` (Windows).
     * Returns null if the name already contains a path separator (not a bare name).
     */
    private function findInSystemPath(string $name): ?string
    {
        // Skip anything that looks like a full / partial path
        if (str_contains($name, '/') || str_contains($name, '\\')) {
            return null;
        }

        $command = $this->isLinux()
            ? 'which ' . escapeshellarg($name)
            : 'where ' . escapeshellarg($name);

        exec($command . ' 2>/dev/null', $out, $code);

        if ($code === 0 && ! empty($out[0])) {
            return trim($out[0]);
        }

        return null;
    }

    /**
     * Return true when a path points to an actual executable file.
     */
    private function isExecutable(string $path): bool
    {
        if (! is_file($path)) {
            return false;
        }

        // On Linux every executable is checked via is_executable().
        // On Windows we accept .exe / .bat / .cmd, or is_executable().
        if ($this->isLinux()) {
            return is_executable($path);
        }

        return is_executable($path) || preg_match('/\.(exe|bat|cmd)$/i', $path);
    }

    /**
     * Throw a descriptive exception when a required binary cannot be found.
     */
    private function throwMissingBinaryException(string $binary): never
    {
        $info = match ($binary) {
            'imagemagick' => [
                'name'  => 'ImageMagick',
                'apt'   => 'apt-get install -y imagemagick',
                'choco' => 'choco install imagemagick',
                'url'   => 'https://imagemagick.org/script/download.php',
            ],
            'ffmpeg', 'ffprobe' => [
                'name'  => 'FFmpeg / FFprobe',
                'apt'   => 'apt-get install -y ffmpeg',
                'choco' => 'choco install ffmpeg',
                'url'   => 'https://ffmpeg.org/download.html',
            ],
            'ghostscript' => [
                'name'  => 'Ghostscript',
                'apt'   => 'apt-get install -y ghostscript',
                'choco' => 'choco install ghostscript',
                'url'   => 'https://ghostscript.com/releases/gsdnld.html',
            ],
            'libreoffice' => [
                'name'  => 'LibreOffice',
                'apt'   => 'apt-get install -y libreoffice',
                'choco' => 'choco install libreoffice',
                'url'   => 'https://www.libreoffice.org/download/',
            ],
            'seven_zip' => [
                'name'  => '7-Zip',
                'apt'   => 'apt-get install -y p7zip-full',
                'choco' => 'choco install 7zip',
                'url'   => 'https://www.7-zip.org/',
            ],
            'unrar' => [
                'name'  => 'UnRAR',
                'apt'   => 'apt-get install -y unrar',
                'choco' => 'choco install winrar',
                'url'   => 'https://www.rarlab.com/rar_add.htm',
            ],
            default => [
                'name'  => $binary,
                'apt'   => "apt-get install -y {$binary}",
                'choco' => "choco install {$binary}",
                'url'   => 'https://packages.ubuntu.com/',
            ],
        };

        if ($this->isLinux()) {
            $msg = "Required tool '{$info['name']}' not found. Install it with: {$info['apt']}";
        } else {
            $msg = "Required tool '{$info['name']}' not found.\n"
                . "Install via Chocolatey: {$info['choco']}\n"
                . "Or download from: {$info['url']}\n"
                . 'Set ' . strtoupper($binary) . "_BINARY in .env if the executable is not on PATH.";
        }

        throw new ConversionException($msg);
    }

    /**
     * Execute a command via Symfony Process, injecting resolved binary directories into PATH.
     */
    public function run(array $command, ?string $workingDirectory = null, ?int $timeout = null): string
    {
        // Collect directories of every known binary so tools can call each other
        // (e.g. ImageMagick delegates to Ghostscript internally).
        $binDirectories = [];
        foreach (['imagemagick', 'ffmpeg', 'ffprobe', 'ghostscript', 'libreoffice', 'seven_zip', 'unrar'] as $tool) {
            try {
                $binDirectories[] = dirname($this->path($tool));
            } catch (\Throwable) {
                // Tool not needed for this operation – skip silently.
            }
        }

        // Build the environment, extending the current PATH.
        $env        = array_merge($_SERVER, $_ENV, getenv() ?: []);
        $parentPath = $env['PATH'] ?? $env['Path'] ?? (string) getenv('PATH');
        $sep        = $this->isLinux() ? ':' : ';';

        if (! empty($binDirectories)) {
            $injected       = implode($sep, array_unique($binDirectories));
            $env['PATH']    = $injected . $sep . $parentPath;
            $env['Path']    = $env['PATH']; // Case-insensitive alias for Windows
        }

        $process = new Process($command, $workingDirectory, $env);
        $process->setTimeout($timeout ?? config('conversions.process_timeout'));
        $process->setIdleTimeout(null);

        Log::info('Starting conversion process.', [
            'command' => $this->redacted($command),
            'cwd'     => $workingDirectory,
            'os'      => PHP_OS_FAMILY,
        ]);

        try {
            $process->run();
        } catch (ProcessTimedOutException) {
            throw new ConversionException('The conversion process timed out.', 504, 'process_timeout');
        }

        $output = trim($process->getOutput() . PHP_EOL . $process->getErrorOutput());

        if (! $process->isSuccessful()) {
            Log::warning('Conversion process failed.', [
                'exit_code' => $process->getExitCode(),
                'output'    => $output,
            ]);

            throw new ConversionException($output ?: 'The required conversion tool failed or is not installed.');
        }

        return $output;
    }

    private function redacted(array $command): array
    {
        return array_map(static function (string $part): string {
            return str_contains(strtolower($part), 'password') ? '[redacted]' : $part;
        }, array_map('strval', $command));
    }
}
