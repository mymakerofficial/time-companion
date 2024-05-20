import { type Publisher, PublisherImpl } from '@shared/events/publisher'
import type { Database } from '@shared/database/types/database'
import { valuesOf } from '@shared/lib/utils/object'

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

  start(): void {
    this.database.onMigrationsStarted(() => {
      this.setActorState('databaseMigrations', 'running')
    })

    this.database.onMigrationsSkipped(() => {
      this.setActorState('databaseMigrations', 'skipped')
    })

    this.database.onMigrationsFinished(() => {
      this.setActorState('databaseMigrations', 'finished')
    })

    this.database.onMigrationsFailed(() => {
      this.setActorState('databaseMigrations', 'failed')
    })

    this.setActorState('database', 'running')

    this.database
      .open()
      .then(() => {
        this._isReady = true
        this.setActorState('database', 'finished')
      })
      .catch((error) => {
        console.error(error)
        this.setActorState('database', 'failed')
      })
  }
}