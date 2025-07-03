<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attachment extends Model
{
  use HasFactory;

  protected $fillable = [
    'repository_id',
    'user_id',
    'filename',
    'original_filename',
    'mime_type',
    'file_size',
    'file_path',
  ];

  protected $casts = [
    'file_size' => 'integer',
  ];

  public function repository(): BelongsTo
  {
    return $this->belongsTo(Repository::class);
  }

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  public function getUrlAttribute(): string
  {
    return asset('storage/' . $this->file_path);
  }

  public function getFormattedFileSizeAttribute(): string
  {
    $units = ['B', 'KB', 'MB', 'GB'];
    $size = $this->file_size;
    $unit = 0;

    while ($size >= 1024 && $unit < count($units) - 1) {
      $size /= 1024;
      $unit++;
    }

    return round($size, 2) . ' ' . $units[$unit];
  }
}
