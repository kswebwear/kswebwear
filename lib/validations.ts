import { z } from "zod";

export const designSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    mainImage: z.string().url(),
    backImage: z.string().url().nullable().optional(),
    allowedColors: z.array(z.string()).optional(),
    colorImages: z.record(z.string(), z.union([z.string().url(), z.literal("")])).optional(),
    categories: z.array(z.string()),
    tags: z.array(z.string()),
    featured: z.boolean().optional(),
    hidden: z.boolean().optional(),
    printOptions: z.object({
        front: z.boolean(),
        back: z.boolean()
    }).optional(),
    price: z.number().min(0).nullable().optional(),
    compareAtPrice: z.number().min(0).nullable().optional(),
    sizeGuide: z.string().url().nullable().optional(),
    allowedDemographics: z.array(z.enum(['Men', 'Women', 'Kids', 'Infants'])).optional(),
    createdAt: z.number()
});

export const productTemplateSchema = z.object({
    id: z.string(),
    name: z.string(),
    basePrice: z.number(),
    description: z.string(),
    colors: z.array(z.object({
        name: z.string(),
        hex: z.string(),
        image: z.string().optional()
    })),
    sizes: z.array(z.string()),
    category: z.string(),
    sizeGuide: z.string().optional(),
    demographic: z.enum(['Men', 'Women', 'Kids', 'Infants', 'Unisex']).optional()
});
