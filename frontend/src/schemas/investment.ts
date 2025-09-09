import { z } from 'zod';

// Schema for individual investment data
export const InvestmentItemSchema = z.object({
  asset_type: z.string().min(1, "El tipo de activo es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  value: z.number().positive("El valor debe ser positivo"),
  depreciation: z.number().nonnegative("La depreciación no puede ser negativa").optional(),
  location: z.string().min(1, "La ubicación es requerida"),
  net_value: z.number().optional(),
  age_years: z.number().nonnegative("La edad no puede ser negativa").optional(),
});

// Schema for array of investments
export const InvestmentDataSchema = z.array(InvestmentItemSchema);

// Type inference
export type InvestmentItem = z.infer<typeof InvestmentItemSchema>;
export type InvestmentData = z.infer<typeof InvestmentDataSchema>;