<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Example role-protected route — Admin only
    Route::middleware('role:Administrator')->group(function () {
        Route::get('/admin/ping', fn () => response()->json(['message' => 'Admin access confirmed']));
    });
});