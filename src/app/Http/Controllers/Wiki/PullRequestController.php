<?php

namespace App\Http\Controllers\Wiki;

use App\Http\Controllers\Controller;
use App\Models\Repository;
use App\Models\PullRequest;
use App\Models\PullRequestComment;
use App\Models\Article;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PullRequestController extends Controller
{
    public function index(Repository $repository)
    {
        $user = auth()->user();

        if (!$repository->hasUserAccess($user)) {
            abort(403);
        }

        $pullRequests = $repository->pullRequests()
            ->with(['author', 'sourceBranch', 'targetBranch', 'article'])
            ->latest()
            ->get();

        return Inertia::render('Wiki/PullRequest/Index', [
            'repository' => $repository,
            'pullRequests' => $pullRequests,
        ]);
    }

    public function create(Repository $repository)
    {
        $user = auth()->user();

        if (!$repository->hasUserAccess($user, 'editor')) {
            abort(403);
        }

        $branches = $repository->branches()->get();
        $articles = $repository->articles()->with('branch')->get();

        return Inertia::render('Wiki/PullRequest/Create', [
            'repository' => $repository,
            'branches' => $branches,
            'articles' => $articles,
        ]);
    }

    public function store(Request $request, Repository $repository)
    {
        $user = auth()->user();

        if (!$repository->hasUserAccess($user, 'editor')) {
            abort(403);
        }

        $validated = $request->validate([
            'source_branch_id' => 'required|exists:branches,id',
            'target_branch_id' => 'required|exists:branches,id|different:source_branch_id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $pullRequest = PullRequest::create([
            'repository_id' => $repository->id,
            'source_branch_id' => $validated['source_branch_id'],
            'target_branch_id' => $validated['target_branch_id'],
            'author_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'status' => 'open',
        ]);

        return redirect()->route('wiki.repositories.pull-requests.show', [$repository, $pullRequest])
            ->with('success', 'プルリクエストが作成されました。');
    }

    public function show(Repository $repository, PullRequest $pullRequest)
    {
        $user = auth()->user();

        if (!$repository->hasUserAccess($user)) {
            abort(403);
        }

        $pullRequest->load([
            'author',
            'sourceBranch',
            'targetBranch',
            'comments' => function ($query) {
                $query->with('user')->orderBy('created_at');
            },
        ]);

        // デバッグ用ログ
        \Log::info('PullRequest loaded with comments', [
            'pull_request_id' => $pullRequest->id,
            'comments_count' => $pullRequest->comments->count(),
            'comments' => $pullRequest->comments->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'user_name' => $comment->user->name ?? 'Unknown',
                    'line_number' => $comment->line_number,
                    'created_at' => $comment->created_at,
                ];
            })->toArray(),
        ]);

        // ブランチ間の記事差分を取得
        $sourceArticles = Article::where('branch_id', $pullRequest->source_branch_id)
            ->where('repository_id', $repository->id)
            ->get();

        $targetArticles = Article::where('branch_id', $pullRequest->target_branch_id)
            ->where('repository_id', $repository->id)
            ->get();

        // 差分を計算（全記事の差分を結合）
        $diff = [];
        foreach ($sourceArticles as $sourceArticle) {
            $targetArticle = $targetArticles->where('slug', $sourceArticle->slug)->first();
            $articleDiff = $this->calculateDiff(
                $targetArticle?->content ?? '',
                $sourceArticle->content
            );

            // 記事タイトルを追加
            $diff[] = [
                'type' => 'header',
                'content' => $sourceArticle->title,
                'article_slug' => $sourceArticle->slug,
            ];
            $diff = array_merge($diff, $articleDiff);
        }

        return Inertia::render('Wiki/PullRequest/Show', [
            'repository' => $repository,
            'pullRequest' => $pullRequest,
            'diff' => $diff,
            'sourceArticles' => $sourceArticles,
            'targetArticles' => $targetArticles,
        ]);
    }

    public function merge(Request $request, Repository $repository, PullRequest $pullRequest)
    {
        $user = auth()->user();

        if (!$repository->hasUserAccess($user, 'editor')) {
            abort(403);
        }

        if ($pullRequest->status !== 'open') {
            return back()->with('error', 'このプルリクエストは既にマージ済みまたはクローズされています。');
        }

        DB::transaction(function () use ($pullRequest, $user) {
            // ソースブランチの記事をターゲットブランチにマージ
            $sourceArticle = Article::where('id', $pullRequest->article_id)
                ->where('branch_id', $pullRequest->source_branch_id)
                ->first();

            if ($sourceArticle) {
                $targetArticle = Article::where('id', $pullRequest->article_id)
                    ->where('branch_id', $pullRequest->target_branch_id)
                    ->first();

                if ($targetArticle) {
                    // 既存の記事を更新
                    $targetArticle->update([
                        'title' => $sourceArticle->title,
                        'content' => $sourceArticle->content,
                        'tags' => $sourceArticle->tags,
                    ]);
                } else {
                    // 新しい記事を作成
                    Article::create([
                        'repository_id' => $pullRequest->repository_id,
                        'branch_id' => $pullRequest->target_branch_id,
                        'title' => $sourceArticle->title,
                        'content' => $sourceArticle->content,
                        'slug' => $sourceArticle->slug,
                        'tags' => $sourceArticle->tags,
                        'is_published' => $pullRequest->targetBranch->is_main,
                    ]);
                }
            }

            // プルリクエストをマージ済みに更新
            $pullRequest->update([
                'status' => 'merged',
                'merged_by' => $user->id,
                'merged_at' => now(),
            ]);
        });

        return redirect()->route('wiki.repositories.pull-requests.show', [$repository, $pullRequest])
            ->with('success', 'プルリクエストがマージされました。');
    }

    public function close(Repository $repository, PullRequest $pullRequest)
    {
        $user = auth()->user();

        if (!$repository->hasUserAccess($user, 'editor')) {
            abort(403);
        }

        if ($pullRequest->status !== 'open') {
            return back()->with('error', 'このプルリクエストは既にマージ済みまたはクローズされています。');
        }

        $pullRequest->update(['status' => 'closed']);

        return redirect()->route('wiki.repositories.pull-requests.show', [$repository, $pullRequest])
            ->with('success', 'プルリクエストがクローズされました。');
    }

    public function addComment(Request $request, Repository $repository, PullRequest $pullRequest)
    {
        try {
            $user = auth()->user();

            if (!$repository->hasUserAccess($user)) {
                abort(403);
            }

            $validated = $request->validate([
                'content' => 'required|string',
                'line_number' => 'nullable|integer',
                'line_content' => 'nullable|string',
            ]);

            // デバッグ用ログ（バリデーション後）
            \Log::info('Validation passed', [
                'validated_data' => $validated,
                'pull_request_id' => $pullRequest->id,
                'user_id' => $user->id,
            ]);

            $comment = PullRequestComment::create([
                'pull_request_id' => $pullRequest->id,
                'user_id' => $user->id,
                'content' => $validated['content'],
                'line_number' => $validated['line_number'] ?? null,
                'line_content' => $validated['line_content'] ?? null,
            ]);

            // デバッグ用ログ
            \Log::info('Comment created', [
                'comment_id' => $comment->id,
                'pull_request_id' => $pullRequest->id,
                'user_id' => $user->id,
                'content' => $validated['content'],
                'line_number' => $validated['line_number'] ?? null,
            ]);

            return redirect()->route('wiki.repositories.pull-requests.show', [$repository, $pullRequest])
                ->with('success', 'コメントが追加されました。');
        } catch (\Exception $e) {
            // エラーログ
            \Log::error('Comment creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
            ]);

            return back()->with('error', 'コメントの投稿に失敗しました: ' . $e->getMessage());
        }
    }

    private function calculateDiff(string $oldContent, string $newContent): array
    {
        $oldLines = explode("\n", $oldContent);
        $newLines = explode("\n", $newContent);

        $diff = [];
        $maxLines = max(count($oldLines), count($newLines));

        for ($i = 0; $i < $maxLines; $i++) {
            $oldLine = $oldLines[$i] ?? '';
            $newLine = $newLines[$i] ?? '';

            if ($oldLine === $newLine) {
                $diff[] = [
                    'type' => 'unchanged',
                    'line_number' => $i + 1,
                    'content' => $oldLine,
                ];
            } else {
                if ($oldLine !== '') {
                    $diff[] = [
                        'type' => 'removed',
                        'line_number' => $i + 1,
                        'content' => $oldLine,
                    ];
                }
                if ($newLine !== '') {
                    $diff[] = [
                        'type' => 'added',
                        'line_number' => $i + 1,
                        'content' => $newLine,
                    ];
                }
            }
        }

        return $diff;
    }
}
