/** UTF-8 byte order mark: makes Excel open the file with the right encoding. */
export const CSV_BOM = '﻿'

const SEPARATOR = ';'
const LINE_BREAK = '\r\n'

export type CsvCell = string | number | null | undefined

export type CsvColumn<T> = {
    header: string
    value: (row: T) => CsvCell
}

function formatCell(cell: CsvCell): string {
    if (cell === null || cell === undefined) return ''
    // es-AR decimal comma; no thousands separator so spreadsheets parse it as a number.
    const text = typeof cell === 'number' ? String(cell).replace('.', ',') : cell
    return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Builds an Excel-friendly (es-AR) CSV: `;` separator, UTF-8 BOM, CRLF line breaks. */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
    const header = columns.map(c => formatCell(c.header)).join(SEPARATOR)
    const lines = rows.map(row => columns.map(c => formatCell(c.value(row))).join(SEPARATOR))
    return CSV_BOM + [header, ...lines].join(LINE_BREAK)
}

/** Triggers a browser download of `csv` as `filename`. */
export function downloadCsv(filename: string, csv: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}
