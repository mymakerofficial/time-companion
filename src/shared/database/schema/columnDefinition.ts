import type {
  ColumnDefinition,
  ColumnDefinitionBase,
  ColumnDefinitionRaw,
  RawWhere,
  RawWhereBooleanGroup,
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
    protected parent: WhereBuilder<unknown>,
    protected others: Array<WhereBuilder<unknown>>,
  ) {}

  protected get conditions(): Array<RawWhere<unknown>> {
    return this.others.map((condition) => condition._.raw)
  }

  protected get conditionsWithParent(): Array<RawWhere<unknown>> {
    return [this.parent._.raw, ...this.conditions]
  }

  protected get group(): RawWhereBooleanGroup<T> {
    return {
      booleanOperator: this.booleanOperator,
      conditions: this.conditionsWithParent,
    }
  }

  protected get where(): RawWhere<T> {
    return {
      type: 'booleanGroup',
      ...this.group,
    }
  }

  get _() {
    return {
      raw: this.where,
    }
  }

  and<G>(other: WhereBuilder<G>): WhereBuilder<T> {
    if (this.booleanOperator === 'and') {
      this.others.push(other)
      return this
    }

    return new WhereGroupBuilderImpl('and', this, [other])
  }

  or<G>(other: WhereBuilder<G>): WhereBuilder<T> {
    if (this.booleanOperator === 'or') {
      this.others.push(other)
      return this
    }

    return new WhereGroupBuilderImpl('or', this, [other])
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
    return new WhereGroupBuilderImpl('and', this, [other])
  }

  or<G>(other: WhereBuilder<G>): WhereBuilder<T> {
    return new WhereGroupBuilderImpl('or', this, [other])
  }
}
