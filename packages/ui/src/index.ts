// Atomic Design (Primitives, Compositions, Section)
export * from './primitives'
export * from './compositions'
export * from './section'

// Re-export core TanStack primitives for seamless consumption across apps
export {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  type Column,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type Table as TanStackTable,
} from '@tanstack/react-table'

export { useForm, type FieldApi } from '@tanstack/react-form'
export { useStore } from '@tanstack/react-store'
