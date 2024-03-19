import type { EntityDto } from '@shared/model/helpers/entities'

export interface ProjectDto {
  displayName: string
  color: string
  isBillable: boolean
}

export interface ProjectEntityDto extends ProjectDto, EntityDto {}
