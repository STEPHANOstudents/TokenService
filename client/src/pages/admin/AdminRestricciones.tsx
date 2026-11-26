import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import {
  ApiError,
  actualizarRestriccion,
  crearRestriccion,
  eliminarRestriccion,
  listarRestricciones,
} from '../../services/api';
import type { ReglaRestriccionItem } from '../../services/api';

export function AdminRestricciones() {
  const [reglas, setReglas] = useState<ReglaRestriccionItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [creando, setCreando] = useState(false);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargarReglas = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await listarRestricciones();
      setReglas(data);
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudieron cargar las reglas de restricción.'
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarReglas();
  }, [cargarReglas]);

  const handleCrear = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const texto = nuevaDescripcion.trim();
    if (!texto) {
      setError('Escribe la descripción de la regla antes de agregarla.');
      return;
    }

    setCreando(true);
    setError(null);
    setExito(null);

    try {
      const creada = await crearRestriccion(texto, true);
      setReglas((prev) => [creada, ...prev]);
      setNuevaDescripcion('');
      setExito('Nueva regla agregada y activada inmediatamente para el chat IA.');
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo crear la regla de restricción.'
      );
    } finally {
      setCreando(false);
    }
  };

  const handleToggleActiva = async (
    regla: ReglaRestriccionItem
  ): Promise<void> => {
    setProcesandoId(regla.id);
    setError(null);
    setExito(null);

    try {
      const actualizada = await actualizarRestriccion(regla.id, {
        activa: !regla.activa,
      });
      setReglas((prev) =>
        prev.map((r) => (r.id === actualizada.id ? actualizada : r))
      );
      setExito(
        actualizada.activa
          ? 'Regla activada. Ya aplica en el próximo mensaje del chatbot.'
          : 'Regla pausada temporalmente.'
      );
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo actualizar el estado de la regla.'
      );
    } finally {
      setProcesandoId(null);
    }
  };

  const handleEliminar = async (regla: ReglaRestriccionItem): Promise<void> => {
    const ok = window.confirm('¿Eliminar esta regla de restricción?');
    if (!ok) return;

    setProcesandoId(regla.id);
    setError(null);
    setExito(null);

    try {
      await eliminarRestriccion(regla.id);
      setReglas((prev) => prev.filter((r) => r.id !== regla.id));
      setExito('Regla eliminada correctamente.');
    } catch (err: unknown) {
      setError(
        err instanceof ApiError ? err.message : 'No se pudo eliminar la regla.'
      );
    } finally {
      setProcesandoId(null);
    }
  };

  const totalActivas = reglas.filter((r) => r.activa).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Restricciones y Guardrails IA
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Controla en tiempo real los límites de comportamiento del asistente
            virtual. Las reglas activas se inyectan dinámicamente en cada
            consulta.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-sand border border-goldBorder text-xs font-semibold text-brand-bronze shrink-0">
          <Sparkles className="w-4 h-4 text-amber-600" />
          {totalActivas} de {reglas.length} reglas activas
        </div>
      </div>

      {/* Formulario rápido superior */}
      <form
        onSubmit={handleCrear}
        className="bg-white rounded-3xl border border-goldBorder shadow-sm p-5 sm:p-6 space-y-3"
      >
        <label
          htmlFor="nueva-regla"
          className="block text-sm font-bold text-stone-900"
        >
          Añadir nueva regla de restricción
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="nueva-regla"
            type="text"
            value={nuevaDescripcion}
            onChange={(e) => setNuevaDescripcion(e.target.value)}
            placeholder="Ej. No mencionar precios numéricos; derivar siempre a /cotizar."
            className="flex-1 px-4 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={creando || !nuevaDescripcion.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 shadow-sm shrink-0"
          >
            {creando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Agregar Regla
          </button>
        </div>
      </form>

      {/* Alertas */}
      {exito && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{exito}</span>
          </div>
          <button type="button" onClick={() => setExito(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Lista de reglas */}
      <div className="bg-white rounded-3xl border border-goldBorder shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-stone-500">
            <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
            <p className="text-sm">Cargando reglas de restricción...</p>
          </div>
        ) : reglas.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
            <p className="text-base font-semibold text-stone-800">
              No hay reglas registradas
            </p>
            <p className="text-sm text-stone-500">
              Agrega tu primera restricción arriba para controlar al asistente.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-goldBorder/70">
            {reglas.map((regla) => (
              <li
                key={regla.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-ivory/60 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      regla.activa
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-stone-100 text-stone-400 border-stone-200'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium leading-relaxed ${
                        regla.activa
                          ? 'text-stone-900'
                          : 'text-stone-400 line-through'
                      }`}
                    >
                      {regla.descripcion}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Estado:{' '}
                      <span
                        className={
                          regla.activa
                            ? 'text-emerald-700 font-semibold'
                            : 'text-stone-500'
                        }
                      >
                        {regla.activa ? 'Activa en tiempo real' : 'Inactiva'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={regla.activa}
                    disabled={procesandoId === regla.id}
                    onClick={() => void handleToggleActiva(regla)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center disabled:opacity-50 ${
                      regla.activa
                        ? 'bg-emerald-500 justify-end'
                        : 'bg-stone-300 justify-start'
                    }`}
                    title={regla.activa ? 'Desactivar regla' : 'Activar regla'}
                  >
                    <span className="w-5 h-5 rounded-full bg-white shadow" />
                  </button>

                  <button
                    type="button"
                    disabled={procesandoId === regla.id}
                    onClick={() => void handleEliminar(regla)}
                    className="p-2 rounded-xl text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Eliminar regla"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
