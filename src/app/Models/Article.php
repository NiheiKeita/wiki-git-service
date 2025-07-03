<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Article extends Model
{
  use HasFactory;

  protected $fillable = [
    'repository_id',
    'branch_id',
    'title',
    'content',
    'slug',
    'tags',
    'is_published',
  ];

  protected $casts = [
    'tags' => 'array',
    'is_published' => 'boolean',
  ];

  public function repository(): BelongsTo
  {
    return $this->belongsTo(Repository::class);
  }

  public function branch(): BelongsTo
  {
    return $this->belongsTo(Branch::class);
  }

  public function commits(): HasMany
  {
    return $this->hasMany(Commit::class);
  }

  public function pullRequests(): HasMany
  {
    return $this->hasMany(PullRequest::class);
  }

  public function latestCommit(): BelongsTo
  {
    return $this->belongsTo(Commit::class)->latest();
  }

  public function scopePublished($query)
  {
    return $query->where('is_published', true);
  }

  public function scopeInMainBranch($query)
  {
    return $query->whereHas('branch', function ($q) {
      $q->where('is_main', true);
    });
  }
}
