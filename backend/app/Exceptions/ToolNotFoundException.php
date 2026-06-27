<?php

namespace App\Exceptions;

class ToolNotFoundException extends ApiException
{
    public function __construct(string $tool)
    {
        parent::__construct("The conversion tool [{$tool}] is not available.", 404, 'tool_not_found');
    }
}
