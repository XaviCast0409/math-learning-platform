import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, ShoppingBag, Image as ImageIcon, Film, Zap } from 'lucide-react';
import { Button } from '../../../../../components/common/Button';
import { Input } from '../../../../../components/common/Input';
import type { Product } from '../../../../../types/admin.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  initialData?: Product | null;
}


export const ProductModal = ({ isOpen, onClose, onSubmit, initialData }: Props) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [loading, setLoading] = useState(false);

  // Observamos campos clave para mostrar UI dinámica
  const category = watch('category');
  const type = watch('type');
  const spriteType = watch('meta_sprite_type', 'gif');

  // --- EFECTO 1: Cargar Datos o Defaults ---
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // 1. Cargar campos básicos
        setValue('name', initialData.name);
        setValue('description', initialData.description);
        setValue('cost_gems', initialData.cost_gems);
        setValue('image_url', initialData.image_url);
        setValue('category', initialData.category);
        setValue('type', initialData.type);
        setValue('active', initialData.active);

        // 2. DESEMPAQUETAR METADATA (JSON -> Form)
        const meta = initialData.effect_metadata || {};

        // A. Boosts (Pociones)
        if (meta.duration_minutes) setValue('meta_duration', meta.duration_minutes);
        if (meta.multiplier) setValue('meta_multiplier', meta.multiplier);

        // B. Bonus Pasivos (Cosméticos / Avatares)
        if (meta.xp_bonus) {
          setValue('meta_stat', 'xp');
          setValue('meta_percent', meta.xp_bonus * 100); // Guardamos 0.1, mostramos 10%
        } else if (meta.gems_bonus) {
          setValue('meta_stat', 'gems');
          setValue('meta_percent', meta.gems_bonus * 100);
        }

        // C. Animación (Sprites)
        if (meta.sprite_type) setValue('meta_sprite_type', meta.sprite_type);
        if (meta.frame_width) setValue('meta_fw', meta.frame_width);
        if (meta.frame_height) setValue('meta_fh', meta.frame_height);
        if (meta.total_frames) setValue('meta_tf', meta.total_frames);

      } else {
        // 3. Defaults para Nuevo Producto (Evita error 400)
        reset({
          active: true,
          category: 'instant',
          type: 'refill_health_potion', // Importante: Valor válido por defecto
          cost_gems: 100,
          meta_multiplier: 2,
          meta_sprite_type: 'gif'
        });
      }
    }
  }, [initialData, isOpen, setValue, reset]);

  // --- EFECTO 2: Corrección automática de Tipo ---
  // Si cambias de categoría, actualizamos el 'type' para que no quede inválido
  useEffect(() => {
    if (!isOpen) return;

    if (category === 'instant') {
      if (type !== 'refill_health_potion') setValue('type', 'refill_health_potion');
    }
    else if (category === 'inventory') {
      const validTypes = ['xp_boost_time', 'gem_boost_time', 'shield'];
      if (!validTypes.includes(type)) setValue('type', 'xp_boost_time');
    }
    else if (category === 'cosmetic') {
      const validTypes = ['cosmetic_avatar', 'cosmetic_background', 'theme'];
      if (!validTypes.includes(type)) setValue('type', 'cosmetic_avatar');
    }
  }, [category, setValue, isOpen, type]);

  const onFormSubmit = async (data: any) => { // data from react-hook-form is generic
    setLoading(true);

    // --- CONSTRUIR EL JSON (Empaquetar effect_metadata) ---
    // Aquí es donde aseguramos que NO SE PIERDAN LOS EFECTOS
    // Definimos metadata como un Record flexible para permitir ir agregando campos
    let metadata: Record<string, any> = {};

    // CASO A: INVENTARIO (Boosts de tiempo)
    if (data.category === 'inventory' && data.type && data.type.includes('boost')) {
      metadata.duration_minutes = Number(data.meta_duration);
      metadata.multiplier = Number(data.meta_multiplier);
    }

    // CASO B: COSMÉTICOS (Avatares con Stats y Sprites)
    else if (data.category === 'cosmetic' && data.type === 'cosmetic_avatar') {

      // 1. Datos Visuales (Sprite Sheet)
      metadata.sprite_type = data.meta_sprite_type;
      if (data.meta_sprite_type === 'sprite') {
        metadata.frame_width = Number(data.meta_fw);
        metadata.frame_height = Number(data.meta_fh);
        metadata.total_frames = Number(data.meta_tf);
      }

      // 2. Datos de Juego (Efectos / Bonus Pasivos)
      if (data.meta_stat === 'xp') {
        metadata.xp_bonus = Number(data.meta_percent) / 100; // 10% -> 0.1
      }
      if (data.meta_stat === 'gems') {
        metadata.gems_bonus = Number(data.meta_percent) / 100;
      }
    }

    const payload = {
      ...data,
      cost_gems: Number(data.cost_gems),
      effect_metadata: metadata, // Enviamos el JSON completo con visuales Y efectos

      // Limpiamos basura del formulario
      meta_duration: undefined, meta_multiplier: undefined,
      meta_stat: undefined, meta_percent: undefined,
      meta_sprite_type: undefined, meta_fw: undefined,
      meta_fh: undefined, meta_tf: undefined
    };

    await onSubmit(payload);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-4">

        {/* Header */}
        <div className="bg-purple-900 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2">
            <ShoppingBag size={18} /> {initialData ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre" {...register('name', { required: true })} placeholder="Ej: Guerrero de Fuego" />
            <Input label="Precio (XaviCoins)" type="number" {...register('cost_gems', { required: true })} />
          </div>

          <Input label="Descripción" {...register('description')} placeholder="Breve descripción..." />

          <Input
            label="URL de Imagen / Sprite Sheet"
            {...register('image_url')}
            placeholder="/assets/avatars/..."
            icon={<ImageIcon size={16} />}
          />

          {/* SELECTORES DE TIPO */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
              <select
                {...register('category')}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="instant">Instantáneo</option>
                <option value="inventory">Inventario</option>
                <option value="cosmetic">Cosmético (Permanente)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo Específico</label>

              {category === 'cosmetic' && (
                <select {...register('type')} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none">
                  <option value="cosmetic_avatar">Avatar Completo</option>
                  <option value="cosmetic_background">Fondo</option>
                  <option value="theme">Tema</option>
                </select>
              )}

              {category === 'inventory' && (
                <select {...register('type')} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none">
                  <option value="xp_boost_time">Potenciador de XP</option>
                  <option value="gem_boost_time">Potenciador de XaviCoins</option>
                  <option value="shield">Escudo</option>
                </select>
              )}

              {category === 'instant' && (
                <select {...register('type')} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none">
                  <option value="refill_health_potion">Poción de Salud</option>
                </select>
              )}
            </div>
          </div>

          {/* --- SECCIÓN 1: CONFIGURACIÓN VISUAL (SPRITES) --- */}
          {category === 'cosmetic' && type === 'cosmetic_avatar' && (
            <div className="border border-purple-100 bg-purple-50 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase mb-2">
                <Film size={14} /> Configuración de Animación
              </div>

              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="gif" {...register('meta_sprite_type')} /> <span className="text-sm">GIF</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="sprite" {...register('meta_sprite_type')} /> <span className="text-sm">Sprite Sheet</span>
                </label>
              </div>

              {spriteType === 'sprite' && (
                <div className="grid grid-cols-3 gap-2 animate-in fade-in">
                  <input type="number" {...register('meta_fw')} className="w-full p-2 rounded border text-sm" placeholder="Ancho (px)" />
                  <input type="number" {...register('meta_fh')} className="w-full p-2 rounded border text-sm" placeholder="Alto (px)" />
                  <input type="number" {...register('meta_tf')} className="w-full p-2 rounded border text-sm" placeholder="Frames" />
                </div>
              )}
            </div>
          )}

          {/* --- SECCIÓN 2: CONFIGURACIÓN DE EFECTOS (STATS) --- */}
          {category === 'cosmetic' && type === 'cosmetic_avatar' && (
            <div className="border border-yellow-100 bg-yellow-50 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-yellow-700 font-bold text-xs uppercase mb-2">
                <Zap size={14} /> Bonus / Efectos Pasivos
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Tipo de Bonus</label>
                  <select {...register('meta_stat')} className="w-full p-2 rounded border border-gray-300 text-sm">
                    <option value="">Ninguno</option>
                    <option value="xp">Experiencia (XP)</option>
                    <option value="gems">XaviCoins</option>
                  </select>
                </div>
                <div className="w-1/3">
                  <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Porcentaje</label>
                  <div className="relative">
                    <input type="number" {...register('meta_percent')} className="w-full p-2 rounded border border-gray-300 text-sm" placeholder="10" />
                    <span className="absolute right-2 top-2 text-gray-400 text-xs">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- SECCIÓN 3: BOOSTS (CONSUMIBLES) --- */}
          {category === 'inventory' && type && type.includes('boost') && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 grid grid-cols-2 gap-4">
              <Input label="Duración (Min)" type="number" {...register('meta_duration')} placeholder="30" />
              <Input label="Multiplicador (x)" type="number" {...register('meta_multiplier')} step="0.1" placeholder="2.0" />
            </div>
          )}

          {/* Checkbox Activo */}
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" {...register('active')} id="act" className="w-4 h-4 text-purple-600 rounded" />
            <label htmlFor="act" className="text-sm font-medium text-gray-700 cursor-pointer">Visible en tienda</label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
