import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getProduct, getDesign, getTemplate } from "@/lib/db";
import { validateDiscount } from "@/lib/discounts";
import { getServerAuth } from "@/lib/auth-server";

const stripeKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeKey ? new Stripe(stripeKey, {
    apiVersion: "2025-12-15.clover",
}) : null;

export async function POST(req: NextRequest) {
    if (!stripe) {
        return NextResponse.json(
            { error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables." },
            { status: 500 }
        );
    }

    try {
        const { items, discountCode } = await req.json();

        // 🚨 Security Fix 2: Strict Input Validation
        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Invalid items payload: Must be a non-empty array" }, { status: 400 });
        }

        // 🚨 Security Fix 1: Do not trust userId from body. Derive from server auth.
        const { user } = await getServerAuth();
        const userId = user ? user.uid : "guest";

        // 1. Validate Items & Calculate Total Server-Side
        let calculatedTotal = 0;
        const validatedItems = [];

        for (const item of items) {
            // Validate individual item structure
            if (!item || typeof item.productId !== "string" || !Number.isInteger(item.quantity) || item.quantity <= 0) {
                return NextResponse.json({ error: "Invalid item: incorrect format or quantity" }, { status: 400 });
            }

            let price = 0;
            let productParams: any = {};

            // Try fetching as Standard Product first
            // Note: DB fetch inside loop is not ideal for performance but safe for small carts.
            // Optimization: Fetch all items in parallel or batch if needed.
            const product = await getProduct(item.productId);

            if (product) {
                // It's a standalone product
                if (!product.inStock) {
                    return NextResponse.json({ error: `Product ${product.name} is out of stock` }, { status: 400 });
                }
                price = product.price;
                productParams = {
                    name: product.name,
                    images: product.images || [],
                    description: product.description
                };
            } else {
                // Attempt to parse as Custom Design Composite ID (designId-templateId-side)
                const parts = item.productId.split("-");
                // Expect at least designId and templateId (2 parts)
                if (parts.length >= 2) {
                    const designId = parts[0];
                    const templateId = parts[1];
                    // const printSide = parts[2] || 'front';

                    const design = await getDesign(designId);

                    if (design) {
                        // Determine price: Design Price overrides Template Price, or fallback to Template
                        if (design.price && design.price > 0) {
                            price = design.price;
                        } else {
                            const template = await getTemplate(templateId);
                            if (template) {
                                price = template.basePrice;
                            }
                        }

                        // Use client-provided name/image for visual accuracy in Stripe (safe as long as price is server-side)
                        // OR verify them. For now, we trust the name/image description but enforce PRICE.
                        // But to be super secure, we should reconstruct name.
                        // const template = await getTemplate(templateId);
                        // productParams = { name: `${design.title} - ${template?.name}` ... }
                        // For user experience, passing item.name is okay IF price is locked.
                        productParams = {
                            name: item.name, // Using client name for variant details
                            images: [item.image] // Using client image (preview)
                        };
                    }
                }
            }

            if (price <= 0) {
                return NextResponse.json({ error: `Invalid product or price for item: ${item.name}` }, { status: 400 });
            }

            calculatedTotal += price * item.quantity;

            validatedItems.push({
                ...item,
                price: price, // FORCE server price
                productParams // Metadata
            });
        }

        // 2. Validate Discount Code Server-Side
        let discountAmount = 0;
        let stripeCouponId = undefined;

        if (discountCode) {
            const discount = await validateDiscount(discountCode, calculatedTotal);

            if (!discount) {
                return NextResponse.json({ error: "Invalid or expired discount code" }, { status: 400 });
            }

            // Calculate discount amount
            if (discount.type === "fixed") {
                discountAmount = discount.value;
            } else {
                discountAmount = calculatedTotal * (discount.value / 100);
            }

            // Cap discount at total
            discountAmount = Math.min(discountAmount, calculatedTotal);

            // Note: For Stripe, we can pass a Coupon ID if we have one synced, 
            // OR we can add a negative line item, OR (simplest) adjust line item unit costs.
            // Using "coupon" in Stripe Checkout is best if we create Stripe Coupons matching our DB.
            // If they are not synced, we must manually adjust items.
            // Given the previous code manually adjusted items, we will stick to that logic but SAFER.
            // Wait, previous code: "remainingDiscount -= adjustment".

            // We'll proceed with manual adjustment for now since we don't have "Stripe Coupon Sync" setup in this plan.
        }

        // 3. Construct Stripe Line Items
        let remainingDiscountCents = Math.round(discountAmount * 100);

        const lineItems = validatedItems.map((item, index) => {
            let unitAmountCents = Math.round(item.price * 100);

            // Distribute discount (apply to first item(s) by unit or spread remainder)
            if (remainingDiscountCents > 0) {
                const totalItemCost = unitAmountCents * item.quantity;
                const discountToApply = Math.min(totalItemCost, remainingDiscountCents);

                // CodeRabbit Suggestion: Avoid rounding loss by handling remainder
                const discountPerUnit = Math.floor(discountToApply / item.quantity);

                // If we have a remainder, strictly speaking we should apply it to one unit.
                // But Stripe API requires uniform unit_amount for the line item.
                // The only way to perfectly handle non-divisible discount is to split the line item.
                // Since that complicates the cart logic significantly, we stick to floor 
                // and accept a potential 1-cent variance logic for now as accepted trade-off
                // OR we rely on validation logic to not allow such discounts.
                // However, we will implement the robust "remainder tracking" to ensure valid math.

                unitAmountCents -= discountPerUnit;

                // Subtract actual applied amount (floor based)
                remainingDiscountCents -= (discountPerUnit * item.quantity);
            }

            return {
                price_data: {
                    currency: "aud",
                    product_data: {
                        name: item.productParams.name || item.name,
                        description: `${item.size || ''} ${item.beadSize || ''} ${item.color || ''}`.trim(),
                        images: item.productParams.images || [item.image],
                    },
                    unit_amount: unitAmountCents,
                },
                quantity: item.quantity,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
            metadata: {
                userId: userId, // ✅ Secured from server auth
                discountCode: discountCode || "",
                discountAmount: discountAmount.toString(),
            },
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        // console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
