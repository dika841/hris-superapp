import * as React from 'react'
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Table as TanStackTable,
} from '@tanstack/react-table'
import {
  ArrowsDownUp,
  CaretDown,
  CaretUp,
  MagnifyingGlass,
  XCircle,
} from '@phosphor-icons/react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../compositions/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../compositions/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../compositions/select'
import { Button } from '../../primitives/button'
import { Input } from '../../primitives/input'
import { Skeleton } from '../../primitives/skeleton'
import { cn } from '@hris/utils'

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Filter by specific column key (e.g. "full_name"). If omitted, global filtering is used. */
  searchKey?: string
  searchPlaceholder?: string
  /** Controlled search value (for server-side filtering) */
  searchValue?: string
  /** Handler called when search input changes (for server-side filtering) */
  onSearchChange?: (val: string) => void
  /** Custom filter controls rendered alongside the search input */
  filterSlot?: React.ReactNode
  isLoading?: boolean
  emptyMessage?: React.ReactNode
  toolbarActions?: React.ReactNode
  pageSize?: number
  pageSizeOptions?: number[]
  showPagination?: boolean
  showSearch?: boolean
  showRowSelectionInfo?: boolean
  className?: string
  tableContainerClassName?: string
  /** Server-side pagination total page count */
  pageCount?: number
  /** Server-side pagination total item count */
  totalCount?: number
  /** Server-side pagination pageIndex (0-indexed) */
  pageIndex?: number
  /** Callback for server-side page change (0-indexed) */
  onPageChange?: (pageIndex: number) => void
  /** Callback for server-side page size change */
  onPageSizeChange?: (pageSize: number) => void
  /** Enable server-side pagination */
  manualPagination?: boolean
  /** Enable server-side filtering (disables client filtering) */
  manualFiltering?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search records...',
  searchValue,
  onSearchChange,
  filterSlot,
  isLoading = false,
  emptyMessage = 'No records found.',
  toolbarActions,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  showPagination = true,
  showSearch = true,
  showRowSelectionInfo = false,
  className,
  tableContainerClassName,
  pageCount,
  totalCount,
  pageIndex,
  onPageChange,
  onPageSizeChange,
  manualPagination = false,
  manualFiltering = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState({
    pageIndex: pageIndex ?? 0,
    pageSize,
  })

  React.useEffect(() => {
    if (pageIndex !== undefined) {
      setPagination((prev) => ({ ...prev, pageIndex }))
    }
  }, [pageIndex])

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    manualPagination,
    manualFiltering,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      setPagination((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (onPageChange && next.pageIndex !== prev.pageIndex) {
          onPageChange(next.pageIndex)
        }
        if (onPageSizeChange && next.pageSize !== prev.pageSize) {
          onPageSizeChange(next.pageSize)
        }
        return next
      })
    },
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter: searchKey ? undefined : (searchValue !== undefined ? searchValue : globalFilter),
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  const currentSearchValue = searchValue !== undefined
    ? searchValue
    : searchKey
      ? (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
      : globalFilter

  const handleSearchChange = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val)
    } else if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(val)
    } else {
      setGlobalFilter(val)
    }
  }

  const handleClearSearch = () => {
    handleSearchChange('')
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table Toolbar */}
      {(showSearch || filterSlot || toolbarActions) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2.5 flex-wrap">
            {showSearch && (
              <div className="relative flex-1 max-w-sm min-w-[200px]">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={currentSearchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-8 h-9 text-xs"
                />
                {currentSearchValue && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Clear search"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            {filterSlot}
          </div>
          {toolbarActions && (
            <div className="flex items-center gap-2 flex-wrap shrink-0">{toolbarActions}</div>
          )}
        </div>
      )}

      {/* Table Container */}
      <div
        className={cn(
          'rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden shadow-sm',
          tableContainerClassName
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={`skeleton-row-${idx}`}>
                  {columns.map((_, colIdx) => (
                    <TableCell key={`skeleton-cell-${colIdx}`}>
                      <Skeleton className="h-5 w-full max-w-[80%]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {showPagination && !isLoading && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          showRowSelectionInfo={showRowSelectionInfo}
          totalCount={totalCount}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                           DataTableColumnHeader                            */
/* -------------------------------------------------------------------------- */

export interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn('text-xs font-semibold uppercase tracking-wider', className)}>{title}</div>
  }

  const isSorted = column.getIsSorted()

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 text-xs font-semibold uppercase tracking-wider hover:bg-muted/80 text-muted-foreground hover:text-foreground"
        onClick={() => column.toggleSorting(isSorted === 'asc')}
      >
        <span>{title}</span>
        {isSorted === 'desc' ? (
          <CaretDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
        ) : isSorted === 'asc' ? (
          <CaretUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
        ) : (
          <ArrowsDownUp className="ml-1.5 h-3.5 w-3.5 opacity-50" />
        )}
      </Button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                            DataTablePagination                             */
/* -------------------------------------------------------------------------- */

export interface DataTablePaginationProps<TData> {
  table: TanStackTable<TData>
  pageSizeOptions?: number[]
  showRowSelectionInfo?: boolean
  totalCount?: number
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 50],
  showRowSelectionInfo = false,
  totalCount,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = table.getPageCount()
  const totalRows = totalCount !== undefined ? totalCount : table.getFilteredRowModel().rows.length
  const pageSize = table.getState().pagination.pageSize
  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows)

  // Generate visible page numbers
  const pages: (number | 'ellipsis')[] = React.useMemo(() => {
    if (pageCount <= 5) {
      return Array.from({ length: pageCount }, (_, i) => i + 1)
    }
    if (pageIndex < 3) {
      return [1, 2, 3, 4, 'ellipsis', pageCount]
    }
    if (pageIndex > pageCount - 4) {
      return [1, 'ellipsis', pageCount - 3, pageCount - 2, pageCount - 1, pageCount]
    }
    return [1, 'ellipsis', pageIndex, pageIndex + 1, pageIndex + 2, 'ellipsis', pageCount]
  }, [pageCount, pageIndex])

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 text-xs text-muted-foreground">
      {/* Information text */}
      <div className="flex items-center gap-2">
        {showRowSelectionInfo && (
          <span>
            {table.getFilteredSelectedRowModel().rows.length} of {totalRows} row(s) selected &bull;{' '}
          </span>
        )}
        <span>
          Showing <strong className="font-semibold text-foreground">{startRow}</strong> to{' '}
          <strong className="font-semibold text-foreground">{endRow}</strong> of{' '}
          <strong className="font-semibold text-foreground">{totalRows}</strong> records
        </span>
      </div>

      {/* Pagination controls & Page Size */}
      <div className="flex items-center gap-4">
        {pageSizeOptions.length > 1 && (
          <div className="flex items-center gap-2">
            <span>Rows:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => table.setPageSize(Number(val))}
            >
              <SelectTrigger className="h-8 w-[70px] text-xs">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className={cn(!table.getCanPreviousPage() && 'pointer-events-none opacity-40')}
              />
            </PaginationItem>

            {pages.map((p, idx) =>
              p === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={`page-${p}`}>
                  <PaginationLink
                    isActive={pageIndex + 1 === p}
                    onClick={() => table.setPageIndex(p - 1)}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className={cn(!table.getCanNextPage() && 'pointer-events-none opacity-40')}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
