<?php

namespace App\Services\Media;

use App\Exceptions\ConversionException;
use App\Services\Files\FileStorageService;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class VideoConversionService
{
    public function __construct(
        private readonly BinaryService $binaries,
        private readonly FileStorageService $files
    ) {
    }

    public function process(array $tool, array $inputs, array $options, string $conversionId, string $workDir): array
    {
        if ($tool['operation'] === 'frames') {
            return $this->frames($tool, $inputs[0], $options, $conversionId, $workDir);
        }

        if ($tool['operation'] === 'merge') {
            return $this->merge($tool, $inputs, $conversionId, $workDir);
        }

        $input = $inputs[0];
        $extension = $tool['output_extension'] ?: $input['extension'];
        $output = $this->output($tool, $input, $conversionId, $extension);
        $command = [$this->binaries->path('ffmpeg'), '-y'];

        $this->applyInputTiming($command, $tool, $options);
        array_push($command, '-i', $input['absolute_path']);

        match ($tool['operation']) {
            'convert' => $this->convert($command, $extension),
            'compress' => $this->compress($command, $options),
            'trim' => $this->trim($command, $options),
            'rotate' => $this->rotate($command, $options),
            'resolution' => $this->resolution($command, $options),
            'fps' => $this->fps($command, $options),
            'audio' => $this->audio($command),
            'gif' => $this->gif($command),
            default => throw new ConversionException("Unsupported video operation [{$tool['operation']}]."),
        };

        $command[] = $output['absolute_path'];
        $this->binaries->run($command);

        return $output;
    }

    private function frames(array $tool, array $input, array $options, string $conversionId, string $workDir): array
    {
        $framesDir = "{$workDir}/frames";
        File::ensureDirectoryExists($framesDir, 0750, true);

        $this->binaries->run([
            $this->binaries->path('ffmpeg'),
            '-y',
            '-i',
            $input['absolute_path'],
            '-vf',
            'fps='.((int) ($options['fps'] ?? 1)),
            $framesDir.'/frame-%05d.jpg',
        ]);

        $output = $this->output($tool, $input, $conversionId, 'zip');
        $this->files->zipDirectory($framesDir, $output['absolute_path']);

        return $output;
    }

    private function merge(array $tool, array $inputs, string $conversionId, string $workDir): array
    {
        $list = "{$workDir}/concat.txt";
        File::put($list, collect($inputs)->map(function (array $input) {
            $path = str_replace("'", "'\\''", $input['absolute_path']);

            return "file '{$path}'";
        })->implode(PHP_EOL));

        $output = $this->output($tool, $inputs[0], $conversionId, 'mp4');

        $this->binaries->run([
            $this->binaries->path('ffmpeg'),
            '-y',
            '-f',
            'concat',
            '-safe',
            '0',
            '-i',
            $list,
            '-c:v',
            'libx264',
            '-c:a',
            'aac',
            $output['absolute_path'],
        ]);

        return $output;
    }

    private function applyInputTiming(array &$command, array $tool, array $options): void
    {
        if (! in_array($tool['operation'], ['trim', 'gif'], true)) {
            return;
        }

        if (isset($options['start']) && (float) $options['start'] > 0) {
            array_push($command, '-ss', (string) $options['start']);
        }
    }

    private function convert(array &$command, string $extension): void
    {
        if ($extension === 'webm') {
            array_push($command, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '32', '-c:a', 'libopus');

            return;
        }

        if ($extension === 'mp4') {
            array_push($command, '-c:v', 'libx264', '-preset', 'medium', '-c:a', 'aac');
        }
    }

    private function compress(array &$command, array $options): void
    {
        $crf = match ($options['quality'] ?? 'medium') {
            'low' => '32',
            'high' => '23',
            default => '28',
        };

        array_push($command, '-c:v', 'libx264', '-preset', 'medium', '-crf', $crf, '-c:a', 'aac', '-b:a', '128k');
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

        array_push($command, '-c:v', 'libx264', '-c:a', 'aac');
    }

    private function rotate(array &$command, array $options): void
    {
        $angle = ((int) ($options['angle'] ?? 90)) % 360;
        $filter = match ($angle) {
            180, -180 => 'hflip,vflip',
            270, -90 => 'transpose=2',
            default => 'transpose=1',
        };

        array_push($command, '-vf', $filter, '-c:a', 'copy');
    }

    private function resolution(array &$command, array $options): void
    {
        $resolution = $options['resolution'] ?? null;
        $scale = $resolution && preg_match('/^\d+x\d+$/', $resolution)
            ? str_replace('x', ':', $resolution)
            : ((int) ($options['width'] ?? 1280)).':'.((int) ($options['height'] ?? 720));

        array_push($command, '-vf', 'scale='.$scale, '-c:v', 'libx264', '-c:a', 'aac');
    }

    private function fps(array &$command, array $options): void
    {
        array_push($command, '-r', (string) ((int) ($options['fps'] ?? 30)), '-c:v', 'libx264', '-c:a', 'aac');
    }

    private function audio(array &$command): void
    {
        array_push($command, '-vn', '-acodec', 'libmp3lame', '-b:a', '192k');
    }

    private function gif(array &$command): void
    {
        array_push($command, '-vf', 'fps=12,scale=720:-1:flags=lanczos');
    }

    private function output(array $tool, array $input, string $conversionId, string $extension): array
    {
        $base = Str::slug(pathinfo($input['original_name'], PATHINFO_FILENAME)) ?: 'video';

        return $this->files->outputPath($conversionId, "{$base}-{$tool['id']}.".strtolower($extension));
    }
}
