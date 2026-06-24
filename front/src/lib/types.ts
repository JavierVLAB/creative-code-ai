export interface CanvasConfig {
  width: number
  height: number
}

export interface RangeModuleConfig {
  type: 'range'
  label: string
  min: number
  max: number
  step: number
  default: number
}

export interface SelectOption {
  label: string
  value: string
}

export interface SelectModuleConfig {
  type: 'select'
  label: string
  options: SelectOption[]
  default: string
}

export type ModuleConfig = RangeModuleConfig | SelectModuleConfig

export interface SketchConfig {
  name: string
  modules: {
    canvas: CanvasConfig
    [key: string]: CanvasConfig | ModuleConfig
  }
}

export interface SliderControl {
  kind: 'slider'
  key: string
  label: string
  min: number
  max: number
  step: number
  defaultValue: number
}

export interface SelectControl {
  kind: 'select'
  key: string
  label: string
  options: SelectOption[]
  defaultValue: string
  isColor: boolean
}

export type Control = SliderControl | SelectControl
