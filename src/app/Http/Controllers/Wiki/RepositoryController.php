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

        // Git履歴データを生成
        $commits = $this->generateGitHistory($repository);
        $branches = $this->generateBranchData($repository);

        return Inertia::render('Wiki/Repository/Show', [
            'repository' => $repository,
            'userRole' => $repository->users()->where('user_id', $user->id)->first()?->pivot->role ?? 'owner',
            'commits' => $commits,
            'branches' => $branches,
        ]);
    }

    private function generateGitHistory(Repository $repository)
    {
        $commits = [];

        // 記事の作成・更新履歴からコミットを生成
        $articles = $repository->articles()->with(['branch'])->get();

        foreach ($articles as $article) {
            $commits[] = [
                'id' => 'c' . $article->id,
                'message' => $article->title . ' を作成',
                'author' => 'システム',
                'date' => $article->created_at->toISOString(),
                'branch' => $article->branch->name,
                'parents' => [],
                'is_merge' => false,
                'is_head' => false,
            ];

            if ($article->updated_at->gt($article->created_at)) {
                $commits[] = [
                    'id' => 'c' . $article->id . '_update',
                    'message' => $article->title . ' を更新',
                    'author' => 'システム',
                    'date' => $article->updated_at->toISOString(),
                    'branch' => $article->branch->name,
                    'parents' => ['c' . $article->id],
                    'is_merge' => false,
                    'is_head' => false,
                ];
            }
        }

        // プルリクエストのマージ履歴を追加
        $pullRequests = $repository->pullRequests()->where('status', 'merged')->with(['targetBranch'])->get();
        foreach ($pullRequests as $pr) {
            $commits[] = [
                'id' => 'pr' . $pr->id,
                'message' => 'PR #' . $pr->id . ' をマージ: ' . $pr->title,
                'author' => 'システム',
                'date' => $pr->updated_at->toISOString(),
                'branch' => $pr->targetBranch->name,
                'parents' => ['c' . $pr->id, 'c' . $pr->id . '_update'],
                'is_merge' => true,
                'is_head' => true,
            ];
        }

        // 日付順にソート
        usort($commits, function ($a, $b) {
            return strtotime($a['date']) - strtotime($b['date']);
        });

        return $commits;
    }

    private function generateBranchData(Repository $repository)
    {
        $branches = [];
        $colors = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

        foreach ($repository->branches as $index => $branch) {
            $branchCommits = $repository->articles()
                ->where('branch_id', $branch->id)
                ->pluck('id')
                ->map(function ($id) {
                    return 'c' . $id;
                })
                ->toArray();

            $branches[] = [
                'name' => $branch->name,
                'color' => $colors[$index % count($colors)],
                'commits' => $branchCommits,
            ];
        }

        return $branches;
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
