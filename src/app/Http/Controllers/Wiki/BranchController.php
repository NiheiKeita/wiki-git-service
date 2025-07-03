<?php

namespace App\Http\Controllers\Wiki;

use App\Http\Controllers\Controller;
use App\Models\Repository;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Models\Article;

class BranchController extends Controller
{
  public function index(Repository $repository)
  {
    $user = auth()->user();

    if (!$repository->hasUserAccess($user)) {
      abort(403);
    }

    $repository->load(['branches' => function ($query) {
      $query->withCount('articles')->orderBy('name');
    }]);

    return Inertia::render('Wiki/Branch/Index', [
      'repository' => $repository,
    ]);
  }

  public function create(Repository $repository)
  {
    $user = auth()->user();

    if (!$repository->hasUserAccess($user)) {
      abort(403);
    }

    return Inertia::render('Wiki/Branch/Create', [
      'repository' => $repository,
    ]);
  }

  public function store(Request $request, Repository $repository)
  {
    $user = auth()->user();

    if (!$repository->hasUserAccess($user)) {
      abort(403);
    }

    $validated = $request->validate([
      'name' => 'required|string|max:255|unique:branches,name,NULL,id,repository_id,' . $repository->id,
      'description' => 'nullable|string',
    ]);

    $branch = Branch::create([
      'repository_id' => $repository->id,
      'name' => $validated['name'],
      'description' => $validated['description'] ?? null,
      'is_main' => false,
    ]);

    return redirect()->route('wiki.repositories.branches.index', $repository)
      ->with('success', 'ブランチが作成されました。');
  }

  public function edit(Repository $repository, Branch $branch)
  {
    $user = auth()->user();

    if (!$repository->hasUserAccess($user)) {
      abort(403);
    }

    if ($branch->repository_id !== $repository->id) {
      abort(404);
    }

    return Inertia::render('Wiki/Branch/Edit', [
      'repository' => $repository,
      'branch' => $branch,
    ]);
  }

  public function update(Request $request, Repository $repository, Branch $branch)
  {
    $user = auth()->user();

    if (!$repository->hasUserAccess($user)) {
      abort(403);
    }

    if ($branch->repository_id !== $repository->id) {
      abort(404);
    }

    $validated = $request->validate([
      'name' => 'required|string|max:255|unique:branches,name,' . $branch->id . ',id,repository_id,' . $repository->id,
      'description' => 'nullable|string',
    ]);

    $branch->update([
      'name' => $validated['name'],
      'description' => $validated['description'] ?? null,
    ]);

    return redirect()->route('wiki.repositories.branches.index', $repository)
      ->with('success', 'ブランチが更新されました。');
  }

  public function destroy(Repository $repository, Branch $branch)
  {
    $user = auth()->user();

    if (!$repository->hasUserAccess($user)) {
      abort(403);
    }

    if ($branch->repository_id !== $repository->id) {
      abort(404);
    }

    if ($branch->is_main) {
      return redirect()->route('wiki.repositories.branches.index', $repository)
        ->with('error', 'メインブランチは削除できません。');
    }

    if ($branch->articles()->count() > 0) {
      return redirect()->route('wiki.repositories.branches.index', $repository)
        ->with('error', '記事が存在するブランチは削除できません。');
    }

    $branch->delete();

    return redirect()->route('wiki.repositories.branches.index', $repository)
      ->with('success', 'ブランチが削除されました。');
  }

  public function articles(Repository $repository, Branch $branch)
  {
    $user = auth()->user();
    if (!$repository->hasUserAccess($user)) {
      abort(403);
    }
    if ($branch->repository_id !== $repository->id) {
      abort(404);
    }
    $articles = $branch->articles()->with('branch')->latest()->get();
    return Inertia::render('Wiki/Branch/Articles/Index', [
      'repository' => $repository,
      'branch' => $branch,
      'articles' => $articles,
    ]);
  }

  public function showArticle(Repository $repository, Branch $branch, Article $article)
  {
    $user = auth()->user();
    if (!$repository->hasUserAccess($user)) abort(403);
    if ($branch->repository_id !== $repository->id) abort(404);
    if ($article->branch_id !== $branch->id) abort(404);

    $article->load(['branch']);
    // 必要なら他のリレーションも

    return Inertia::render('Wiki/Branch/Articles/Show', [
      'repository' => $repository,
      'branch' => $branch,
      'article' => $article,
    ]);
  }

  public function editArticle(Repository $repository, Branch $branch, Article $article)
  {
    $user = auth()->user();
    if (!$repository->hasUserAccess($user, 'editor')) abort(403);
    if ($branch->repository_id !== $repository->id) abort(404);
    if ($article->branch_id !== $branch->id) abort(404);

    return Inertia::render('Wiki/Branch/Articles/Edit', [
      'repository' => $repository,
      'branch' => $branch,
      'article' => $article,
    ]);
  }

  public function createArticle(Repository $repository, Branch $branch)
  {
    $user = auth()->user();
    if (!$repository->hasUserAccess($user, 'editor')) abort(403);
    if ($branch->repository_id !== $repository->id) abort(404);

    return Inertia::render('Wiki/Branch/Articles/Create', [
      'repository' => $repository,
      'branch' => $branch,
    ]);
  }
}
