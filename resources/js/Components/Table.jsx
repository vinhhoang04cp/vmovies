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
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`px-4 py-3 text-left font-semibold text-gray-700 ${
                                    col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
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
                                        <span className="text-blue-600">
                                            {sortDir === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                        {rowAction && <th className="px-4 py-3 text-center font-semibold text-gray-700">Hành động</th>}
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
                                className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-3 text-gray-700">
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

