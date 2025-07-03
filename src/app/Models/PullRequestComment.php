<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PullRequestComment extends Model
{
  use HasFactory;

  protected $fillable = [
    'pull_request_id',
    'user_id',
    'content',
    'line_number',
    'line_content',
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
}
