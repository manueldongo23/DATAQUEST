<?php

namespace Database\Seeders;

use App\Models\Quest;
use App\Models\Achievement;
use Illuminate\Database\Seeder;

class QuestAndAchievementSeeder extends Seeder
{
    public function run(): void
    {
        $this->createQuests();
        $this->createAchievements();
    }

    private function createQuests(): void
    {
        $quests = [
            [
                'title' => 'Primera Forma Normal - Básico',
                'description' => 'Identifica atributos multivaluados y aplica 1FN a un esquema simple de estudiantes.',
                'quest_type' => 'puzzle',
                'difficulty' => 1,
                'xp_reward' => 50,
                'nf_requirement' => '1FN',
                'initial_schema_json' => [
                    'tablas' => [
                        ['nombre' => 'Estudiantes', 'atributos' => ['id_estudiante', 'nombre', 'telefonos', 'cursos']],
                    ],
                    'dependencias' => ['id_estudiante -> nombre', 'id_estudiante -> telefonos', 'id_estudiante -> cursos'],
                ],
                'expected_solution_json' => [
                    'tablas_normalizadas' => [
                        ['nombre' => 'Estudiantes', 'atributos' => ['id_estudiante', 'nombre']],
                        ['nombre' => 'TelefonosEstudiante', 'atributos' => ['id_estudiante', 'telefono']],
                        ['nombre' => 'CursosEstudiante', 'atributos' => ['id_estudiante', 'curso']],
                    ],
                ],
            ],
            [
                'title' => 'Segunda Forma Normal - Intermedio',
                'description' => 'Elimina dependencias parciales en un esquema con clave compuesta.',
                'quest_type' => 'puzzle',
                'difficulty' => 2,
                'xp_reward' => 80,
                'nf_requirement' => '2FN',
                'initial_schema_json' => [
                    'tablas' => [
                        ['nombre' => 'Matriculas', 'atributos' => ['id_estudiante', 'id_curso', 'nombre_estudiante', 'nombre_curso', 'nota']],
                    ],
                    'dependencias' => ['id_estudiante, id_curso -> nota', 'id_estudiante -> nombre_estudiante', 'id_curso -> nombre_curso'],
                ],
                'expected_solution_json' => [
                    'tablas_normalizadas' => [
                        ['nombre' => 'Estudiantes', 'atributos' => ['id_estudiante', 'nombre_estudiante']],
                        ['nombre' => 'Cursos', 'atributos' => ['id_curso', 'nombre_curso']],
                        ['nombre' => 'Matriculas', 'atributos' => ['id_estudiante', 'id_curso', 'nota']],
                    ],
                ],
            ],
            [
                'title' => 'Tercera Forma Normal - Avanzado',
                'description' => 'Elimina dependencias transitivas en un esquema de pedidos.',
                'quest_type' => 'puzzle',
                'difficulty' => 3,
                'xp_reward' => 120,
                'nf_requirement' => '3FN',
                'initial_schema_json' => [
                    'tablas' => [
                        ['nombre' => 'Pedidos', 'atributos' => ['id_pedido', 'id_cliente', 'nombre_cliente', 'ciudad_cliente', 'total']],
                    ],
                    'dependencias' => ['id_pedido -> id_cliente, total', 'id_cliente -> nombre_cliente, ciudad_cliente'],
                ],
                'expected_solution_json' => [
                    'tablas_normalizadas' => [
                        ['nombre' => 'Clientes', 'atributos' => ['id_cliente', 'nombre_cliente', 'ciudad_cliente']],
                        ['nombre' => 'Pedidos', 'atributos' => ['id_pedido', 'id_cliente', 'total']],
                    ],
                ],
            ],
            [
                'title' => 'BCNF - Experto',
                'description' => 'Aplica BCNF resolviendo una situación donde 3FN no es suficiente.',
                'quest_type' => 'puzzle',
                'difficulty' => 4,
                'xp_reward' => 180,
                'nf_requirement' => 'BCNF',
                'initial_schema_json' => [
                    'tablas' => [
                        ['nombre' => 'Asignaciones', 'atributos' => ['id_profesor', 'id_curso', 'id_aula', 'horario']],
                    ],
                    'dependencias' => ['id_profesor, id_curso -> id_aula', 'id_aula -> id_profesor'],
                ],
                'expected_solution_json' => [
                    'tablas_normalizadas' => [
                        ['nombre' => 'Aulas', 'atributos' => ['id_aula', 'id_profesor']],
                        ['nombre' => 'Horarios', 'atributos' => ['id_profesor', 'id_curso', 'horario']],
                    ],
                ],
            ],
            [
                'title' => 'Desafío Final - Todas las NFs',
                'description' => 'Aplica 1FN, 2FN, 3FN y BCNF a un esquema complejo de hospital.',
                'quest_type' => 'examen',
                'difficulty' => 5,
                'xp_reward' => 300,
                'nf_requirement' => null,
                'initial_schema_json' => [
                    'tablas' => [
                        ['nombre' => 'Hospital', 'atributos' => ['id_doctor', 'nombre_doctor', 'id_paciente', 'nombre_paciente', 'telefonos', 'id_habitacion', 'tipo_habitacion', 'fecha_ingreso', 'diagnostico']],
                    ],
                    'dependencias' => ['id_doctor -> nombre_doctor', 'id_paciente -> nombre_paciente, telefonos', 'id_habitacion -> tipo_habitacion', 'id_doctor, id_paciente, fecha_ingreso -> diagnostico, id_habitacion'],
                ],
                'expected_solution_json' => [
                    'tablas_normalizadas' => [
                        ['nombre' => 'Doctores', 'atributos' => ['id_doctor', 'nombre_doctor']],
                        ['nombre' => 'Pacientes', 'atributos' => ['id_paciente', 'nombre_paciente', 'telefono']],
                        ['nombre' => 'Habitaciones', 'atributos' => ['id_habitacion', 'tipo_habitacion']],
                        ['nombre' => 'Ingresos', 'atributos' => ['id_doctor', 'id_paciente', 'fecha_ingreso', 'diagnostico', 'id_habitacion']],
                    ],
                ],
            ],
        ];

        foreach ($quests as $quest) {
            Quest::firstOrCreate(
                ['title' => $quest['title']],
                $quest
            );
        }
    }

