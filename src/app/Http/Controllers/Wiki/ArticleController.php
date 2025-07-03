<?php

namespace App\Http\Controllers\Wiki;

use App\Http\Controllers\Controller;
use App\Models\Repository;
use App\Models\Article;
use App\Models\Branch;
use App\Models\Commit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use League\CommonMark\GithubFlavoredMarkdownConverter;

class ArticleController extends Controller
{
  public function index(Repository $repository)
  {
    $user = auth()->user();

    if (!$repository->hasUserAccess($user)) {
      abort(403);
    }

    $articles = $repository->articles()
      ->with(['branch', 'latestCommit'])
      ->latest()
      ->get();

    return Inertia::render('Wiki/Article/Index', [
      'repository' => $repository,
      'articles' => $articles,
    ]);
  }

  public function create(Repository $repository)
  {
    $user = auth()->user();

    if (!$repository->hasUserAccess($user, 'editor')) {
      abort(403);
    }

    $branches = $repository->branches()->get();

    return Inertia::render('Wiki/Article/Create', [
      'repository' => $repository,
      'branches' => $branches,
    ]);
  }

  public function store(Request $request, Repository $repository)
  {
    $user = auth()->user();

    if (!$repository->hasUserAccess($user, 'editor')) {
      abort(403);
    }

    // create_new_branchを厳密にbool化
    $isNewBranch = filter_var($request->input('create_new_branch'), FILTER_VALIDATE_BOOLEAN);

    try {
      $validated = $request->validate([
        'title' => 'required|string|max:255',
        'content' => 'required|string',
        'branch_id' => $isNewBranch ? 'nullable' : 'required|exists:branches,id',
        'new_branch_name' => $isNewBranch ? 'required|string|max:255' : 'nullable',
        'tags' => 'nullable|array',
        'tags.*' => 'string|max:50',
        'commit_message' => 'nullable|string|max:255',
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      \Log::error('記事作成バリデーションエラー', [
        'errors' => $e->errors(),
        'input' => $request->all(),
        'isNewBranch' => $isNewBranch,
      ]);
      throw $e;
    }

    if ($isNewBranch) {
      $branch = Branch::create([
        'repository_id' => $repository->id,
        'name' => $validated['new_branch_name'],
        'is_main' => false,
      ]);
      $branch_id = $branch->id;
    } else {
      $branch_id = $validated['branch_id'];
    }

    $article = Article::create([
      'repository_id' => $repository->id,
      'branch_id' => $branch_id,
      'title' => $validated['title'],
      'content' => $validated['content'],
      'slug' => Str::slug($validated['title']),
      'tags' => $validated['tags'] ?? [],
      'is_published' => false,
    ]);

    // コミットを作成
    Commit::create([
      'repository_id' => $repository->id,
      'branch_id' => $branch_id,
      'article_id' => $article->id,
      'user_id' => $user->id,
      'hash' => Commit::generateHash(),
      'message' => $validated['commit_message'] ?? '記事作成',
      'content_after' => $validated['content'],
    ]);

    return redirect()->route('wiki.repositories.articles.show', [$repository, $article])
      ->with('success', '記事が作成されました。');
  }

  public function show(Repository $repository, Article $article)
  {
    $user = auth()->user();

    if (!$repository->hasUserAccess($user)) {
      abort(403);
    }

    $article->load([
      'branch',
      'commits' => function ($query) {
        $query->with('user')->latest();
      },
      'pullRequests' => function ($query) {
        $query->with(['author', 'sourceBranch', 'targetBranch'])->latest();
      },
    ]);

    // MarkdownをHTMLに変換
    $converter = new GithubFlavoredMarkdownConverter([
      'html_input' => 'strip',
      'allow_unsafe_links' => false,
    ]);
    $htmlContent = $converter->convert($article->content);

    return Inertia::render('Wiki/Article/Show', [
      'repository' => $repository,
      'article' => $article,
      'htmlContent' => $htmlContent->getContent(),
    ]);
  }

  public function edit(Repository $repository, Article $article)
  {
    $user = auth()->user();

    if (!$repository->hasUserAccess($user, 'editor')) {
      abort(403);
    }

    $branches = $repository->branches()->get();

    return Inertia::render('Wiki/Article/Edit', [
      'repository' => $repository,
      'article' => $article,
      'branches' => $branches,
    ]);
  }

  public function update(Request $request, Repository $repository, Article $article)
  {
    $user = auth()->user();

    if (!$repository->hasUserAccess($user, 'editor')) {
      abort(403);
    }

    $validated = $request->validate([
      'title' => 'required|string|max:255',
      'content' => 'required|string',
      'branch_id' => 'required|exists:branches,id',
      'tags' => 'nullable|array',
      'tags.*' => 'string|max:50',
      'commit_message' => 'required|string|max:255',
    ]);

    $contentBefore = $article->content;

    $article->update([
      'title' => $validated['title'],
      'content' => $validated['content'],
      'slug' => Str::slug($validated['title']),
      'branch_id' => $validated['branch_id'],
      'tags' => $validated['tags'] ?? [],
    ]);

    // コミットを作成
    Commit::create([
      'repository_id' => $repository->id,
      'branch_id' => $validated['branch_id'],
      'article_id' => $article->id,
      'user_id' => $user->id,
      'hash' => Commit::generateHash(),
      'message' => $validated['commit_message'],
      'content_before' => $contentBefore,
      'content_after' => $validated['content'],
    ]);

    return redirect()->route('wiki.repositories.articles.show', [$repository, $article])
      ->with('success', '記事が更新されました。');
  }

  public function destroy(Repository $repository, Article $article)
  {
    $user = auth()->user();

    if (!$repository->hasUserAccess($user, 'editor')) {
      abort(403);
    }

    $article->delete();

    return redirect()->route('wiki.repositories.articles.index', $repository)
      ->with('success', '記事が削除されました。');
  }
}
