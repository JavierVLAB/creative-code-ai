-- sketch-templates-refresh: bucket de Storage para imágenes que el usuario sube
-- desde el control `type: image` de un sketch (ej. plantilla de serigrafía).
-- Mismo patrón que el bucket `snapshot-previews` ya existente: público, con
-- RLS de escritura/borrado acotada al dueño del proyecto vía la ruta del objeto
-- ({project_id}/{asset_id}.<ext>). La metadata vive en `public.assets`
-- (ya creada en 20260623000000_initial_schema.sql, con su propia RLS).

insert into storage.buckets (id, name, public)
values ('sketch-uploads', 'sketch-uploads', true)
on conflict (id) do nothing;

create policy "sketch_uploads_owner_write"
on storage.objects for insert
with check (
  bucket_id = 'sketch-uploads'
  and exists (
    select 1 from public.projects
    where projects.id::text = (storage.foldername(name))[1]
      and projects.user_id = auth.uid()
  )
);

create policy "sketch_uploads_owner_delete"
on storage.objects for delete
using (
  bucket_id = 'sketch-uploads'
  and exists (
    select 1 from public.projects
    where projects.id::text = (storage.foldername(name))[1]
      and projects.user_id = auth.uid()
  )
);
