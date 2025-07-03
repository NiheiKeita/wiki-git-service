<?php

namespace App\Http\Controllers\Wiki;

use App\Http\Controllers\Controller;
use App\Models\Repository;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RepositoryController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $ownedRepositories = $user->ownedRepositories()->with('owner')->get();
        $sharedRepositories = $user->repositories()->with('owner')->get();

        return Inertia::render('Wiki/Repository/IndexView', [
            'ownedRepositories' => $ownedRepositories,
            'sharedRepositories' => $sharedRepositories,
        ]);
    }

    public function create()
    {
        return Inertia::render('Wiki/Repository/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_public' => 'boolean',
        ]);

        $repository = Repository::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'slug' => Str::slug($validated['name']),
            'is_public' => $validated['is_public'] ?? false,
            'owner_id' => auth()->id(),
        ]);

        // メインブランチを作成
        Branch::create([
            'repository_id' => $repository->id,
            'name' => 'main',
            'is_main' => true,
        ]);

        return redirect()->route('wiki.repositories.show', $repository)
            ->with('success', 'リポジトリが作成されました。');
    }

    public function show(Repository $repository)
    {
        $user = auth()->user();

        if (!$repository->hasUserAccess($user)) {
            abort(403);
        }

        $repository->load([
            'owner',
            'branches',
            'articles' => function ($query) {
                $query->with('branch')->latest();
            },
            'pullRequests' => function ($query) {
                $query->with(['author', 'sourceBranch', 'targetBranch'])->latest();
            },
        ]);

        return Inertia::render('Wiki/Repository/Show', [
            'repository' => $repository,
            'userRole' => $repository->users()->where('user_id', $user->id)->first()?->pivot->role ?? 'owner',
        ]);
    }

    public function edit(Repository $repository)
    {
        $user = auth()->user();

        if (!$repository->hasUserAccess($user, 'owner')) {
            abort(403);
        }

        return Inertia::render('Wiki/Repository/Edit', [
            'repository' => $repository,
        ]);
    }

    public function update(Request $request, Repository $repository)
    {
        $user = auth()->user();

        if (!$repository->hasUserAccess($user, 'owner')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_public' => 'boolean',
        ]);

        $repository->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'is_public' => $validated['is_public'] ?? false,
        ]);

        return redirect()->route('wiki.repositories.show', $repository)
            ->with('success', 'リポジトリが更新されました。');
    }

    public function destroy(Repository $repository)
    {
        $user = auth()->user();

        if (!$repository->hasUserAccess($user, 'owner')) {
            abort(403);
        }

        $repository->delete();

        return redirect()->route('wiki.repositories.index')
            ->with('success', 'リポジトリが削除されました。');
    }
}
