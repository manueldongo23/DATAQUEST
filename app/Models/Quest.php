<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quest extends Model
{
    const TYPE_PUZZLE = 'puzzle';
    const TYPE_RETO = 'reto';
    const TYPE_EXAMEN = 'examen';

    protected $fillable = [
        'title',
        'description',
        'quest_type',
        'difficulty',
        'xp_reward',
        'nf_requirement',
        'initial_schema_json',
        'expected_solution_json',
        'is_active',
    ];

    protected $casts = [
        'initial_schema_json' => 'array',
        'expected_solution_json' => 'array',
        'is_active' => 'boolean',
        'difficulty' => 'integer',
        'xp_reward' => 'integer',
    ];

    public function attempts()
    {
        return $this->hasMany(QuestAttempt::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('quest_type', $type);
    }
}
