<?php
namespace App\Http\Controllers\Api;

use App\Domain\Services\NormalizationEngine;
use App\Domain\Services\ClosureExplainerService;
use App\Domain\Services\CsvImportService;
use App\Domain\Services\SqlDdlParserService;
use App\Domain\Entities\RelationSchema;
use App\Domain\Entities\FunctionalDependency;
use App\Application\UseCases\ValidateSchemaUseCase;
use App\Domain\Services\GamificationService;
use App\Models\Esquema;
use App\Models\Validacion;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class NormalizationController extends Controller
{
    public function __construct(
        private NormalizationEngine $engine,
        private ValidateSchemaUseCase $validateSchemaUseCase,
        private GamificationService $gamificationService,
        private ClosureExplainerService $closureExplainer,
        private CsvImportService $csvImportService,
        private SqlDdlParserService $ddlParser
    ) {}

    public function validateSchema(Request $request)
    {
        $validated = $request->validate([
            'table_name' => 'required|string|max:100',
            'attributes' => 'required|array|min:1|max:100',
            'dependencies' => 'required|array|max:200'
        ]);

        try {
            // Construir entidades del dominio
            $fds = array_map(
                fn($dep) => new FunctionalDependency($dep['determinant'], $dep['dependent']),
                $validated['dependencies']
            );
            
            $schema = new RelationSchema(
                $validated['table_name'],
                $validated['attributes'],
                $fds
            );

            // Ejecutar use case
            $result = $this->validateSchemaUseCase->execute($schema);
            
            $gamificationData = null;
            $user = null;
            $user = $request->user();

            if ($user) {
                // Persistencia analítica
                $dbEsquema = Esquema::create([
                    'user_id' => $user->id,
                    'nombre' => $validated['table_name'],
                    'estructura_json' => $validated['attributes'],
                    'dependencias_json' => $validated['dependencies']
                ]);

                Validacion::create([
                    'esquema_id' => $dbEsquema->id,
                    'nivel_normalizacion' => $result->currentNf,
                    'violaciones_json' => $result->violations
                ]);

                // Gamificación: asignar xp si es una validación libre (puedes ajustar lógica si es por puzzle)
                // Se determinan los conceptos afectados por la validación
                $conceptosAfectados = [];
                if ($result->currentNf === '1NF' || $result->currentNf === '1FN') $conceptosAfectados = ['1FN'];
                if ($result->currentNf === '2NF' || $result->currentNf === '2FN') $conceptosAfectados = ['1FN', '2FN'];
                if ($result->currentNf === '3NF' || $result->currentNf === '3FN') $conceptosAfectados = ['1FN', '2FN', '3FN'];
                if ($result->currentNf === 'BCNF') $conceptosAfectados = ['1FN', '2FN', '3FN', 'BCNF'];

                $gamificationData = $this->gamificationService->awardXP($user, 10, $conceptosAfectados);
            }
            
            return response()->json([
                'success' => true,
                'data' => $result,
                'gamification' => $gamificationData
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el esquema. Verifica los datos ingresados.'
            ], 422);
        }
    }

    /**
     * Explain step-by-step closure calculation (X+)
     * Educational endpoint to show students how the algorithm works
     */
    public function explainClosure(Request $request)
    {
        $validated = $request->validate([
            'attributes' => 'required|array|min:1|max:50',
            'dependencies' => 'required|array|max:100'
        ]);

        try {
            // Convert dependencies to FunctionalDependency objects
            $fds = array_map(
                fn($dep) => new FunctionalDependency($dep['determinant'], $dep['dependent']),
                $validated['dependencies']
            );

            // Get closure explanation
            $explanation = $this->closureExplainer->explainClosure(
                $validated['attributes'],
                $fds
            );

            return response()->json([
                'success' => true,
                'data' => $explanation,
                'message' => 'Explicación del cierre calculada exitosamente'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al explicar el cierre. Verifica los datos ingresados.'
            ], 422);
        }
    }

    /**
     * Explain candidate key discovery process
     */
    public function explainCandidateKeys(Request $request)
    {
        $validated = $request->validate([
            'attributes' => 'required|array|min:1|max:50',
            'dependencies' => 'required|array|max:100'
        ]);

        try {
            $fds = array_map(
                fn($dep) => new FunctionalDependency($dep['determinant'], $dep['dependent']),
                $validated['dependencies']
            );

            $explanation = $this->closureExplainer->explainCandidateKeys(
                $validated['attributes'],
                $fds
            );

            return response()->json([
                'success' => true,
                'data' => $explanation,
                'message' => 'Claves candidatas explicadas exitosamente'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al explicar claves candidatas. Verifica los datos ingresados.'
            ], 422);
        }
    }

    /**
     * Explain 3NF decomposition strategy
     */
    public function exportValidation(Request $request)
    {
        $validated = $request->validate([
            'table_name' => 'required|string|max:100',
            'attributes' => 'required|array|min:1|max:100',
            'dependencies' => 'required|array|max:200',
        ]);

        try {
            $fds = array_map(
                fn($dep) => new \App\Domain\Entities\FunctionalDependency($dep['determinant'], $dep['dependent']),
                $validated['dependencies']
            );

            $schema = new \App\Domain\Entities\RelationSchema(
                $validated['table_name'],
                $validated['attributes'],
                $fds
            );

            $result = $this->validateSchemaUseCase->execute($schema);

            return response()->json([
                'success' => true,
                'data' => $result,
                'export' => [
                    'format' => 'json',
                    'filename' => 'normalization_export_' . date('Y-m-d') . '.json'
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar el diagnóstico'
            ], 422);
        }
    }

    public function explainDecomposition(Request $request)
    {
        $validated = $request->validate([
            'attributes' => 'required|array|min:1|max:50',
            'dependencies' => 'required|array|max:100'
        ]);

        try {
            $fds = array_map(
                fn($dep) => new FunctionalDependency($dep['determinant'], $dep['dependent']),
                $validated['dependencies']
            );

            $explanation = $this->closureExplainer->explainDecomposition(
                $validated['attributes'],
                $fds
            );

            return response()->json([
                'success' => true,
                'data' => $explanation,
                'message' => 'Estrategia de descomposición explicada exitosamente'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al explicar la descomposición. Verifica los datos ingresados.'
            ], 422);
        }
    }

    public function importCsv(Request $request)
    {
        $validated = $request->validate([
            'csv' => 'required_without:csv_file|string',
            'csv_file' => 'required_without:csv|file|mimes:csv,txt|max:1024',
            'table_name' => 'nullable|string|max:100',
            'has_header' => 'nullable|boolean',
            'delimiter' => 'nullable|string|in:,,;,,\t,|',
        ]);

        try {
            $csvContent = $validated['csv'] ?? file_get_contents($request->file('csv_file')->getRealPath());

            if (strlen($csvContent) > 1048576) {
                return response()->json([
                    'success' => false,
                    'message' => 'El CSV excede el tamaño máximo de 1MB.'
                ], 422);
            }

            $result = $this->csvImportService->import(
                $csvContent,
                $validated['table_name'] ?? null,
                $validated['has_header'] ?? true,
                $validated['delimiter'] ?? null
            );

            if ($result['row_count'] === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'El CSV está vacío o no contiene datos válidos.'
                ], 422);
            }

            $columnInfo = [];
            foreach ($result['columns'] as $col) {
                $entry = [
                    'name' => $col['name'],
                    'type' => $col['type'],
                    'nullable' => false,
                ];
                if (!empty($col['sample_values'])) {
                    $entry['sample'] = $col['sample_values'];
                }
                $columnInfo[] = $entry;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'table_name' => $result['table_name'],
                    'columns' => $columnInfo,
                    'discovered_fds' => $result['discovered_fds'],
                    'row_count' => $result['row_count'],
                    'attribute_count' => count($result['columns']),
                    'message' => sprintf(
                        'Se importaron %d filas y se descubrieron %d dependencias funcionales.',
                        $result['row_count'],
                        count($result['discovered_fds'])
                    ),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al importar CSV: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function parseDdl(Request $request)
    {
        $validated = $request->validate([
            'sql' => 'required|string',
        ]);

        try {
            $result = $this->ddlParser->parse($validated['sql']);

            return response()->json([
                'success' => true,
                'data' => [
                    'table_name' => $result['schema']->name,
                    'columns' => $result['raw_columns'],
                    'functional_dependencies' => [
                        'from_pk' => array_map(fn($fd) => $fd->toArray(), $result['fds_from_pk']),
                        'from_unique' => array_map(fn($fd) => $fd->toArray(), $result['fds_from_unique']),
                    ],
                    'foreign_keys' => $result['fks'],
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al analizar SQL: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function parseDdlAdvanced(Request $request)
    {
        $validated = $request->validate([
            'sql' => 'required|string',
            'mode' => 'nullable|string|in:single,multiple,validate',
        ]);

        try {
            $mode = $validated['mode'] ?? 'single';

            if ($mode === 'validate') {
                $validation = $this->ddlParser->validateSql($validated['sql']);
                return response()->json([
                    'success' => true,
                    'data' => $validation,
                ]);
            }

            if ($mode === 'multiple') {
                $results = $this->ddlParser->parseMultiple($validated['sql']);
                return response()->json([
                    'success' => true,
                    'data' => $results,
                ]);
            }

            $result = $this->ddlParser->parse($validated['sql']);
            return response()->json([
                'success' => true,
                'data' => [
                    'type' => 'CREATE_TABLE',
                    'data' => $result,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al analizar SQL: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function importCsvAndValidate(Request $request)
    {
        $validated = $request->validate([
            'csv' => 'required_without:csv_file|string',
            'csv_file' => 'required_without:csv|file|mimes:csv,txt|max:1024',
            'table_name' => 'nullable|string|max:100',
            'has_header' => 'nullable|boolean',
            'delimiter' => 'nullable|string|in:,,;,,\t,|',
        ]);

        try {
            $csvContent = $validated['csv'] ?? file_get_contents($request->file('csv_file')->getRealPath());

            if (strlen($csvContent) > 1048576) {
                return response()->json([
                    'success' => false,
                    'message' => 'El CSV excede el tamaño máximo de 1MB.'
                ], 422);
            }

            $result = $this->csvImportService->import(
                $csvContent,
                $validated['table_name'] ?? null,
                $validated['has_header'] ?? true,
                $validated['delimiter'] ?? null
            );

            if ($result['row_count'] === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'El CSV está vacío o no contiene datos válidos.'
                ], 422);
            }

            $diagnosis = $this->engine->diagnoseNormalization($result['schema']);
            $candidateKeys = $this->engine->findCandidateKeys($result['schema']);

            $columnInfo = [];
            foreach ($result['columns'] as $col) {
                $entry = [
                    'name' => $col['name'],
                    'type' => $col['type'],
                    'nullable' => false,
                ];
                if (!empty($col['sample_values'])) {
                    $entry['sample'] = $col['sample_values'];
                }
                $columnInfo[] = $entry;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'table_name' => $result['table_name'],
                    'columns' => $columnInfo,
                    'discovered_fds' => $result['discovered_fds'],
                    'row_count' => $result['row_count'],
                    'attribute_count' => count($result['columns']),
                    'candidate_keys' => $candidateKeys,
                    'normalization' => $diagnosis,
                    'message' => sprintf(
                        'Se importaron %d filas, se descubrieron %d dependencias funcionales. Nivel actual: %s.',
                        $result['row_count'],
                        count($result['discovered_fds']),
                        $diagnosis['current_nf']
                    ),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al importar y validar CSV: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function importFromDatabase(Request $request)
    {
        $validated = $request->validate([
            'driver' => 'required|string|in:pgsql,mysql',
            'host' => 'required|string',
            'port' => 'required|integer|min:1|max:65535',
            'database' => 'required|string',
            'username' => 'required|string',
            'password' => 'required|string',
            'schema' => 'nullable|string|max:100',
        ]);

        $schema = $validated['schema'] ?? 'public';

        try {
            $result = $this->databaseMetadataService->importFromDsn(
                $validated['driver'],
                $validated['host'],
                (int) $validated['port'],
                $validated['database'],
                $validated['username'],
                $validated['password'],
                $schema
            );

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al importar la base de datos: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function testDatabaseConnection(Request $request)
    {
        $validated = $request->validate([
            'driver' => 'required|string|in:pgsql,mysql',
            'host' => 'required|string',
            'port' => 'required|integer|min:1|max:65535',
            'database' => 'required|string',
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        try {
            $result = $this->databaseMetadataService->testConnection(
                $validated['driver'],
                $validated['host'],
                (int) $validated['port'],
                $validated['database'],
                $validated['username'],
                $validated['password']
            );

            return response()->json($result);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function importFromAppDatabase(Request $request)
    {
        $schema = $request->input('schema', 'public');

        try {
            $result = $this->databaseMetadataService->importFromConnection(
                config('database.default'),
                $schema
            );

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al importar desde la base de datos: ' . $e->getMessage(),
            ], 422);
        }
    }
}
