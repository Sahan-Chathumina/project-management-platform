<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->role->name;

        if ($role === 'Administrator') {
            return response()->json([
                'total_users' => User::count(),
                'total_projects' => Project::count(),
                'total_tasks' => Task::count(),
            ]);
        }

        if ($role === 'Project Manager') {
            $projectIds = Project::where('created_by', $user->id)->pluck('id');

            return response()->json([
                'my_projects' => $projectIds->count(),
                'pending_tasks' => Task::whereIn('project_id', $projectIds)->where('status', 'pending')->count(),
                'completed_tasks' => Task::whereIn('project_id', $projectIds)->where('status', 'completed')->count(),
            ]);
        }

        return response()->json([
            'assigned_tasks' => Task::where('assigned_to', $user->id)->count(),
            'completed_tasks' => Task::where('assigned_to', $user->id)->where('status', 'completed')->count(),
            'upcoming_deadlines' => Task::where('assigned_to', $user->id)
                ->where('status', '!=', 'completed')
                ->whereNotNull('due_date')
                ->where('due_date', '>=', now())
                ->orderBy('due_date')
                ->take(5)
                ->get(),
        ]);
    }
}