<?php

return [

    // 1. Added 'login' and 'logout' so the CORS middleware handles those endpoints too
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],

    'allowed_methods' => ['*'],

    // 2. Added your Vercel production domain here
    'allowed_origins' => [
        'http://localhost:3000',
        'https://project-management-platform-sigma.vercel.app',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // 3. Changed to true so browser cookies/sessions can securely pass through
    'supports_credentials' => true,

];