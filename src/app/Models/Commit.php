<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Commit extends Model
{
  use HasFactory;

  protected $fillable = [
    'repository_id',
    'branch_id',
    'article_id',
    'user_id',
    'hash',
    'message',
    'content_before',
    'content_after',
    'changes',
  ];

  protected $casts = [
    'changes' => 'array',
  ];

  public function repository(): BelongsTo
  {
    return $this->belongsTo(Repository::class);
  }

  public function branch(): BelongsTo
  {
    return $this->belongsTo(Branch::class);
  }

  public function article(): BelongsTo
  {
    return $this->belongsTo(Article::class);
  }

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  public static function generateHash(): string
  {
    return substr(md5(uniqid() . time()), 0, 8);
  }
}
