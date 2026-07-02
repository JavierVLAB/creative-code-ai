import type { Database } from './database.types'
import type { Template } from './types'

type TemplateRow = Database['public']['Tables']['templates']['Row']

export function mapTemplate(row: TemplateRow): Template {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    sketchJs: row.sketch_js,
    configYaml: row.config_yaml,
    renderer: row.renderer,
    thumbnailUrl: row.thumbnail_url,
    tags: row.tags ?? [],
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
