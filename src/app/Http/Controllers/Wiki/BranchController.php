<?php

namespace App\Http\Controllers\Wiki;

use App\Http\Controllers\Controller;
use App\Models\Repository;
use App\Models\Branch;
use App\Models\Commit;
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

        // 現在のブランチの記事を取得
        $branchArticles = $branch->articles()->with('branch')->latest()->get();

        // mainブランチの記事を取得（現在のブランチがmainでない場合のみ）
        $mainArticles = collect();
        if (!$branch->is_main) {
            $mainBranch = $repository->branches()->where('is_main', true)->first();
            if ($mainBranch) {
                $mainArticles = $mainBranch->articles()->with('branch')->latest()->get();
            }
        }

        return Inertia::render('Wiki/Branch/Articles/Index', [
            'repository' => $repository,
            'branch' => $branch,
            'articles' => $branchArticles,
            'mainArticles' => $mainArticles,
        ]);
    }

    public function showArticle(Repository $repository, Branch $branch, Article $article)
    {
        $user = auth()->user();
        if (!$repository->hasUserAccess($user)) abort(403);
        if ($branch->repository_id !== $repository->id) abort(404);
        if ($article->branch_id !== $branch->id) abort(404);

        $article->load([
            'branch',
            'commits' => function ($query) {
                $query->with('user')->latest();
            },
        ]);

        // MarkdownをHTMLに変換
        $converter = new \League\CommonMark\GithubFlavoredMarkdownConverter([
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
        ]);
        $htmlContent = $converter->convert($article->content);

        return Inertia::render('Wiki/Branch/Articles/Show', [
            'repository' => $repository,
            'branch' => $branch,
            'article' => $article,
            'htmlContent' => $htmlContent->getContent(),
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

    public function storeArticle(Request $request, Repository $repository, Branch $branch)
    {
        $user = auth()->user();
        if (!$repository->hasUserAccess($user, 'editor')) abort(403);
        if ($branch->repository_id !== $repository->id) abort(404);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'commit_message' => 'required|string|max:255',
        ]);

        // slug生成（重複防止ロジック）
        $slugBase = Str::slug($validated['title']);
        $slug = $slugBase . '-' . $branch->name;
        $originalSlug = $slug;
        $counter = 1;
        while (\App\Models\Article::where('slug', $slug)->where('branch_id', $branch->id)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $article = Article::create([
            'repository_id' => $repository->id,
            'branch_id' => $branch->id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'slug' => $slug,
            'is_published' => false,
        ]);

        // コミットを作成
        Commit::create([
            'repository_id' => $repository->id,
            'branch_id' => $branch->id,
            'article_id' => $article->id,
            'user_id' => $user->id,
            'hash' => Commit::generateHash(),
            'message' => $validated['commit_message'],
            'content_after' => $validated['content'],
        ]);

        return redirect()->route('wiki.repositories.branches.articles', [$repository, $branch])
            ->with('success', '記事が作成されました。');
    }
}
