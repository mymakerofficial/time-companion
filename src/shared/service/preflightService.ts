import { type Publisher, PublisherImpl } from '@shared/events/publisher'
import { valuesOf } from '@shared/lib/utils/object'
import type { Database } from '@shared/drizzle/database'
import migrationFile from '@shared/drizzle/migrations/0000_solid_payback.sql?raw'

export interface PreflightServiceDependencies {
  database: Database
}

export type PreflightActor = 'database' | 'databaseMigrations'
export type PreflightState =
  | 'idle'
  | 'running'
  | 'skipped'
  | 'finished'
  | 'failed'

export type PreflightPublisherTopics = {
  actor: PreflightActor
  state: PreflightState
}
export type PreflightPublisherEvent = PreflightPublisherTopics

export interface PreflightService
  extends Publisher<PreflightPublisherTopics, PreflightPublisherEvent> {
  start(): void
  readonly actors: Record<PreflightActor, PreflightState>
  readonly isReady: boolean
  readonly isErrored: boolean
}

export function createPreflightService({
  database,
}: PreflightServiceDependencies): PreflightService {
  return new PreflightServiceImpl({ database })
}

class PreflightServiceImpl
  extends PublisherImpl<PreflightPublisherTopics, PreflightPublisherEvent>
  implements PreflightService
{
  protected readonly database: Database

  constructor(deps: PreflightServiceDependencies) {
    super()
    this.database = deps.database
  }

  protected _actors: Map<PreflightActor, PreflightState> = new Map([
    ['database', 'idle'],
    ['databaseMigrations', 'idle'],
  ])

  protected _isReady = false

  get actors(): Record<PreflightActor, PreflightState> {
    return Object.fromEntries(this._actors) as Record<
      PreflightActor,
      PreflightState
    >
  }

  get isReady(): boolean {
    return this._isReady
  }

  get isErrored(): boolean {
    return valuesOf(this.actors).some((state) => state === 'failed')
  }

  protected setActorState(actor: PreflightActor, state: PreflightState): void {
    this._actors.set(actor, state)
    this.notify({ actor, state }, { actor, state })
  }

  private async startAsync(): Promise<void> {
    this.setActorState('database', 'running')
    await this.database
      .init()
      .then(() => {
        this._isReady = true
        this.setActorState('database', 'finished')
      })
      .catch((error) => {
        console.error(error)
        this.setActorState('database', 'failed')
      })

    this.setActorState('databaseMigrations', 'running')
    await this.database
      .execRaw(migrationFile)
      .then(() => {
        this._isReady = true
        this.setActorState('databaseMigrations', 'finished')
      })
      .catch((error) => {
        console.error(error)
        this.setActorState('databaseMigrations', 'failed')
      })
  }

  start(): void {
    this.startAsync().catch((error) => {
      console.error(error)
    })
  }
}
