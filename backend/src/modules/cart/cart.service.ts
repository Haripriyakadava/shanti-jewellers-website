import { cartRepository } from "./cart.repository";
import { AddToCartInput, UpdateCartItemInput } from "./cart.types";
import { AppError } from "../../utils/AppError";
import { productValidationService } from "../../services/product-validation.service";

export class CartService {
  async getCart(tenantId: string, customerId: string) {
    const cart = await cartRepository.getCart(tenantId, customerId);
    return cart || { items: [] };
  }

  async addToCart(tenantId: string, customerId: string, data: AddToCartInput) {
    console.log("[addToCart] Incoming request:", { tenantId, customerId, data });
    try {
      // Validate product and stock
      console.log(`[addToCart] Fetching product from Supabase: ${data.productId}`);
      const product = await productValidationService.getValidProduct(tenantId, data.productId);
      
      console.log(`[addToCart] Product validation result: Found`);
      
      // getValidProduct already checks for existence and isActive.
      // We just need to check stock_quantity if it exists.
      if ((product as any).stock_quantity !== undefined && (product as any).stock_quantity !== null && data.quantity > (product as any).stock_quantity) {
        throw new AppError(`Only ${(product as any).stock_quantity} items in stock`, 400);
      }

      console.log(`[addToCart] Calling findOrCreateCart...`);
      const cart = await cartRepository.findOrCreateCart(tenantId, customerId);
      console.log(`[addToCart] Cart found/created:`, cart.id);

      console.log(`[addToCart] Looking up existing cart item for product: ${product.id}`);
      const existingItem = await cartRepository.getCartItem(cart.id, String(product.id));
      console.log(`[addToCart] Existing item lookup result:`, existingItem ? "Found" : "Not found");

      if (existingItem) {
        console.log(`[addToCart] Updating existing item...`);
        // Merge duplicate
        const newQuantity = existingItem.quantity + data.quantity;
        if ((product as any).stock_quantity !== null && newQuantity > (product as any).stock_quantity) {
          throw new AppError(`Cannot add more. Only ${(product as any).stock_quantity} items in stock`, 400);
        }
        
        const computedTotal = (product as any).total_amount ? Number((product as any).total_amount) : (Number((product as any).base_price || (product as any).price || 0) + Number((product as any).making_charge || 0) + Number((product as any).stone_amount || 0) + Number((product as any).gst_amount || 0) - Number((product as any).discount_amount || 0));
        const newTotalPrice = computedTotal * newQuantity;
        const updatedItem = await cartRepository.updateCartItem(existingItem.id, newQuantity, newTotalPrice);
        console.log(`[addToCart] Existing item updated successfully:`, updatedItem.id);
        return updatedItem;
      }

      console.log(`[addToCart] Creating new CartItem...`);
      const computedTotal = (product as any).total_amount ? Number((product as any).total_amount) : (Number((product as any).base_price || (product as any).price || 0) + Number((product as any).making_charge || 0) + Number((product as any).stone_amount || 0) + Number((product as any).gst_amount || 0) - Number((product as any).discount_amount || 0));
      const newTotalPrice = computedTotal * data.quantity;
      const newItem = await cartRepository.addCartItem({
        cartId: cart.id,
        tenantId: cart.tenantId,
        productId: String(product.id),
        productVariantId: null,
        productName: (product as any).product_name || (product as any).name || "Unknown Product",
        productImage: (product as any).image_url || (product as any).image || null,
        sku: (product as any).sku || null,
        metalType: (product as any).metaltype || (product as any).metal || null,
        grossWeight: (product as any).gross_weight ? Number((product as any).gross_weight) : null,
        netWeight: (product as any).net_weight ? Number((product as any).net_weight) : null,
        stoneWeight: (product as any).stone_weight ? Number((product as any).stone_weight) : null,
        quantity: data.quantity,
        unitPrice: Number((product as any).base_price || (product as any).price || 0),
        makingCharge: Number((product as any).making_charge || 0),
        stoneAmount: Number((product as any).stone_amount || 0),
        gstPercentage: Number((product as any).gst_percentage || 0),
        gstAmount: Number((product as any).gst_amount || 0),
        discountAmount: Number((product as any).discount_amount || 0),
        totalPrice: newTotalPrice,
      });
      console.log(`[addToCart] New CartItem created successfully:`, newItem.id);
      return newItem;
    } catch (error: any) {
      console.error("[addToCart] Error occurred:");
      console.error(error.stack || error);
      throw error;
    }
  }

  async updateCartItem(tenantId: string, customerId: string, cartItemId: string, data: UpdateCartItemInput) {
    const cartItem = await cartRepository.getCartItemById(cartItemId);
    if (!cartItem || cartItem.cart.customerId !== customerId) {
      throw new AppError("Cart item not found", 404);
    }

    const product = await productValidationService.getValidProduct(tenantId, cartItem.productId);

    if ((product as any).stock_quantity !== undefined && (product as any).stock_quantity !== null && data.quantity > (product as any).stock_quantity) {
      throw new AppError(`Only ${(product as any).stock_quantity} items in stock`, 400);
    }

    const perUnitTotal = Number(cartItem.unitPrice) + Number(cartItem.makingCharge) + Number(cartItem.stoneAmount) + Number(cartItem.gstAmount) - Number(cartItem.discountAmount);
    const newTotalPrice = perUnitTotal * data.quantity;

    return await cartRepository.updateCartItem(cartItemId, data.quantity, newTotalPrice);
  }

  async removeCartItem(tenantId: string, customerId: string, cartItemId: string) {
    const cartItem = await cartRepository.getCartItemById(cartItemId);
    if (!cartItem || cartItem.cart.customerId !== customerId) {
      throw new AppError("Cart item not found", 404);
    }

    await cartRepository.removeCartItem(cartItemId);
    return true;
  }

  async clearCart(tenantId: string, customerId: string) {
    const cart = await cartRepository.getCart(tenantId, customerId);
    if (cart) {
      await cartRepository.clearCart(cart.id);
    }
    return true;
  }

  async getCartCount(tenantId: string, customerId: string) {
    // Ensuring cart belongs to tenant by checking if it exists, though customerId is unique
    return await cartRepository.getCartCount(customerId);
  }
}

export const cartService = new CartService();