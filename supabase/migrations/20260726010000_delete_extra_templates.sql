-- sketch-templates-refresh: elimina las 4 plantillas añadidas en
-- 20260726000000_add_more_templates.sql sin revisión creativa directa de Javi.
-- No se toca ni se borra esa migración (puede que ya se aplicara en Supabase);
-- esta es una migración nueva y posterior.
delete from public.templates
where slug in ('ondas-perlin', 'mandala-geometrico', 'lluvia-de-cuadrados', 'campo-de-vectores');
