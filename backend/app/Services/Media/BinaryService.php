<?php

namespace App\Services\Media;

use App\Exceptions\ConversionException;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;

/**
 * BinaryService
 *
 * Responsible for:
 *  - Resolving the absolute path of every external conversion binary on
 *    Windows, Linux, Docker (Render / Oracle Cloud) – without manual config.
 *  - Running external processes with a consistent, fully-logged interface.
 *  - Returning the raw stdout+stderr on failure so callers always see the
 *    REAL error, never a generic "tool failed" message.
 */
class BinaryService
{
    /** @var array<string,string> Resolved paths cached for the request lifetime. */
    private static array $resolvedCache = [];

    // ─────────────────────────────────────────────────────────────────────────
    // OS helpers
    // ─────────────────────────────────────────────────────────────────────────

    public function isLinux(): bool
    {
        return PHP_OS_FAMILY !== 'Windows';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Binary resolution
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Return the resolved absolute path for a logical binary name.
     * Results are cached in-process so the resolution logic only runs once.
     */
    public function path(string $binary): string
    {
        if (isset(self::$resolvedCache[$binary])) {
            return self::$resolvedCache[$binary];
        }

        $resolved = $this->resolvePath($binary);
        self::$resolvedCache[$binary] = $resolved;

        Log::debug("Binary resolved: [{$binary}] → {$resolved}");

        return $resolved;
    }

    /**
     * Resolution order:
     *  1. Environment variable (e.g. FFMPEG_BINARY=…)
     *  2. Laravel config value (config/conversions.php binaries.*)
     *  3. OS-specific candidate paths (absolute + bare names)
     *  4. System PATH via `which` (Linux) / `where` (Windows)
     */
    private function resolvePath(string $binary): string
    {
        // 1. Env var
        $envKey = $binary === 'seven_zip' ? 'SEVEN_ZIP_BINARY' : strtoupper($binary) . '_BINARY';
        $envVal = env($envKey);
        if ($envVal && $this->isExecutable($envVal)) {
            return $envVal;
        }

        // 2. Config
        $configVal = config("conversions.binaries.{$binary}");
        if ($configVal && $configVal !== $binary && $this->isExecutable($configVal)) {
            return $configVal;
        }

        // 3 + 4. Candidates → PATH search
        foreach ($this->getBinaryCandidates($binary) as $candidate) {
            // Absolute / relative path given directly
            if (str_contains($candidate, '/') || str_contains($candidate, '\\')) {
                if ($this->isExecutable($candidate)) {
                    return $candidate;
                }
                continue;
            }

            // Bare name: search system PATH
            $found = $this->findInSystemPath($candidate);
            if ($found && $this->isExecutable($found)) {
                return $found;
            }
        }

        $this->throwMissingBinaryException($binary);
    }

    /**
     * Ordered list of candidate names / absolute paths per logical binary.
     */
    private function getBinaryCandidates(string $binary): array
    {
        if ($this->isLinux()) {
            return match ($binary) {
                'imagemagick' => ['magick', 'convert'],
                'ffmpeg'      => ['ffmpeg'],
                'ffprobe'     => ['ffprobe'],
                'ghostscript' => ['gs'],
                'libreoffice' => ['soffice', 'libreoffice'],
                'seven_zip'   => ['7z', '7za', '7zr'],
                'unrar'       => ['unrar', 'unrar-free'],
                'python'      => ['python3', 'python'],
                default       => [$binary],
            };
        }

        // Windows
        return match ($binary) {
            'imagemagick' => array_values(array_filter([
                'magick.exe',
                'convert.exe',
                ...(glob('C:/Program Files/ImageMagick-*/magick.exe')          ?: []),
                ...(glob('C:/Program Files/ImageMagick-*/convert.exe')         ?: []),
                ...(glob('C:/Program Files (x86)/ImageMagick-*/magick.exe')    ?: []),
                ...(glob('C:/Program Files (x86)/ImageMagick-*/convert.exe')   ?: []),
            ])),

            'ffmpeg' => array_values(array_filter([
                'ffmpeg.exe',
                'C:/Program Files/FFmpeg/bin/ffmpeg.exe',
                'C:/ProgramData/chocolatey/bin/ffmpeg.exe',
                'C:/tools/ffmpeg/bin/ffmpeg.exe',
                ...(glob('C:/Users/*/AppData/Local/Microsoft/WindowsApps/ffmpeg.exe') ?: []),
            ])),

            'ffprobe' => array_values(array_filter([
                'ffprobe.exe',
                'C:/Program Files/FFmpeg/bin/ffprobe.exe',
                'C:/ProgramData/chocolatey/bin/ffprobe.exe',
                'C:/tools/ffmpeg/bin/ffprobe.exe',
                ...(glob('C:/Users/*/AppData/Local/Microsoft/WindowsApps/ffprobe.exe') ?: []),
            ])),

            'ghostscript' => array_values(array_filter([
                'gswin64c.exe',
                'gswin32c.exe',
                'gs.exe',
                ...(glob('C:/Program Files/gs/gs*/bin/gswin64c.exe')        ?: []),
                ...(glob('C:/Program Files/gs/gs*/bin/gswin32c.exe')        ?: []),
                ...(glob('C:/Program Files (x86)/gs/gs*/bin/gswin32c.exe')  ?: []),
            ])),

            'libreoffice' => array_values(array_filter([
                'soffice.exe',
                'C:/Program Files/LibreOffice/program/soffice.exe',
                'C:/Program Files (x86)/LibreOffice/program/soffice.exe',
            ])),

            'seven_zip' => [
                '7z.exe',
                'C:/Program Files/7-Zip/7z.exe',
                'C:/Program Files (x86)/7-Zip/7z.exe',
                'C:/ProgramData/chocolatey/bin/7z.exe',
            ],

            'unrar' => array_values(array_filter([
                'UnRAR.exe',
                'unrar.exe',
                'C:/Program Files/WinRAR/UnRAR.exe',
                'C:/Program Files (x86)/WinRAR/UnRAR.exe',
            ])),

            // Python resolution is handled by PdfConversionService::resolvePython()
            // but we add a basic fallback here so path('python') works generically.
            'python' => ['python.exe', 'python3.exe'],

            default => [$binary],
        };
    }

    /**
     * Search system PATH for a bare binary name.
     * Returns null when $name contains a directory separator (it's already a path).
     */
    private function findInSystemPath(string $name): ?string
    {
        if (str_contains($name, '/') || str_contains($name, '\\')) {
            return null;
        }

        $cmd  = $this->isLinux()
            ? 'which ' . escapeshellarg($name) . ' 2>/dev/null'
            : 'where ' . escapeshellarg($name) . ' 2>NUL';

        exec($cmd, $out, $code);

        return ($code === 0 && ! empty($out[0])) ? trim($out[0]) : null;
    }

    /**
     * True when $path points to an existing, executable file.
     */
    private function isExecutable(string $path): bool
    {
        if (! is_file($path)) {
            return false;
        }

        if ($this->isLinux()) {
            return is_executable($path);
        }

        // Windows: is_executable() is unreliable; accept any .exe/.bat/.cmd
        return is_executable($path) || (bool) preg_match('/\.(exe|bat|cmd)$/i', $path);
    }

    /**
     * Throw a descriptive, actionable exception when a binary is not found.
     */
    private function throwMissingBinaryException(string $binary): never
    {
        $info = match ($binary) {
            'imagemagick'        => ['name' => 'ImageMagick',       'apt' => 'apt-get install -y imagemagick',  'choco' => 'choco install imagemagick', 'url' => 'https://imagemagick.org/script/download.php'],
            'ffmpeg', 'ffprobe'  => ['name' => 'FFmpeg/FFprobe',    'apt' => 'apt-get install -y ffmpeg',       'choco' => 'choco install ffmpeg',       'url' => 'https://ffmpeg.org/download.html'],
            'ghostscript'        => ['name' => 'Ghostscript',       'apt' => 'apt-get install -y ghostscript',  'choco' => 'choco install ghostscript',  'url' => 'https://ghostscript.com/releases/gsdnld.html'],
            'libreoffice'        => ['name' => 'LibreOffice',       'apt' => 'apt-get install -y libreoffice',  'choco' => 'choco install libreoffice',  'url' => 'https://www.libreoffice.org/download/'],
            'seven_zip'          => ['name' => '7-Zip',             'apt' => 'apt-get install -y p7zip-full',   'choco' => 'choco install 7zip',         'url' => 'https://www.7-zip.org/'],
            'unrar'              => ['name' => 'UnRAR',             'apt' => 'apt-get install -y unrar',        'choco' => 'choco install winrar',       'url' => 'https://www.rarlab.com/rar_add.htm'],
            'python'             => ['name' => 'Python 3',          'apt' => 'apt-get install -y python3',      'choco' => 'choco install python',       'url' => 'https://www.python.org/downloads/'],
            default              => ['name' => $binary,             'apt' => "apt-get install -y {$binary}",   'choco' => "choco install {$binary}",    'url' => 'https://packages.ubuntu.com/'],
        };

        $envVar = strtoupper($binary === 'seven_zip' ? 'seven_zip' : $binary) . '_BINARY';

        if ($this->isLinux()) {
            $msg = "Required binary '{$info['name']}' not found on this system.\n"
                . "Install with: {$info['apt']}\n"
                . "Or set {$envVar}=/full/path in .env";
        } else {
            $msg = "Required binary '{$info['name']}' not found.\n"
                . "  • Chocolatey:  {$info['choco']}\n"
                . "  • Manual:      {$info['url']}\n"
                . "  • Or set {$envVar}=C:\\path\\to\\executable in .env";
        }

        throw new ConversionException($msg);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Process execution
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Run an external command.
     *
     * - Injects all known binary directories into PATH so tools can delegate
     *   to each other (e.g. ImageMagick calls Ghostscript internally).
     * - Logs the full stdout + stderr at DEBUG level on success.
     * - Logs the full stdout + stderr at WARNING level on failure.
     * - ALWAYS throws a ConversionException whose message IS the real
     *   tool output, never a generic fallback.
     *
     * @param  list<string>   $command
     * @param  string|null    $workingDirectory
     * @param  int|null       $timeout          Seconds; null = config default
     * @throws ConversionException
     */
    public function run(array $command, ?string $workingDirectory = null, ?int $timeout = null): string
    {
        // Inject directories of all known binaries into PATH
        $binDirs = [];
        foreach (['imagemagick', 'ffmpeg', 'ffprobe', 'ghostscript', 'libreoffice', 'seven_zip', 'unrar'] as $tool) {
            try {
                $binDirs[] = dirname($this->path($tool));
            } catch (\Throwable) {
                // Tool not available – not needed for this particular command.
            }
        }

        $env        = array_merge($_SERVER, $_ENV, getenv() ?: []);
        $parentPath = $env['PATH'] ?? $env['Path'] ?? (string) getenv('PATH');
        $sep        = $this->isLinux() ? ':' : ';';

        if (! empty($binDirs)) {
            $injected    = implode($sep, array_unique($binDirs));
            $env['PATH'] = $injected . $sep . $parentPath;
            $env['Path'] = $env['PATH'];
        }

        // LibreOffice needs HOME on Linux (no-config headless mode)
        if ($this->isLinux() && empty($env['HOME'])) {
            $env['HOME'] = sys_get_temp_dir();
        }

        $process = new Process($command, $workingDirectory, $env);
        $process->setTimeout($timeout ?? config('conversions.process_timeout', 900));
        $process->setIdleTimeout(null);

        $redacted = $this->redacted($command);
        Log::info('[BinaryService] Running command.', [
            'command' => $redacted,
            'cwd'     => $workingDirectory ?? getcwd(),
            'os'      => PHP_OS_FAMILY,
        ]);

        try {
            $process->run();
        } catch (ProcessTimedOutException) {
            Log::error('[BinaryService] Process timed out.', ['command' => $redacted]);
            throw new ConversionException(
                'The conversion process timed out after ' . ($timeout ?? config('conversions.process_timeout', 900)) . ' seconds.',
                504,
                'process_timeout'
            );
        }

        $stdout   = trim($process->getOutput());
        $stderr   = trim($process->getErrorOutput());
        $exitCode = $process->getExitCode();

        // Always capture full output for diagnostics
        $fullOutput = implode(PHP_EOL, array_filter([$stdout, $stderr]));

        if ($process->isSuccessful()) {
            Log::debug('[BinaryService] Command succeeded.', [
                'exit_code' => $exitCode,
                'stdout'    => $stdout,
                'stderr'    => $stderr,
            ]);

            return $fullOutput;
        }

        // ── FAILURE ──────────────────────────────────────────────────────────
        Log::warning('[BinaryService] Command failed.', [
            'command'   => $redacted,
            'exit_code' => $exitCode,
            'stdout'    => $stdout,
            'stderr'    => $stderr,
        ]);

        // Build a helpful message that includes the real tool output.
        $detail = $fullOutput ?: "(no output from process)";

        throw new ConversionException(
            "Conversion command exited with code {$exitCode}.\n"
            . "Command: " . implode(' ', $redacted) . "\n"
            . "Output:\n{$detail}"
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function redacted(array $command): array
    {
        return array_map(static function (string $part): string {
            return str_contains(strtolower($part), 'password') ? '[redacted]' : $part;
        }, array_map('strval', $command));
    }
}
