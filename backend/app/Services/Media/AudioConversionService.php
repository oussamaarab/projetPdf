<?php

namespace App\Services\Media;

use App\Exceptions\ConversionException;
use App\Services\Files\FileStorageService;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class AudioConversionService
{
    public function __construct(
        private readonly BinaryService $binaries,
        private readonly FileStorageService $files
    ) {
    }

    public function process(array $tool, array $inputs, array $options, string $conversionId, string $workDir): array
    {
        if ($tool['operation'] === 'merge') {
            return $this->merge($tool, $inputs, $conversionId, $workDir);
        }

        $input = $inputs[0];
        $extension = $tool['output_extension'] ?: $input['extension'];
        $output = $this->output($tool, $input, $conversionId, $extension);
        $command = [$this->binaries->path('ffmpeg'), '-y'];

        if ($tool['operation'] === 'trim' && isset($options['start']) && (float) $options['start'] > 0) {
            array_push($command, '-ss', (string) $options['start']);
        }

        array_push($command, '-i', $input['absolute_path']);

        match ($tool['operation']) {
            'convert' => null,
            'compress' => $this->compress($command, $options),
            'trim' => $this->trim($command, $options),
            'normalize' => $this->normalize($command),
            'bitrate' => $this->bitrate($command, $options),
            'metadata' => $this->metadata($command, $options),
            default => throw new ConversionException("Unsupported audio operation [{$tool['operation']}]."),
        };

        $command[] = $output['absolute_path'];
        $this->binaries->run($command);

        return $output;
    }

    private function merge(array $tool, array $inputs, string $conversionId, string $workDir): array
    {
        $list = "{$workDir}/audio-concat.txt";
        File::put($list, collect($inputs)->map(function (array $input) {
            $path = str_replace("'", "'\\''", $input['absolute_path']);

            return "file '{$path}'";
        })->implode(PHP_EOL));

        $output = $this->output($tool, $inputs[0], $conversionId, 'mp3');

        $this->binaries->run([
            $this->binaries->path('ffmpeg'),
            '-y',
            '-f',
            'concat',
            '-safe',
            '0',
            '-i',
            $list,
            '-acodec',
            'libmp3lame',
            '-b:a',
            '192k',
            $output['absolute_path'],
        ]);

        return $output;
    }

    private function compress(array &$command, array $options): void
    {
        $bitrate = match ($options['quality'] ?? 'medium') {
            'low' => '96k',
            'high' => '256k',
            default => '160k',
        };

        array_push($command, '-b:a', $bitrate);
    }

    private function trim(array &$command, array $options): void
    {
        $start = (float) ($options['start'] ?? 0);
        $end = (float) ($options['end'] ?? 0);
        $duration = (float) ($options['duration'] ?? 0);

        if ($duration <= 0 && $end > $start) {
            $duration = $end - $start;
        }

        if ($duration > 0) {
            array_push($command, '-t', (string) $duration);
        }
    }

    private function normalize(array &$command): void
    {
        array_push($command, '-af', 'loudnorm');
    }

    private function bitrate(array &$command, array $options): void
    {
        array_push($command, '-b:a', $options['bitrate'] ?? '192k');
    }

    private function metadata(array &$command, array $options): void
    {
        foreach (($options['metadata'] ?? []) as $key => $value) {
            if (preg_match('/^[a-zA-Z0-9_.-]+$/', (string) $key)) {
                array_push($command, '-metadata', "{$key}={$value}");
            }
        }
    }

    private function output(array $tool, array $input, string $conversionId, string $extension): array
    {
        $base = Str::slug(pathinfo($input['original_name'], PATHINFO_FILENAME)) ?: 'audio';

        return $this->files->outputPath($conversionId, "{$base}-{$tool['id']}.".strtolower($extension));
    }
}
