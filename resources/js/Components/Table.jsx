import React from 'react';

/**
 * Table - Bảng dữ liệu có sắp xếp
 */
export default function Table({
    columns = [], // [{ key, label, sortable }]
    data = [],
    onSort,
    sortBy,
    sortDir,
    rowAction,
    loading = false,
}) {
    return (
        <div className="overflow-x-auto border-t-0 border-x-0 border-b-0 border-black rounded-none">
            <table className="min-w-full bg-white">
                <thead className="bg-white border-b-4 border-black">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`px-4 py-4 text-left font-extrabold text-black uppercase tracking-wider border-b border-black text-sm ${
                                    col.sortable ? 'cursor-pointer hover:bg-gray-200' : ''
                                }`}
                                onClick={() =>
                                    col.sortable &&
                                    onSort(
                                        col.key,
                                        sortBy === col.key && sortDir === 'asc' ? 'desc' : 'asc'
                                    )
                                }
                            >
                                <div className="flex items-center gap-2">
                                    {col.label}
                                    {col.sortable && sortBy === col.key && (
                                        <span className="text-black font-black">
                                            {sortDir === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                        {rowAction && <th className="px-4 py-4 text-center font-extrabold text-black uppercase tracking-wider border-b border-black text-sm">Hành động</th>}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length + (rowAction ? 1 : 0)} className="px-4 py-4 text-center text-gray-500">
                                Đang tải...
                            </td>
                        </tr>
                    ) : !Array.isArray(data) || data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + (rowAction ? 1 : 0)} className="px-4 py-4 text-center text-gray-500">
                                Không có dữ liệu
                            </td>
                        </tr>
                    ) : (
                        data.map((row, idx) => (
                            <tr
                                key={row.id || idx}
                                className={`border-b border-black ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-200 transition-colors uppercase text-sm tracking-wide font-semibold text-black`}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-4 border-r border-gray-200 last:border-r-0">
                                        {col.render
                                            ? col.render(row[col.key], row)
                                            : row[col.key]}
                                    </td>
                                ))}
                                {rowAction && (
                                    <td className="px-4 py-3 text-center">
                                        {rowAction(row)}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

