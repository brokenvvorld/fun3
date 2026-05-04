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
  outcomes: string[]
}

export interface EndingDefinition {
  id: string
  title: string
  requirement: string
}

export interface WorldCodexEntry {
  id: string
  title: string
  category: string
  preview: string
  discoveredReceipts?: string[]
  handledReceipts?: string[]
  discoveryReceipts?: string[]
  outcomeKey?: string
  outcomes?: Record<string, WorldCodexOutcome>
  dossierStatus: string
  civicLine: string
  handlingProtocol: string
  formTags: string[]
  body: string
  trigger: string
  handling: string
  consequence: string
  echo: string
}

export type CodexDiscoveryStatus = 'available' | 'undiscovered' | 'discovered' | 'handled'

export interface WorldCodexOutcome {
  title: string
  consequence: string
  echo: string
}

export interface WorldCodexViewEntry extends WorldCodexEntry {
  discoveryStatus: CodexDiscoveryStatus
  resolvedOutcome?: WorldCodexOutcome
}
