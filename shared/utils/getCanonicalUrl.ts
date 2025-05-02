export default function(product: any): string {
  if (!product) return ''
  return [
    product?.name?.replace(/\s/g, "_")?.replace(/\W/g, ""),
    product?.id
  ].join('__')
}
