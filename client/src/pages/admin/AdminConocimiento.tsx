import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Plus,
  Upload,
  Search,
  Globe,
  Lock,
  Pencil,
  Trash2,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
} from 'lucide-react';
import {
  ApiError,
  actualizarConocimiento,
  crearConocimientoManual,
  eliminarConocimiento,
  listarConocimiento,
  subirDocumentoConocimiento,
} from '../../services/api';
import type { ConocimientoItem, RutaPublica } from '../../services/api';

const CATEGORIAS = [
  'Servicios',
  'Planes',
  'Soporte',
  'Empresa',
  'Documento',
  'Confidencial',
] as const;

const RUTAS_OPCIONES: Array<{ value: '' | RutaPublica; label: string }> = [
  { value: '', label: 'Ninguna' },
  { value: '/', label: '/ — Inicio' },
  { value: '/servicios', label: '/servicios — Catálogo de servicios' },
  { value: '/planes', label: '/planes — Planes y SLA' },
  { value: '/soporte', label: '/soporte — Soporte y WhatsApp' },
  { value: '/cotizar', label: '/cotizar — Cotizaciones' },
];

interface ManualFormState {
  titulo: string;
  categoria: string;
  contenido: string;
  urlGuia: '' | RutaPublica;
  esPublico: boolean;
}

const MANUAL_INICIAL: ManualFormState = {
  titulo: '',
  categoria: 'Servicios',
  contenido: '',
  urlGuia: '',
  esPublico: true,
};

interface UploadFormState {
  archivo: File | null;
  titulo: string;
  categoria: string;
  urlGuia: '' | RutaPublica;
  esPublico: boolean;
}

const UPLOAD_INICIAL: UploadFormState = {
  archivo: null,
  titulo: '',
  categoria: 'Documento',
  urlGuia: '',
  esPublico: true,
};

