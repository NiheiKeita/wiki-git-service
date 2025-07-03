<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminLoginController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\ImageController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Web\LoginController;
use App\Http\Controllers\Web\PasswordController;
use App\Http\Middleware\VerifyCsrfToken;

use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\TopController;
use App\Http\Controllers\Wiki\RepositoryController;
use App\Http\Controllers\Wiki\ArticleController;
use App\Http\Controllers\Wiki\PullRequestController;
use App\Http\Controllers\Wiki\BranchController;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::group(['middleware' => 'basicauth'], function () {
    // Route::fallback(function () {
    //     return redirect(route('web.top'));
    // });

    Route::middleware('guest.web')->group(function () {
        Route::get('password/edit/{token}', [PasswordController::class, 'edit'])->name('web.password.edit');
        Route::post('password/edit/{token}', [PasswordController::class, 'update'])->name('web.password.update');
    });
    Route::get('login', [LoginController::class, 'create'])->name('user.login');
    Route::post('login', [LoginController::class, 'store']);


    //管理画面側
    Route::get('admin/login', [AdminLoginController::class, 'index'])->name('admin.login');
    Route::post('admin/login', [AdminLoginController::class, 'store'])->name('admin.login');
    Route::middleware('guest.admin')->group(function () {
        Route::get('admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard.index');

        Route::get('admin/admin_users', [AdminUserController::class, 'index'])->name('admin_user.list');
        Route::get('admin/admin_users/add', [AdminUserController::class, 'create'])->name('admin_user.create');
        Route::post('admin/admin_users/add', [AdminUserController::class, 'store'])->name('admin_user.store');

        Route::get('admin/users', [UserController::class, 'index'])->name('user.list');
        Route::get('admin/users/add', [UserController::class, 'create'])->name('user.create');
        Route::post('admin/users/add', [UserController::class, 'store'])->name('user.store');
        Route::get('admin/users/{id}', [UserController::class, 'edit'])->name('user.edit');
        Route::post('admin/users/{id}', [UserController::class, 'update'])->name('user.update');
    });

    // API
    Route::post('/api/upload', [ImageController::class, 'upload'])->withoutMiddleware(VerifyCsrfToken::class)->name('upload');
    Route::post('/api/upload/ma', [ImageController::class, 'maUpload'])->withoutMiddleware(VerifyCsrfToken::class)->name('upload.ma');
});

Route::get('/', [TopController::class, 'index'])->name('top');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('dashboard');



// Wikiシステムのルート
Route::middleware(['auth', 'verified'])->prefix('wiki')->name('wiki.')->group(function () {
    // リポジトリ管理
    Route::resource('repositories', RepositoryController::class);

    // ブランチ管理
    Route::resource('repositories.branches', BranchController::class);

    // 記事管理
    Route::resource('repositories.articles', ArticleController::class);

    // プルリクエスト管理
    Route::resource('repositories.pull-requests', PullRequestController::class);
    Route::post('repositories/{repository}/pull-requests/{pullRequest}/merge', [PullRequestController::class, 'merge'])
        ->name('pull-requests.merge');
    Route::post('repositories/{repository}/pull-requests/{pullRequest}/close', [PullRequestController::class, 'close'])
        ->name('pull-requests.close');
    Route::post('repositories/{repository}/pull-requests/{pullRequest}/comments', [PullRequestController::class, 'addComment'])
        ->name('pull-requests.comments.store');

    // ブランチの記事一覧
    Route::get('repositories/{repository}/branches/{branch}/articles', [\App\Http\Controllers\Wiki\BranchController::class, 'articles'])->name('repositories.branches.articles');

    // ブランチの記事作成
    Route::get('repositories/{repository}/branches/{branch}/articles/create', [\App\Http\Controllers\Wiki\BranchController::class, 'createArticle'])->name('repositories.branches.articles.create');
    // ブランチの記事詳細
    Route::get('repositories/{repository}/branches/{branch}/articles/{article}', [\App\Http\Controllers\Wiki\BranchController::class, 'showArticle'])->name('repositories.branches.articles.show');

    // ブランチの記事編集
    Route::get('repositories/{repository}/branches/{branch}/articles/{article}/edit', [\App\Http\Controllers\Wiki\BranchController::class, 'editArticle'])->name('repositories.branches.articles.edit');
});

// 公開Wikiページ
Route::get('/wiki/{repository:slug}', function ($repository) {
    $articles = $repository->articles()
        ->published()
        ->inMainBranch()
        ->with('branch')
        ->get();

    return Inertia::render('Wiki/Public/Index', [
        'repository' => $repository,
        'articles' => $articles,
    ]);
})->name('wiki.public.index');

Route::get('/wiki/{repository:slug}/{article:slug}', function ($repository, $article) {
    $article = $repository->articles()
        ->published()
        ->inMainBranch()
        ->where('slug', $article->slug)
        ->with('branch')
        ->firstOrFail();

    return Inertia::render('Wiki/Public/Show', [
        'repository' => $repository,
        'article' => $article,
    ]);
})->name('wiki.public.show');

require __DIR__ . '/auth.php';
