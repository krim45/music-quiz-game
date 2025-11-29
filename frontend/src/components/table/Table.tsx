'use client';

import { useState } from 'react';
import clsx from 'clsx';

export type TableColumn<T> = {
  key: keyof T;
  label?: string;
  _style?: React.CSSProperties;
  sortable?: boolean;
  className?: string;
  render?: (ctx: { value: T[keyof T]; row: T; rowIndex: number; key: keyof T }) => React.ReactNode;
};

export type CustomCell<T> = {
  _style?: React.CSSProperties;
  className?: string;
  render?: (ctx: { value: T[keyof T]; row: T; rowIndex: number; key: keyof T }) => React.ReactNode;
};

export type TableRow<T> = T & {
  _style?: React.CSSProperties;
  _cell?: Partial<Record<keyof T, CustomCell<T>>>;
};

export type SortDirection = 'asc' | 'desc' | null;

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: TableRow<T>[];
  stickyHead?: boolean;
  className?: string;
}

export default function Table<T>({ className, columns, data, stickyHead = true }: TableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
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

  const sortedData = (() => {
    if (!sortKey || !sortDir) return data;

    return [...data].sort((a, b) => {
      const x = a[sortKey];
      const y = b[sortKey];

      if (x === y) return 0;
      if (sortDir === 'asc') return x > y ? 1 : -1;
      return x < y ? 1 : -1;
    });
  })();

  const sortIcon = (col: TableColumn<T>) => {
    if (!col.sortable) return null;
    if (sortKey !== col.key) return <span>↕</span>;
    if (sortDir === 'asc') return <span>↑</span>;
    if (sortDir === 'desc') return <span>↓</span>;
    return <span>↕</span>;
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
                  style={col._style}
                  className={clsx(
                    'h-10 cursor-pointer px-2 py-2 font-semibold select-none',
                    col.sortable && 'hover:bg-gray-700',
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
            {sortedData.map((row, rowIndex) => (
              <tr key={rowIndex} style={row._style} className='transition hover:bg-gray-900'>
                {columns.map((col) => {
                  const value = row[col.key];
                  const cell = row._cell?.[col.key];
                  const renderer = cell?.render ?? col.render;

                  return (
                    <td
                      key={String(col.key)}
                      style={{ ...col._style, ...cell?._style }}
                      className={clsx(
                        'truncate border border-gray-700 px-2 py-2 whitespace-pre',
                        col.className,
                        cell?.className
                      )}
                    >
                      {renderer ? renderer({ value, row, rowIndex, key: col.key }) : String(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