export function AdminConocimiento() {
  const [registros, setRegistros] = useState<ConocimientoItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [alertaExito, setAlertaExito] = useState<string | null>(null);
  const [alertaError, setAlertaError] = useState<string | null>(null);

  // Modal manual (crear / editar)
  const [modalManualAbierto, setModalManualAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [manualForm, setManualForm] = useState<ManualFormState>(MANUAL_INICIAL);
  const [guardandoManual, setGuardandoManual] = useState(false);

  // Modal upload PDF/TXT
  const [modalUploadAbierto, setModalUploadAbierto] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadFormState>(UPLOAD_INICIAL);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);

  // Estados por fila
  const [alternandoId, setAlternandoId] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setAlertaError(null);
    try {
      const data = await listarConocimiento();
      setRegistros(data);
    } catch (err: unknown) {
      setAlertaError(
        err instanceof ApiError
          ? err.message
          : 'Error al cargar la base de conocimiento.'
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const resumen = useMemo(() => {
    const total = registros.length;
    const publicos = registros.filter((r) => r.esPublico).length;
    const confidenciales = total - publicos;
    return { total, publicos, confidenciales };
  }, [registros]);

  const registrosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return registros.filter((item) => {
      if (categoriaFiltro !== 'Todas' && item.categoria !== categoriaFiltro) {
        return false;
      }
      if (!q) return true;
      return (
        item.titulo.toLowerCase().includes(q) ||
        item.contenido.toLowerCase().includes(q) ||
        item.categoria.toLowerCase().includes(q)
      );
    });
  }, [registros, busqueda, categoriaFiltro]);

  const abrirModalNuevo = (): void => {
    setEditandoId(null);
    setManualForm(MANUAL_INICIAL);
    setAlertaError(null);
    setModalManualAbierto(true);
  };

  const abrirModalEditar = (item: ConocimientoItem): void => {
    setEditandoId(item.id);
    setManualForm({
      titulo: item.titulo,
      categoria: item.categoria,
      contenido: item.contenido,
      urlGuia: item.urlGuia ?? '',
      esPublico: item.esPublico,
    });
    setAlertaError(null);
    setModalManualAbierto(true);
  };

  const abrirModalUpload = (): void => {
    setUploadForm(UPLOAD_INICIAL);
    setAlertaError(null);
    setModalUploadAbierto(true);
  };

  const handleGuardarManual = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setAlertaError(null);
    setAlertaExito(null);

    if (!manualForm.titulo.trim() || !manualForm.contenido.trim()) {
      setAlertaError('Completa el título y el contenido del artículo.');
      return;
    }

    setGuardandoManual(true);
    try {
      const payload = {
        titulo: manualForm.titulo.trim(),
        categoria: manualForm.categoria,
        contenido: manualForm.contenido.trim(),
        urlGuia:
          manualForm.esPublico && manualForm.urlGuia
            ? manualForm.urlGuia
            : null,
        esPublico: manualForm.esPublico,
      };

      if (editandoId !== null) {
        const actualizado = await actualizarConocimiento(editandoId, payload);
        setRegistros((prev) =>
          prev.map((r) => (r.id === actualizado.id ? actualizado : r))
        );
        setAlertaExito(`Artículo "${actualizado.titulo}" actualizado.`);
      } else {
        const creado = await crearConocimientoManual(payload);
        setRegistros((prev) => [creado, ...prev]);
        setAlertaExito(`Artículo "${creado.titulo}" agregado a la base de conocimiento.`);
      }

      setModalManualAbierto(false);
    } catch (err: unknown) {
      setAlertaError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo guardar el artículo.'
      );
    } finally {
      setGuardandoManual(false);
    }
  };

  const handleSubirDocumento = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setAlertaError(null);
    setAlertaExito(null);

    if (!uploadForm.archivo) {
      setAlertaError('Selecciona un archivo .pdf o .txt para procesar.');
      return;
    }

    setSubiendoArchivo(true);
    try {
      const formData = new FormData();
      formData.append('archivo', uploadForm.archivo);
      if (uploadForm.titulo.trim()) {
        formData.append('titulo', uploadForm.titulo.trim());
      }
      formData.append('categoria', uploadForm.categoria);
      if (uploadForm.esPublico && uploadForm.urlGuia) {
        formData.append('urlGuia', uploadForm.urlGuia);
      }
      formData.append('esPublico', String(uploadForm.esPublico));

      const res = await subirDocumentoConocimiento(formData);
      setRegistros((prev) => [res.registro, ...prev]);
      setAlertaExito(
        `Documento "${res.registro.titulo}" procesado correctamente (${res.caracteresExtraidos.toLocaleString('es-PE')} caracteres extraídos).`
      );
      setModalUploadAbierto(false);
    } catch (err: unknown) {
      setAlertaError(
        err instanceof ApiError
          ? err.message
          : 'Error al procesar y subir el documento.'
      );
    } finally {
      setSubiendoArchivo(false);
    }
  };

  const handleTogglePublico = async (item: ConocimientoItem): Promise<void> => {
    setAlternandoId(item.id);
    setAlertaError(null);
    setAlertaExito(null);

    try {
      const actualizado = await actualizarConocimiento(item.id, {
        esPublico: !item.esPublico,
      });
      setRegistros((prev) =>
        prev.map((r) => (r.id === actualizado.id ? actualizado : r))
      );
      setAlertaExito(
        actualizado.esPublico
          ? `"${actualizado.titulo}" ahora es PÚBLICO (visible para la IA).`
          : `"${actualizado.titulo}" marcado como CONFIDENCIAL (bloqueado para la IA).`
      );
    } catch (err: unknown) {
      setAlertaError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo cambiar la visibilidad del registro.'
      );
    } finally {
      setAlternandoId(null);
    }
  };

  const handleEliminar = async (item: ConocimientoItem): Promise<void> => {
    const confirmado = window.confirm(
      `¿Eliminar el artículo "${item.titulo}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setEliminandoId(item.id);
    setAlertaError(null);
    setAlertaExito(null);

    try {
      await eliminarConocimiento(item.id);
      setRegistros((prev) => prev.filter((r) => r.id !== item.id));
      setAlertaExito(`Registro "${item.titulo}" eliminado.`);
    } catch (err: unknown) {
      setAlertaError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo eliminar el registro.'
      );
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Base de Conocimiento IA
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Solo los registros marcados como <strong>Público</strong> se envían
            a Gemini. Los <strong>Confidenciales</strong> quedan estrictamente
            bloqueados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={abrirModalUpload}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-brand-bronze bg-sand hover:bg-amber-100 border border-goldBorder transition-colors"
          >
            <Upload className="w-4 h-4 text-amber-600" />
            Subir Documento (.pdf / .txt)
          </button>
          <button
            type="button"
            onClick={abrirModalNuevo}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Nuevo Artículo Manual
          </button>
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-goldBorder p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Total de artículos
            </p>
            <p className="text-3xl font-extrabold text-stone-900 mt-1">
              {resumen.total}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-sand border border-goldBorder flex items-center justify-center text-amber-600">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Públicos (IA los usa)
            </p>
            <p className="text-3xl font-extrabold text-emerald-700 mt-1">
              {resumen.publicos}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
              Confidenciales (Bloqueados)
            </p>
            <p className="text-3xl font-extrabold text-red-700 mt-1">
              {resumen.confidenciales}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Alertas */}
      {alertaExito && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{alertaExito}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertaExito(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {alertaError && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{alertaError}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertaError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-goldBorder p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título o contenido..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          aria-label="Filtrar por categoría"
          className="px-3.5 py-2 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        >
          <option value="Todas">Todas las categorías</option>
          {CATEGORIAS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de conocimientos */}
      <div className="bg-white rounded-3xl border border-goldBorder shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-stone-500">
            <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
            <p className="text-sm">Cargando base de conocimiento...</p>
          </div>
        ) : registrosFiltrados.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-10 h-10 text-amber-400 mx-auto" />
            <p className="text-base font-semibold text-stone-800">
              No se encontraron artículos
            </p>
            <p className="text-sm text-stone-500">
              Ajusta los filtros o agrega un nuevo artículo manual o documento.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-goldBorder/70">
            {registrosFiltrados.map((item) => (
              <div
                key={item.id}
                className="p-5 hover:bg-ivory/70 transition-colors flex flex-col lg:flex-row lg:items-start justify-between gap-4"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        item.esPublico
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}
                    >
                      {item.esPublico ? (
                        <>
                          <Globe className="w-3 h-3" />
                          Público — IA lo usa
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          Confidencial — Bloqueado
                        </>
                      )}
                    </span>

                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sand text-brand-bronze border border-goldBorder">
                      {item.categoria}
                    </span>

                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                      {item.fuente}
                    </span>

                    {item.urlGuia && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        Guía: {item.urlGuia}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-stone-900">
                    {item.titulo}
                  </h3>
                  <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
                    {item.contenido}
                  </p>
                </div>

                {/* Controles rápidos */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={alternandoId === item.id}
                    onClick={() => void handleTogglePublico(item)}
                    title={
                      item.esPublico
                        ? 'Cambiar a Confidencial'
                        : 'Cambiar a Público'
                    }
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-60 ${
                      item.esPublico
                        ? 'bg-amber-50 hover:bg-amber-100 text-brand-bronze border-amber-200'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
                    }`}
                  >
                    <span
                      className={`w-7 h-4 rounded-full p-0.5 flex items-center transition-colors ${
                        item.esPublico
                          ? 'bg-emerald-500 justify-end'
                          : 'bg-stone-400 justify-start'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
                    </span>
                    <span>{item.esPublico ? 'Público' : 'Confidencial'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => abrirModalEditar(item)}
                    className="p-2 rounded-xl text-stone-600 hover:text-amber-700 hover:bg-sand border border-transparent hover:border-goldBorder transition-colors"
                    title="Editar artículo"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    disabled={eliminandoId === item.id}
                    onClick={() => void handleEliminar(item)}
                    className="p-2 rounded-xl text-stone-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors disabled:opacity-50"
                    title="Eliminar artículo"
                  >
                    {eliminandoId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal 1: Nuevo / Editar Artículo Manual */}
      {modalManualAbierto && (
        <div className="fixed inset-0 z-50 bg-stone-900/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-goldBorder shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-goldBorder flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">
                {editandoId !== null
                  ? 'Editar Artículo de Conocimiento'
                  : 'Nuevo Artículo Manual'}
              </h2>
              <button
                type="button"
                onClick={() => setModalManualAbierto(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-sand"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarManual} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-800 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={manualForm.titulo}
                  onChange={(e) =>
                    setManualForm((prev) => ({ ...prev, titulo: e.target.value }))
                  }
                  placeholder="Ej. Política de respaldo en la nube"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-800 mb-1">
                    Categoría
                  </label>
                  <select
                    value={manualForm.categoria}
                    onChange={(e) =>
                      setManualForm((prev) => ({
                        ...prev,
                        categoria: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-800 mb-1">
                    Ruta de navegación sugerida
                  </label>
                  <select
                    disabled={!manualForm.esPublico}
                    value={manualForm.esPublico ? manualForm.urlGuia : ''}
                    onChange={(e) =>
                      setManualForm((prev) => ({
                        ...prev,
                        urlGuia: e.target.value as '' | RutaPublica,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    {RUTAS_OPCIONES.map((opt) => (
                      <option key={opt.label} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-800 mb-1">
                  Contenido *
                </label>
                <textarea
                  rows={6}
                  required
                  value={manualForm.contenido}
                  onChange={(e) =>
                    setManualForm((prev) => ({
                      ...prev,
                      contenido: e.target.value,
                    }))
                  }
                  placeholder="Escribe la información oficial que el asistente podrá utilizar..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-y"
                />
              </div>

              {/* Switch Público / Confidencial */}
              <div className="rounded-2xl bg-sand border border-goldBorder p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-stone-900">
                    {manualForm.esPublico
                      ? 'Visible para la IA (Público)'
                      : 'Bloqueado para la IA (Confidencial)'}
                  </p>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {manualForm.esPublico
                      ? 'Gemini podrá citar esta información en el chat público.'
                      : 'Nunca se enviará al modelo de IA ni se mostrará a visitantes.'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={manualForm.esPublico}
                  onClick={() =>
                    setManualForm((prev) => ({
                      ...prev,
                      esPublico: !prev.esPublico,
                    }))
                  }
                  className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 flex items-center ${
                    manualForm.esPublico
                      ? 'bg-emerald-500 justify-end'
                      : 'bg-red-500 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow" />
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalManualAbierto(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-sand"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoManual}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-60"
                >
                  {guardandoManual && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {editandoId !== null ? 'Guardar Cambios' : 'Crear Artículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Subir Documento .pdf / .txt */}
      {modalUploadAbierto && (
        <div className="fixed inset-0 z-50 bg-stone-900/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-goldBorder shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-goldBorder flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">
                Subir Documento (.pdf / .txt)
              </h2>
              <button
                type="button"
                onClick={() => setModalUploadAbierto(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-sand"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubirDocumento} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-800 mb-1.5">
                  Archivo (.pdf o .txt, máx. 5 MB) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.txt,application/pdf,text/plain"
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setUploadForm((prev) => ({
                      ...prev,
                      archivo: file,
                      titulo:
                        prev.titulo ||
                        (file
                          ? file.name.replace(/\.(pdf|txt)$/i, '')
                          : ''),
                    }));
                  }}
                  className="block w-full text-sm text-stone-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sand file:text-brand-bronze hover:file:bg-amber-100 border border-goldBorder rounded-xl p-2 bg-ivory"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-800 mb-1">
                  Título del documento
                </label>
                <input
                  type="text"
                  value={uploadForm.titulo}
                  onChange={(e) =>
                    setUploadForm((prev) => ({ ...prev, titulo: e.target.value }))
                  }
                  placeholder="Se completa automáticamente con el nombre del archivo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-800 mb-1">
                    Categoría
                  </label>
                  <select
                    value={uploadForm.categoria}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        categoria: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-800 mb-1">
                    Ruta sugerida opcional
                  </label>
                  <select
                    disabled={!uploadForm.esPublico}
                    value={uploadForm.esPublico ? uploadForm.urlGuia : ''}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        urlGuia: e.target.value as '' | RutaPublica,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    {RUTAS_OPCIONES.map((opt) => (
                      <option key={opt.label} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Switch Público / Confidencial */}
              <div className="rounded-2xl bg-sand border border-goldBorder p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-stone-900">
                    {uploadForm.esPublico
                      ? 'Documento Público (IA lo leerá)'
                      : 'Documento Confidencial (Bloqueado)'}
                  </p>
                  <p className="text-xs text-stone-600 mt-0.5">
                    El texto se extraerá automáticamente al guardarlo.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={uploadForm.esPublico}
                  onClick={() =>
                    setUploadForm((prev) => ({
                      ...prev,
                      esPublico: !prev.esPublico,
                    }))
                  }
                  className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 flex items-center ${
                    uploadForm.esPublico
                      ? 'bg-emerald-500 justify-end'
                      : 'bg-red-500 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow" />
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalUploadAbierto(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-sand"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={subiendoArchivo}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-60"
                >
                  {subiendoArchivo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Extrayendo texto...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Procesar y Guardar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
