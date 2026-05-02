export interface CharacterProfile {
  id: string
  name: string
  role: string
  startLocationId: string
  openingHook: string
  skills: string[]
  flaws: string[]
}

export interface QuestNode {
  id: string
  title: string
  kind: 'main' | 'side'
  trigger: string
  timeLimitHours?: number
  outcomes: string[]
}

export interface EndingDefinition {
  id: string
  title: string
  requirement: string
}
