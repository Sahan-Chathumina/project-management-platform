<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\Request;

class TaskCommentController extends Controller
{
    public function index(Task $task)
    {
        return response()->json($task->comments()->with('user')->latest()->get());
    }

    public function store(Request $request, Task $task)
    {
        $user = $request->user();

        if ($user->role->name === 'Team Member' && $task->assigned_to !== $user->id) {
            return response()->json(['message' => 'Forbidden. You can only comment on tasks assigned to you.'], 403);
        }

        $validated = $request->validate([
            'comment' => ['required', 'string'],
        ]);

        $comment = $task->comments()->create([
            'user_id' => $user->id,
            'comment' => $validated['comment'],
        ]);

        return response()->json($comment->load('user'), 201);
    }

    public function destroy(TaskComment $comment)
    {
        $comment->delete();
        return response()->json(['message' => 'Comment deleted']);
    }
}