import type {
  CreateArgs,
  CreateManyArgs,
  DeleteArgs,
  DeleteManyArgs,
  FindArgs,
  FindManyArgs,
  Table,
  UpdateArgs,
  UpdateManyArgs,
} from '@shared/database/database'
import { todo } from '@shared/lib/utils/todo'

export class IndexedDbFacadeTable<TData extends object>
  implements Table<TData>
{
  constructor(private readonly objectStore: IDBObjectStore) {}

  async findFirst(args?: FindArgs<TData>): Promise<TData> {
    todo()
  }

  async findMany(args?: FindManyArgs<TData>): Promise<Array<TData>> {
    return new Promise((resolve, reject) => {
      const request = this.objectStore.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async update(args: UpdateArgs<TData>): Promise<TData> {
    todo()
  }

  async updateMany(args: UpdateManyArgs<TData>): Promise<Array<TData>> {
    todo()
  }

  async delete(args: DeleteArgs<TData>): Promise<void> {
    todo()
  }

  async deleteMany(args: DeleteManyArgs<TData>): Promise<void> {
    todo()
  }

  async create(args: CreateArgs<TData>): Promise<TData> {
    return new Promise((resolve, reject) => {
      const request = this.objectStore.add(args.data)

      request.onsuccess = () => resolve(args.data)
      request.onerror = () => reject(request.error)
    })
  }

  async createMany(args: CreateManyArgs<TData>): Promise<Array<TData>> {
    todo()
  }
}
