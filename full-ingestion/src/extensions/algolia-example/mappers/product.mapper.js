export default function map(product) {
  let mappedProduct = {};
  mappedProduct.objectID = product.id;
  mappedProduct.masterData = product.masterData;
  return mappedProduct;
}
