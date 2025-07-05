<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Repository extends Model
{
  use HasFactory;

  protected $fillable = [
    'name',
    'description',
    'slug',
    'is_public',
    'owner_id',
  ];

  protected $casts = [
    'is_public' => 'boolean',
  ];

  public function owner(): BelongsTo
  {
    return $this->belongsTo(User::class, 'owner_id');
  }

  public function users(): BelongsToMany
  {
    return $this->belongsToMany(User::class, 'repository_users')
      ->withPivot('role')
      ->withTimestamps();
  }

  public function branches(): HasMany
  {
    return $this->hasMany(Branch::class);
  }

  public function articles(): HasMany
  {
    return $this->hasMany(Article::class);
  }

  public function commits(): HasMany
  {
    return $this->hasMany(Commit::class);
  }

  public function pullRequests(): HasMany
  {
    return $this->hasMany(PullRequest::class);
  }

  public function attachments(): HasMany
  {
    return $this->hasMany(Attachment::class);
  }

  public function mainBranch(): BelongsTo
  {
    return $this->belongsTo(Branch::class)->where('is_main', true);
  }

  public function hasUserAccess(User $user, string $role = 'viewer'): bool
  {
    if ($this->owner_id === $user->id) {
      return true;
    }

    $userRole = $this->users()->where('user_id', $user->id)->first()?->pivot->role;

    if (!$userRole) {
      return false;
    }

    $roleHierarchy = [
      'owner' => 3,
      'editor' => 2,
      'viewer' => 1,
    ];

    return $roleHierarchy[$userRole] >= $roleHierarchy[$role];
  }
}
