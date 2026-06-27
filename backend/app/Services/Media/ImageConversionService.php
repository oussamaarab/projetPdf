<?php

namespace App\Services\Media;

use App\Exceptions\ConversionException;
use App\Services\Files\FileStorageService;
use Illuminate\Support\Str;

class ImageConversionService
{
    public function __construct(
        private readonly BinaryService $binaries,
        private readonly FileStorageService $files
    ) {
    }

    public function process(array $tool, array $inputs, array $options, string $conversionId): array
    {
        $input = $inputs[0];
        $extension = $tool['output_extension'] ?: $input['extension'];
        $output = $this->output($tool, $input, $conversionId, $extension);
        $command = [$this->binaries->path('imagemagick'), $input['absolute_path']];

        match ($tool['operation']) {
            'convert' => null,
            'resize' => $this->resize($command, $options),
            'compress', 'optimize' => $this->compress($command, $options),
            'crop' => $this->crop($command, $options),
            'rotate' => $this->rotate($command, $options),
            'flip' => $this->flip($command, $options),
            'watermark' => $this->watermark($command, $options),
            'remove-background' => $this->removeBackground($command),
            default => throw new ConversionException("Unsupported image operation [{$tool['operation']}]."),
        };

        $command[] = $output['absolute_path'];
        $this->binaries->run($command);

        return $output;
    }

    private function resize(array &$command, array $options): void
    {
        $width = (int) ($options['width'] ?? 800);
        $height = (int) ($options['height'] ?? 600);
        $keepAspect = filter_var($options['keepAspectRatio'] ?? true, FILTER_VALIDATE_BOOL);

        array_push($command, '-resize', "{$width}x{$height}".($keepAspect ? '' : '!'));
    }

    private function compress(array &$command, array $options): void
    {
        $quality = match ($options['quality'] ?? 'medium') {
            'low' => '55',
            'high' => '88',
            default => '72',
        };

        array_push($command, '-strip', '-interlace', 'Plane', '-quality', $quality);
    }

    private function crop(array &$command, array $options): void
    {
        $width = (int) ($options['width'] ?? 800);
        $height = (int) ($options['height'] ?? 600);
        $x = (int) ($options['x'] ?? 0);
        $y = (int) ($options['y'] ?? 0);

        array_push($command, '-crop', "{$width}x{$height}+{$x}+{$y}", '+repage');
    }

    private function rotate(array &$command, array $options): void
    {
        array_push($command, '-rotate', (string) ((int) ($options['angle'] ?? 90)));
    }

    private function flip(array &$command, array $options): void
    {
        $mode = $options['flip'] ?? 'horizontal';
        $command[] = $mode === 'vertical' ? '-flip' : '-flop';
    }

    private function watermark(array &$command, array $options): void
    {
        $text = $options['watermark'] ?? config('app.name');

        array_push($command, '-gravity', 'southeast', '-pointsize', '28', '-fill', 'rgba(255,255,255,0.75)', '-annotate', '+24+24', $text);
    }

    private function removeBackground(array &$command): void
    {
        array_push($command, '-fuzz', '8%', '-transparent', 'white');
    }

    private function output(array $tool, array $input, string $conversionId, string $extension): array
    {
        $base = Str::slug(pathinfo($input['original_name'], PATHINFO_FILENAME)) ?: 'image';

        return $this->files->outputPath($conversionId, "{$base}-{$tool['id']}.".strtolower($extension));
    }
}
