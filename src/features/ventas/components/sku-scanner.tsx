import React from 'react'
import { Barcode, Plus, ShoppingCart } from 'lucide-react'

type SkuScannerProps = {
    value: string
    inputRef: React.RefObject<HTMLInputElement | null>
    onChange: (value: string) => void
    onSubmit: (e: React.FormEvent) => void
}

/** Page header with the SKU input; works with a barcode scanner (types + Enter). */
export function SkuScanner({ value, inputRef, onChange, onSubmit }: SkuScannerProps) {
    return (
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
            <h1 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <ShoppingCart className="text-brand" />
                Nueva Venta
            </h1>
            <form onSubmit={onSubmit} className="relative">
                <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-brand/20 bg-background text-foreground text-lg focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all shadow-inner placeholder:text-muted-foreground/50"
                    placeholder="Escanear producto (SKU) y presionar Enter..."
                    autoComplete="off"
                />
                <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand text-white p-2 rounded-lg hover:bg-brand-hover transition-colors"
                >
                    <Plus size={20} />
                </button>
            </form>
        </div>
    )
}
