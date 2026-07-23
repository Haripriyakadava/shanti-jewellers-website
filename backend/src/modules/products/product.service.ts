import { productRepository } from "./product.repository";

export const getProducts = async (tenantId: string, query: any) => {
  return await productRepository.getProducts(tenantId, query);
};

export const getProductDetails = async (tenantId: string, productId: string) => {
  return await productRepository.getProductDetails(tenantId, productId);
};
