<?php

namespace App\Exceptions;

class ConversionException extends ApiException
{
    public function __construct(string $message, int $statusCode = 422, string $errorCode = 'conversion_failed')
    {
        parent::__construct($message, $statusCode, $errorCode);
    }
}
