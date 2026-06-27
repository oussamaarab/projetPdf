<?php

namespace App\Jobs;

use App\Services\Conversions\ConversionProcessor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessConversionJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 1;

    public int $timeout;

    public function __construct(public readonly string $conversionId)
    {
        $this->timeout = (int) config('conversions.process_timeout');
    }

    public function handle(ConversionProcessor $processor): void
    {
        $processor->process($this->conversionId);
    }
}
