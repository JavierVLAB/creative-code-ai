import { describe, expect, it } from 'vitest'
import { mapTemplate } from './templates'

describe('mapTemplate', () => {
  it('normaliza una fila de Supabase al tipo de dominio Template', () => {
    const template = mapTemplate({
      id: 'tpl-1',
      slug: 'demo',
      title: 'Circulo con lineas',
      description: 'Demo publica',
      sketch_js: 'function setup() {}',
      config_yaml: 'name: demo',
      renderer: 'p5js',
      thumbnail_url: null,
      tags: ['p5js', 'demo'],
      is_published: true,
      created_at: '2026-07-02T00:00:00.000Z',
      updated_at: '2026-07-02T00:00:00.000Z',
    })

    expect(template).toMatchObject({
      slug: 'demo',
      sketchJs: 'function setup() {}',
      configYaml: 'name: demo',
      tags: ['p5js', 'demo'],
      isPublished: true,
    })
  })
})
