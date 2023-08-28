export default function map(product) {
  let mappedProduct = {};
  let categories = product.obj.masterData.current.categories.map((category) => {
    return {
      key: category.obj.key,
      name: category.obj.name,
      slug: category.obj.slug,
    };
  });

  mappedProduct.objectID = product.id;
  mappedProduct.productType = product.obj.productType.obj;
  mappedProduct.taxCategory = product.obj.taxCategory.obj;
  mappedProduct.masterData = {
    current: {
      categories,
      name: product.obj.masterData.current.name,
      slug: product.obj.masterData.current.slug,
      metaTitle: product.obj.masterData.current.metaTitle,
    },
  };
  return mappedProduct;
}
