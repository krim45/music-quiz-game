'use client';

import { useState } from 'react';
import clsx from 'clsx';

import Sort from '@/components/icon/Sort';
import SortAsc from '@/components/icon/SortAsc';
import SortDesc from '@/components/icon/SortDesc';

export type BaseColumn = {
  className?: string;
  label?: string | React.ReactNode;
  _style?: React.CSSProperties;
  sortable?: boolean;
};

export type DataColumn<T> = BaseColumn & {
  key: keyof T;
  accessor?: never;
  render?: (ctx: { row: TableRow<T>; key: keyof T; rowIndex: number }) => React.ReactNode;
};

export type CustomColumn<T> = BaseColumn & {
  key: string;
  accessor: (row: T) => React.ReactNode;
  render?: (ctx: { row: TableRow<T>; customKey: string; rowIndex: number }) => React.ReactNode;
};

export type TableColumn<T> = DataColumn<T> | CustomColumn<T>;

export type TableRow<T> = T & {
  _style?: React.CSSProperties;
  _cell?: Partial<Record<keyof T | string, CustomCell>>;
};

export type CustomCell = {
  _style?: React.CSSProperties;
  className?: string;
};

export type SortDirection = 'asc' | 'desc' | null;

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: TableRow<T>[];
  stickyHead?: boolean;
  className?: string;
  onRowClick?: (row: TableRow<T>, rowIndex: number) => void;
  children?: React.ReactNode;
}

export default function Table<T>({ className, columns, data, stickyHead = true, children, onRowClick }: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | keyof T | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const handleSort = (col: TableColumn<T>) => {
    if (!col.sortable) return;

    if (sortKey !== col.key) {
      setSortKey(col.key);
      setSortDir('asc');
    } else {
      setSortDir(sortDir === 'asc' ? 'desc' : sortDir === 'desc' ? null : 'asc');
    }
  };

  const getSortedData = () => {
    if (!sortKey || !sortDir) return data;

    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;

    return [...data].sort((a, b) => {
      const x = col.accessor ? col.accessor(a) : a[col.key];
      const y = col.accessor ? col.accessor(b) : b[col.key];

      if (x === y) return 0;
      if (x === null || x === undefined) return 1;
      if (y === null || y === undefined) return -1;

      if (sortDir === 'asc') {
        return x > y ? 1 : -1;
      }
      return x < y ? 1 : -1;
    });
  };

  const sortIcon = (col: TableColumn<T>) => {
    if (!col.sortable) return null;
    if (sortKey !== col.key || !sortDir) return <Sort />;
    if (sortDir === 'asc') return <SortAsc />;
    if (sortDir === 'desc') return <SortDesc />;
  };

  return (
    <div
      className={clsx(
        'relative w-full overflow-hidden rounded border border-gray-700 text-sm text-gray-200',
        className
      )}
    >
      <div className='scrollbar-custom h-full w-full overflow-auto'>
        <table className='w-full table-fixed border-collapse border-spacing-0'>
          <thead className={clsx('bg-gray-800', stickyHead && 'sticky top-0 z-20 shadow')}>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={clsx(
                    'h-10 px-2 py-2 font-semibold select-none',
                    col.sortable && 'cursor-pointer hover:bg-gray-700',
                    col.className
                  )}
                  onClick={() => handleSort(col)}
                >
                  <div className='flex justify-between gap-1'>
                    <span>{col.label}</span>
                    {sortIcon(col)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {getSortedData().map((row, rowIndex) => {
              if (!row) return null;

              return (
                <tr
                  key={rowIndex}
                  className={clsx('transition', onRowClick && 'cursor-pointer hover:bg-gray-800')}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {columns.map((col) => {
                    const cell = row._cell?.[col.key];
                    let display: React.ReactNode;

                    if (col.accessor) {
                      display = col.render ? col.render({ row, customKey: col.key, rowIndex }) : col.accessor(row);
                    } else {
                      display = col.render ? col.render({ row, key: col.key, rowIndex }) : String(row[col.key]);
                    }

                    return (
                      <td
                        key={String(col.key)}
                        style={{ ...col._style, ...cell?._style }}
                        className={clsx('truncate border border-gray-700 px-2 py-2 whitespace-pre', col.className)}
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {children}
    </div>
  );
}
