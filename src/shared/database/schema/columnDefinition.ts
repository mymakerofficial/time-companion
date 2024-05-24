import type {
  ColumnDefinition,
  ColumnDefinitionRaw,
  KeyRangeFactory,
  RawWhere,
  RawWhereBooleanGroup,
  WhereBuilder,
} from '@shared/database/types/schema'
import {
  type KeyRange,
  type OrderBy,
  type OrderByDirection,
  type WhereBooleanOperator,
  type WhereOperator,
} from '@shared/database/types/database'

class KeyRangeFactoryImpl<TRow extends object, TColumn = unknown>
  implements KeyRangeFactory<TRow, TColumn>
{
  constructor(protected definition: ColumnDefinitionRaw<TRow, TColumn>) {}

  between(
    lower?: TColumn,
    upper?: TColumn,
    lowerOpen: boolean = false,
    upperOpen: boolean = false,
  ): KeyRange<TRow, TColumn> {
    return {
      column: this.definition,
      lower,
      lowerOpen,
      upper,
      upperOpen,
    }
  }

  betweenExclusive(lower: TColumn, upper: TColumn): KeyRange<TRow, TColumn> {
    return this.between(lower, upper, true, true)
  }

  lowerBound(value: TColumn, open: boolean = false): KeyRange<TRow, TColumn> {
    return this.between(value, undefined, open)
  }

  lowerBoundExclusive(value: TColumn): KeyRange<TRow, TColumn> {
    return this.lowerBound(value, true)
  }

  only(value: TColumn): KeyRange<TRow, TColumn> {
    return this.between(value, value, false, false)
  }

  upperBound(value: TColumn, open: boolean = false): KeyRange<TRow, TColumn> {
    return this.between(undefined, value, false, open)
  }

  upperBoundExclusive(value: TColumn): KeyRange<TRow, TColumn> {
    return this.upperBound(value, true)
  }
}

export class ColumnDefinitionImpl<TRow extends object, TColumn = unknown>
  implements ColumnDefinition<TRow, TColumn>
{
  constructor(protected definition: ColumnDefinitionRaw<TRow, TColumn>) {}

  get _() {
    return {
      raw: this.definition,
    }
  }

  get range() {
    return new KeyRangeFactoryImpl(this.definition)
  }

  protected where(
    operator: WhereOperator,
    value?: unknown,
  ): WhereBuilder<TRow, TColumn> {
    return new WhereConditionBuilderImpl(this.definition, operator, value)
  }

  direction(direction: OrderByDirection): OrderBy<TRow, TColumn> {
    return {
      column: this.definition,
      direction,
    }
  }

  dir(direction: OrderByDirection): OrderBy<TRow, TColumn> {
    return this.direction(direction)
  }

  asc(): OrderBy<TRow, TColumn> {
    return this.direction('asc')
  }

  desc(): OrderBy<TRow, TColumn> {
    return this.direction('desc')
  }

  contains(value: string): WhereBuilder<TRow, TColumn> {
    return this.where('contains', value)
  }

  eq(
    value: ColumnDefinition<any, TColumn> | TColumn,
  ): WhereBuilder<TRow, TColumn> {
    return this.equals(value)
  }

  equals(
    value: ColumnDefinition<any, TColumn> | TColumn,
  ): WhereBuilder<TRow, TColumn> {
    return this.where('equals', value)
  }

  greaterThan(value: number): WhereBuilder<TRow, TColumn> {
    return this.where('greaterThan', value)
  }

  greaterThanOrEquals(value: number): WhereBuilder<TRow, TColumn> {
    return this.where('greaterThanOrEquals', value)
  }

  gt(value: number): WhereBuilder<TRow, TColumn> {
    return this.greaterThan(value)
  }

  gte(value: number): WhereBuilder<TRow, TColumn> {
    return this.greaterThanOrEquals(value)
  }

  in(values: Array<TColumn>): WhereBuilder<TRow, TColumn> {
    return this.inArray(values)
  }

  inArray(values: Array<TColumn>): WhereBuilder<TRow, TColumn> {
    return this.where('inArray', values)
  }

  isNotNull(): WhereBuilder<TRow, TColumn> {
    return this.where('isNotNull')
  }

  isNull(): WhereBuilder<TRow, TColumn> {
    return this.where('isNull')
  }

  lessThan(value: number): WhereBuilder<TRow, TColumn> {
    return this.where('lessThan', value)
  }

  lessThanOrEquals(value: number): WhereBuilder<TRow, TColumn> {
    return this.where('lessThanOrEquals', value)
  }

  lt(value: number): WhereBuilder<TRow, TColumn> {
    return this.lessThan(value)
  }

  lte(value: number): WhereBuilder<TRow, TColumn> {
    return this.lessThanOrEquals(value)
  }

  neq(value: TColumn): WhereBuilder<TRow, TColumn> {
    return this.notEquals(value)
  }

  notContains(value: string): WhereBuilder<TRow, TColumn> {
    return this.where('notContains', value)
  }

  notEquals(value: TColumn): WhereBuilder<TRow, TColumn> {
    return this.where('notEquals', value)
  }

  notIn(value: Array<TColumn>): WhereBuilder<TRow, TColumn> {
    return this.notInArray(value)
  }

  notInArray(value: Array<TColumn>): WhereBuilder<TRow, TColumn> {
    return this.where('notInArray', value)
  }
}

class WhereGroupBuilderImpl<TRow extends object, TColumn = unknown>
  implements WhereBuilder<TRow, TColumn>
{
  constructor(
    protected booleanOperator: WhereBooleanOperator,
    protected parent: WhereBuilder<object>,
    protected others: Array<WhereBuilder<object>>,
  ) {}

  protected get conditions(): Array<RawWhere> {
    return this.others.map((condition) => condition._.raw)
  }

  protected get conditionsWithParent(): Array<RawWhere> {
    return [this.parent._.raw, ...this.conditions]
  }

  protected get group(): RawWhereBooleanGroup {
    return {
      booleanOperator: this.booleanOperator,
      conditions: this.conditionsWithParent,
    }
  }

  protected get where(): RawWhere {
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

  and<GRow extends object, GColumn>(
    other: WhereBuilder<GRow, GColumn>,
  ): WhereBuilder<TRow, TColumn> {
    if (this.booleanOperator === 'and') {
      this.others.push(other)
      return this
    }

    return new WhereGroupBuilderImpl('and', this, [other])
  }

  or<GRow extends object, GColumn>(
    other: WhereBuilder<GRow, GColumn>,
  ): WhereBuilder<TRow, TColumn> {
    if (this.booleanOperator === 'or') {
      this.others.push(other)
      return this
    }

    return new WhereGroupBuilderImpl('or', this, [other])
  }
}

class WhereConditionBuilderImpl<TRow extends object, TColumn = unknown>
  implements WhereBuilder<TRow, TColumn>
{
  constructor(
    protected column: ColumnDefinitionRaw<TRow, TColumn>,
    protected operator: WhereOperator,
    protected value?: unknown,
  ) {}

  protected get where(): RawWhere {
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

  and<GRow extends object, GColumn>(
    other: WhereBuilder<GRow, GColumn>,
  ): WhereBuilder<TRow, TColumn> {
    return new WhereGroupBuilderImpl('and', this, [other])
  }

  or<GRow extends object, GColumn>(
    other: WhereBuilder<GRow, GColumn>,
  ): WhereBuilder<TRow, TColumn> {
    return new WhereGroupBuilderImpl('or', this, [other])
  }
}
