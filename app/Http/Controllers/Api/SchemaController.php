<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Esquema;
use App\Models\Validacion;
use Illuminate\Http\Request;

class SchemaController extends Controller
{
    public function index(Request $request)
    {
        $schemas = Esquema::where('user_id', $request->user()->id)
            ->with('validaciones')
            ->orderBy('fecha_creacion', 'desc')
            ->get()
            ->map(function ($esquema) {
                return [
                    'id' => $esquema->id,
                    'nombre' => $esquema->nombre,
                    'fecha_creacion' => $esquema->fecha_creacion,
                    'ultima_validacion' => $esquema->validaciones->last()?->nivel_normalizacion,
                ];
            });

        return response()->json(['success' => true, 'data' => $schemas]);
    }

    public function show(int $id)
    {
        $esquema = Esquema::with('validaciones')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $esquema]);
    }

    public function destroy(int $id, Request $request)
    {
        $esquema = Esquema::where('user_id', $request->user()->id)->findOrFail($id);
        $esquema->delete();
        return response()->json(['success' => true, 'message' => 'Esquema eliminado']);
    }
}
