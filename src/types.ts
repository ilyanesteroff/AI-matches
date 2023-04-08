

export enum Level {
  MIN = 'MIN',
  MAX = 'MAX',
}


export interface State {
  id: string
  level: Level
  layer: number
  index: number // 1 or -1
  parents: string[] //ids
  children: string[] //ids
  state: number[] //game state
} 