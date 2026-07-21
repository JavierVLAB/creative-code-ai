-- Añade columna is_favorite para marcar snapshots como favoritos.
ALTER TABLE snapshots ADD COLUMN is_favorite boolean NOT NULL DEFAULT false;
