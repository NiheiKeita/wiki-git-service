<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PullRequestComment extends Model
{
  use HasFactory;

  protected $fillable = [
    'pull_request_id',
    'user_id',
    'content',
    'line_number',
    'line_content',
    'article_slug',
    'parent_id',
  ];

  protected $casts = [
    'line_number' => 'integer',
  ];

  public function pullRequest(): BelongsTo
  {
    return $this->belongsTo(PullRequest::class);
  }

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  public function parent(): BelongsTo
  {
    return $this->belongsTo(PullRequestComment::class, 'parent_id');
  }

  public function replies(): HasMany
  {
    return $this->hasMany(PullRequestComment::class, 'parent_id')->orderBy('created_at');
  }

  public function scopeTopLevel($query)
  {
    return $query->whereNull('parent_id');
  }
}
