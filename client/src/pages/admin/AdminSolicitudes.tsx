import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Inbox,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Headphones,
  FileText,
  Mail,
  Phone,
  Building2,
} from 'lucide-react';
import {
  ApiError,
  actualizarEstadoSolicitud,
  listarSolicitudes,
} from '../../services/api';
import type {
  EstadoSolicitud,
  SolicitudContacto,
  TipoSolicitud,
} from '../../services/api';

type FiltroTipo = 'TODOS' | TipoSolicitud;

const ESTADOS: Array<{ value: EstadoSolicitud; label: string }> = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'RESUELTO', label: 'Resuelto' },
];

function estiloEstado(estado: EstadoSolicitud): string {
  switch (estado) {
    case 'RESUELTO':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'EN_PROCESO':
      return 'bg-amber-50 text-brand-bronze border-amber-300';
    default:
      return 'bg-stone-100 text-stone-700 border-stone-300';
  }
}

function formatearFecha(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AdminSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<SolicitudContacto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('TODOS');
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargarSolicitudes = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await listarSolicitudes();
      setSolicitudes(data);
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudieron cargar las solicitudes.'
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarSolicitudes();
  }, [cargarSolicitudes]);

  const filtradas = useMemo(() => {
    if (filtroTipo === 'TODOS') return solicitudes;
    return solicitudes.filter((s) => s.tipo === filtroTipo);
  }, [solicitudes, filtroTipo]);

  const conteos = useMemo(() => {
    return {
      todos: solicitudes.length,
      soporte: solicitudes.filter((s) => s.tipo === 'SOPORTE').length,
      cotizacion: solicitudes.filter((s) => s.tipo === 'COTIZACION').length,
    };
  }, [solicitudes]);

  const handleCambioEstado = async (
    id: number,
    nuevoEstado: EstadoSolicitud
  ): Promise<void> => {
    setActualizandoId(id);
    setError(null);
    setExito(null);

    try {
      const actualizada = await actualizarEstadoSolicitud(id, nuevoEstado);
      setSolicitudes((prev) =>
        prev.map((s) => (s.id === actualizada.id ? actualizada : s))
      );
      setExito(`Solicitud #${actualizada.id} actualizada a ${nuevoEstado}.`);
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo actualizar el estado de la solicitud.'
      );
    } finally {
      setActualizandoId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Tickets de Soporte y Cotizaciones
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Gestiona todas las solicitudes enviadas por los visitantes desde
            /soporte y /cotizar.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void cargarSolicitudes()}
          disabled={cargando}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-brand-bronze bg-sand hover:bg-amber-100 border border-goldBorder transition-colors disabled:opacity-60 shrink-0"
        >
          <RefreshCw
            className={`w-4 h-4 text-amber-600 ${cargando ? 'animate-spin' : ''}`}
          />
          Actualizar
        </button>
      </div>

      {/* Filtros por tipo */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: 'TODOS', label: `Todos (${conteos.todos})` },
            { key: 'SOPORTE', label: `Soporte (${conteos.soporte})` },
            { key: 'COTIZACION', label: `Cotización (${conteos.cotizacion})` },
          ] as Array<{ key: FiltroTipo; label: string }>
        ).map((tab) => {
          const activo = filtroTipo === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFiltroTipo(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                activo
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-stone-700 border-goldBorder hover:bg-sand'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

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

      {/* Tabla / Lista */}
      <div className="bg-white rounded-3xl border border-goldBorder shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-stone-500">
            <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
            <p className="text-sm">Cargando solicitudes...</p>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Inbox className="w-10 h-10 text-amber-400 mx-auto" />
            <p className="text-base font-semibold text-stone-800">
              No hay solicitudes en esta categoría
            </p>
            <p className="text-sm text-stone-500">
              Los tickets y cotizaciones registrados en la web pública aparecerán
              aquí en tiempo real.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-goldBorder/70">
            {filtradas.map((sol) => (
              <div
                key={sol.id}
                className="p-5 hover:bg-ivory/70 transition-colors flex flex-col lg:flex-row lg:items-start justify-between gap-5"
              >
                <div className="space-y-2.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-500">
                      #{sol.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        sol.tipo === 'SOPORTE'
                          ? 'bg-amber-50 text-brand-bronze border-amber-300'
                          : 'bg-sky-50 text-sky-800 border-sky-200'
                      }`}
                    >
                      {sol.tipo === 'SOPORTE' ? (
                        <Headphones className="w-3 h-3" />
                      ) : (
                        <FileText className="w-3 h-3" />
                      )}
                      {sol.tipo}
                    </span>
                    <span className="text-xs text-stone-400">
                      {formatearFecha(sol.creadoEn)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900">
                    {sol.asunto}
                  </h3>

                  <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                    {sol.mensaje}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 pt-1">
                    <span className="font-semibold text-stone-800">
                      {sol.nombre}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                      {sol.email}
                    </span>
                    {sol.telefono && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-amber-600" />
                        {sol.telefono}
                      </span>
                    )}
                    {sol.empresa && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-amber-600" />
                        {sol.empresa}
                      </span>
                    )}
                  </div>
                </div>

                {/* Selector de estado */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-2 shrink-0">
                  <label
                    htmlFor={`estado-sol-${sol.id}`}
                    className="text-[11px] font-semibold uppercase tracking-wider text-stone-500"
                  >
                    Estado
                  </label>
                  <select
                    id={`estado-sol-${sol.id}`}
                    disabled={actualizandoId === sol.id}
                    value={sol.estado}
                    onChange={(e) =>
                      void handleCambioEstado(
                        sol.id,
                        e.target.value as EstadoSolicitud
                      )
                    }
                    className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:opacity-60 ${estiloEstado(
                      sol.estado
                    )}`}
                  >
                    {ESTADOS.map((est) => (
                      <option key={est.value} value={est.value}>
                        {est.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
