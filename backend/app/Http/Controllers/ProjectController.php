<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role->name === 'Administrator') {
            $projects = Project::with(['creator', 'members'])->latest()->get();
        } elseif ($user->role->name === 'Project Manager') {
            $projects = Project::with(['creator', 'members'])
                ->where('created_by', $user->id)
                ->latest()->get();
        } else {
            $projects = $user->projects()->with(['creator', 'members'])->latest()->get();
        }

        return response()->json($projects);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['nullable', 'in:active,completed,on_hold,cancelled'],
        ]);

        $project = Project::create([
            ...$validated,
            'status' => $validated['status'] ?? 'active',
            'created_by' => $request->user()->id,
        ]);

        return response()->json($project->load('creator'), 201);
    }

    public function show(Project $project)
    {
        return response()->json($project->load(['creator', 'members', 'tasks']));
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', 'in:active,completed,on_hold,cancelled'],
        ]);

        $project->update($validated);

        return response()->json($project->load(['creator', 'members']));
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return response()->json(['message' => 'Project deleted']);
    }
}
