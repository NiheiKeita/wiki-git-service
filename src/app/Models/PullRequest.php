<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PullRequest extends Model
{
  use HasFactory;

  protected $fillable = [
    'repository_id',
    'source_branch_id',
    'target_branch_id',
    'article_id',
    'author_id',
    'title',
    'description',
    'status',
    'merged_by',
    'merged_at',
  ];

  protected $casts = [
    'merged_at' => 'datetime',
  ];

  public function repository(): BelongsTo
  {
    return $this->belongsTo(Repository::class);
  }

  public function sourceBranch(): BelongsTo
  {
    return $this->belongsTo(Branch::class, 'source_branch_id');
  }

  public function targetBranch(): BelongsTo
  {
    return $this->belongsTo(Branch::class, 'target_branch_id');
  }

  public function article(): BelongsTo
  {
    return $this->belongsTo(Article::class);
  }

  public function author(): BelongsTo
  {
    return $this->belongsTo(User::class, 'author_id');
  }

  public function mergedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'merged_by');
  }

  public function comments(): HasMany
  {
    return $this->hasMany(PullRequestComment::class);
  }

  public function scopeOpen($query)
  {
    return $query->where('status', 'open');
  }

  public function scopeMerged($query)
  {
    return $query->where('status', 'merged');
  }

  public function scopeClosed($query)
  {
    return $query->where('status', 'closed');
  }
}
