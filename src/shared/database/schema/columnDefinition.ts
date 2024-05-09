import type {
  ColumnDefinition,
  ColumnDefinitionBase,
  ColumnDefinitionRaw,
  RawWhere,
  WhereBuilder,
} from '@shared/database/types/schema'
import {
  type WhereBooleanOperator,
  type WhereOperator,
  whereOperators,
} from '@shared/database/types/database'

class ColumnDefinitionBaseImpl<T> implements ColumnDefinitionBase<T> {
  constructor(protected rawDefinition: ColumnDefinitionRaw<T>) {}

  get _() {
    return {
      raw: this.rawDefinition,
      where: (operator: WhereOperator, value?: unknown) =>
        new WhereConditionBuilderImpl(this.rawDefinition, operator, value),
    }
  }
}

export function createColumnDefinition<T>(
  rawDefinition: ColumnDefinitionRaw<T>,
): ColumnDefinition<T> {
  const base = new ColumnDefinitionBaseImpl(rawDefinition)

  return Object.assign(
    base,
    whereOperators.reduce(
      (acc, operator) => {
        acc[operator] = (value?: unknown) => base._.where(operator, value)
        return acc
      },
      {} as Record<WhereOperator, (value?: unknown) => WhereBuilder<T>>,
    ),
  ) as ColumnDefinition<T>
}

class WhereGroupBuilderImpl<T> implements WhereBuilder<T> {
  constructor(
    protected booleanOperator: WhereBooleanOperator,
    protected conditions: Array<WhereBuilder<any>>,
  ) {}

  protected get where(): RawWhere<T> {
    return {
      type: 'booleanGroup',
      booleanOperator: this.booleanOperator,
      conditions: this.conditions.map((condition) => condition._.raw),
    }
  }

  get _() {
    return {
      raw: this.where,
    }
  }

  and<G>(other: WhereBuilder<G>): WhereBuilder<T> {
    return new WhereGroupBuilderImpl('and', [...this.conditions, other])
  }

  or<G>(other: WhereBuilder<G>): WhereBuilder<T> {
    return new WhereGroupBuilderImpl('or', [...this.conditions, other])
  }
}

class WhereConditionBuilderImpl<T> implements WhereBuilder<T> {
  constructor(
    protected column: ColumnDefinitionRaw<T>,
    protected operator: WhereOperator,
    protected value?: unknown,
  ) {}

  protected get where(): RawWhere<T> {
    return {
      type: 'condition',
      column: this.column,
      operator: this.operator,
      value: this.value,
    }
  }

  get _() {
    return {
      raw: this.where,
    }
  }

  and<G>(other: WhereBuilder<G>): WhereBuilder<T> {
    return new WhereGroupBuilderImpl('and', [this, other])
  }

  or<G>(other: WhereBuilder<G>): WhereBuilder<T> {
    return new WhereGroupBuilderImpl('or', [this, other])
  }
}
