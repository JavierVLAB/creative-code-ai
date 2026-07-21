-- Añade columna preview_url para almacenar la URL de la imagen de preview del snapshot.
-- Nullable: los snapshots existentes no tienen preview.
ALTER TABLE snapshots ADD COLUMN preview_url text;
