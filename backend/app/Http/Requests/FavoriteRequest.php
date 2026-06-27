<?php

namespace App\Http\Requests;

use App\Services\Conversions\ToolCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FavoriteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tool_id' => ['required', 'string', Rule::in(app(ToolCatalog::class)->ids())],
        ];
    }
}
