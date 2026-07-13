<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Task::with(['project', 'assignee', 'creator']);

        if ($user->role->name === 'Team Member') {
            $query->where('assigned_to', $user->id);
        } elseif ($user->role->name === 'Project Manager') {
            $query->whereHas('project', fn ($q) => $q->where('created_by', $user->id));
        }

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => ['required', 'exists:projects,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['nullable', 'in:low,medium,high'],
            'status' => ['nullable', 'in:pending,in_progress,completed'],
            'due_date' => ['nullable', 'date'],
        ]);

        $task = Task::create([
            ...$validated,
            'priority' => $validated['priority'] ?? 'medium',
            'status' => $validated['status'] ?? 'pending',
            'created_by' => $request->user()->id,
        ]);

        return response()->json($task->load(['project', 'assignee']), 201);
    }

    public function show(Task $task)
    {
        return response()->json($task->load(['project', 'assignee', 'creator', 'comments.user']));
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'priority' => ['sometimes', 'in:low,medium,high'],
            'due_date' => ['nullable', 'date'],
        ]);

        $task->update($validated);

        return response()->json($task->load(['project', 'assignee']));
    }

    public function updateStatus(Request $request, Task $task)
    {
        $user = $request->user();

        if ($user->role->name === 'Team Member' && $task->assigned_to !== $user->id) {
            return response()->json(['message' => 'Forbidden. You can only update tasks assigned to you.'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:pending,in_progress,completed'],
        ]);

        $task->status = $validated['status'];
        $task->completed_at = $validated['status'] === 'completed' ? now() : null;
        $task->save();

        return response()->json($task->load(['project', 'assignee']));
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(['message' => 'Task deleted']);
    }
}