<?php

use App\Jobs\CleanupExpiredConversionsJob;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Artisan;

Artisan::command('conversions:cleanup', function () {
    CleanupExpiredConversionsJob::dispatchSync();
    $this->info('Expired temporary conversion files were cleaned.');
})->purpose('Delete expired temporary conversion files');

app(Schedule::class)->job(new CleanupExpiredConversionsJob)->hourly();
