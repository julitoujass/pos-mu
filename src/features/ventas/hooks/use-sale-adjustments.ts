'use client'

import { useState } from 'react'
import { computeSaleTotals, exceedsEmployeeDiscountLimit, parseAdjustment } from '../pricing'
import type { AdjustmentType } from '../types'

/** Discount and surcharge inputs of the checkout, with the validated amounts and totals. */
export function useSaleAdjustments(subtotal: number, isAdmin: boolean, maxDiscountPercent: number) {
    const [discountType, setDiscountType] = useState<AdjustmentType>('porcentaje')
    const [discountInput, setDiscountInput] = useState('')
    const [surchargeType, setSurchargeType] = useState<AdjustmentType>('porcentaje')
    const [surchargeInput, setSurchargeInput] = useState('')

    const discount = parseAdjustment(discountType, discountInput)
    const surcharge = parseAdjustment(surchargeType, surchargeInput)
    const totals = computeSaleTotals(subtotal, discount.adjustment, surcharge.adjustment)
    // The server is authoritative; this only avoids a request that is sure to be rejected.
    const discountOverLimit = !isAdmin && exceedsEmployeeDiscountLimit(subtotal, discount.adjustment, maxDiscountPercent)
    const adjustmentsValid = !discount.error && !surcharge.error && !discountOverLimit

    return {
        discount,
        surcharge,
        totals,
        adjustmentsValid,
        /** Changes whenever any input changes (to invalidate the idempotency key). */
        inputsKey: `${discountType}:${discountInput}:${surchargeType}:${surchargeInput}`,
        resetAdjustments() {
            setDiscountInput('')
            setSurchargeInput('')
        },
        adjustments: {
            isAdmin,
            maxDiscountPercent,
            discountType,
            discountInput,
            discountError: discount.error ?? null,
            discountOverLimit,
            surchargeType,
            surchargeInput,
            surchargeError: surcharge.error ?? null,
            setDiscountType,
            setDiscountInput,
            setSurchargeType,
            setSurchargeInput,
        },
    }
}