    private function createAchievements(): void
    {
        $achievements = [
            [
                'name' => 'Primer Paso',
                'description' => 'Completa tu primera quest.',
                'icon' => 'first-step',
                'xp_reward' => 50,
                'criteria_type' => 'quests_completed',
                'criteria_value' => 1,
            ],
            [
                'name' => 'Domador de 2FN',
                'description' => 'Completa todas las quests de 2FN.',
                'icon' => '2fn-master',
                'xp_reward' => 100,
                'criteria_type' => 'nf_mastery',
                'criteria_value' => 2,
            ],
            [
                'name' => 'Maestro 3FN',
                'description' => 'Domina la Tercera Forma Normal completando todas las quests de 3FN.',
                'icon' => '3fn-master',
                'xp_reward' => 150,
                'criteria_type' => 'nf_mastery',
                'criteria_value' => 3,
            ],
            [
                'name' => 'Gurú BCNF',
                'description' => 'Demuestra maestría en BCNF superando todas las quests de BCNF.',
                'icon' => 'bcnf-master',
                'xp_reward' => 200,
                'criteria_type' => 'nf_mastery',
                'criteria_value' => 4,
            ],
            [
                'name' => 'Coleccionista',
                'description' => 'Completa 5 quests en total.',
                'icon' => 'collector',
                'xp_reward' => 100,
                'criteria_type' => 'quests_completed',
                'criteria_value' => 5,
            ],
            [
                'name' => 'Velocista',
                'description' => 'Acumula 500 puntos de XP.',
                'icon' => 'sprinter',
                'xp_reward' => 150,
                'criteria_type' => 'total_xp',
                'criteria_value' => 500,
            ],
            [
                'name' => 'Perfecto',
                'description' => 'Obtén una puntuación perfecta (100) en cualquier quest.',
                'icon' => 'perfect',
                'xp_reward' => 200,
                'criteria_type' => 'perfect_score',
                'criteria_value' => 1,
            ],
            [
                'name' => 'Legendario',
                'description' => 'Alcanza 1000 puntos de XP totales.',
                'icon' => 'legendary',
                'xp_reward' => 500,
                'criteria_type' => 'total_xp',
                'criteria_value' => 1000,
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::firstOrCreate(
                ['name' => $achievement['name']],
                $achievement
            );
        }
    }
}
