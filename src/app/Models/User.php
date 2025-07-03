<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasApiTokens;
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'tel',
        'password_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Wikiシステム用のリレーション
    public function ownedRepositories(): HasMany
    {
        return $this->hasMany(Repository::class, 'owner_id');
    }

    public function repositories(): BelongsToMany
    {
        return $this->belongsToMany(Repository::class, 'repository_users')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function commits(): HasMany
    {
        return $this->hasMany(Commit::class);
    }

    public function pullRequests(): HasMany
    {
        return $this->hasMany(PullRequest::class, 'author_id');
    }

    public function mergedPullRequests(): HasMany
    {
        return $this->hasMany(PullRequest::class, 'merged_by');
    }

    public function pullRequestComments(): HasMany
    {
        return $this->hasMany(PullRequestComment::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::updated(function ($user) {
            // プランが変更されたかどうかを確認する
            if ($user->isDirty('plan_id')) {
                // プランが変更された場合、ログを保存する
                DB::table('user_plan_logs')->insert([
                    'user_id' => $user->id,
                    'plan_id' => $user->plan_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });
    }
}
