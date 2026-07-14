<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use App\Models\User;

class ProjectMemberController extends Controller
{

    public function availableUsers()
    {
        return response()->json(User::select('id', 'name', 'email')->orderBy('name')->get());
    }
    
    public function index(Project $project)
    {
        return response()->json($project->members);
    }

    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        if ($project->members()->where('user_id', $validated['user_id'])->exists()) {
            return response()->json(['message' => 'User is already a member of this project'], 422);
        }

        $project->members()->attach($validated['user_id']);

        return response()->json($project->load('members'), 201);
    }

    public function destroy(Project $project, $userId)
    {
        $project->members()->detach($userId);
        return response()->json(['message' => 'Member removed']);
    }
}
