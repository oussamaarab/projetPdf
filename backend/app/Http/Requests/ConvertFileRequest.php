<?php

namespace App\Http\Requests;

use App\Services\Conversions\ToolCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ConvertFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->route('tool')) {
            $this->merge(['tool' => $this->route('tool')]);
        }
    }

    public function rules(): array
    {
        $max = config('conversions.max_upload_mb') * 1024;

        return [
            'tool' => ['required', 'string', Rule::in(app(ToolCatalog::class)->ids())],
            'file' => ['required_without:files', 'file', "max:{$max}"],
            'files' => ['required_without:file', 'array', 'max:50'],
            'files.*' => ['file', "max:{$max}"],
            'quality' => ['nullable', Rule::in(['low', 'medium', 'high'])],
            'password' => ['nullable', 'string', 'max:255'],
            'pages' => ['nullable', 'string', 'max:500'],
            'keep_pages' => ['nullable', 'string', 'max:500'],
            'page_range' => ['nullable', 'string', 'max:100'],
            'width' => ['nullable', 'integer', 'min:1', 'max:20000'],
            'height' => ['nullable', 'integer', 'min:1', 'max:20000'],
            'x' => ['nullable', 'integer', 'min:0', 'max:20000'],
            'y' => ['nullable', 'integer', 'min:0', 'max:20000'],
            'keepAspectRatio' => ['nullable'],
            'start' => ['nullable', 'numeric', 'min:0'],
            'end' => ['nullable', 'numeric', 'min:0'],
            'duration' => ['nullable', 'numeric', 'min:0'],
            'fps' => ['nullable', 'integer', 'min:1', 'max:240'],
            'bitrate' => ['nullable', 'string', 'max:20'],
            'resolution' => ['nullable', 'string', 'max:30'],
            'angle' => ['nullable', 'integer'],
            'flip' => ['nullable', Rule::in(['horizontal', 'vertical'])],
            'watermark' => ['nullable', 'string', 'max:200'],
            'signature' => ['nullable', 'string', 'max:200'],
            'metadata' => ['nullable', 'array'],
            'archive_password' => ['nullable', 'string', 'max:255'],
        ];
    }
}
