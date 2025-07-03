<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
  use HasFactory;

  protected $fillable = [
    'repository_id',
    'name',
    'parent_branch_id',
    'is_main',
  ];

  protected $casts = [
    'is_main' => 'boolean',
  ];

  public function repository(): BelongsTo
  {
    return $this->belongsTo(Repository::class);
  }

  public function parentBranch(): BelongsTo
  {
    return $this->belongsTo(Branch::class, 'parent_branch_id');
  }

  public function childBranches(): HasMany
  {
    return $this->hasMany(Branch::class, 'parent_branch_id');
  }

  public function articles(): HasMany
  {
    return $this->hasMany(Article::class);
  }

  public function commits(): HasMany
  {
    return $this->hasMany(Commit::class);
  }

  public function sourcePullRequests(): HasMany
  {
    return $this->hasMany(PullRequest::class, 'source_branch_id');
  }

  public function targetPullRequests(): HasMany
  {
    return $this->hasMany(PullRequest::class, 'target_branch_id');
  }
}
