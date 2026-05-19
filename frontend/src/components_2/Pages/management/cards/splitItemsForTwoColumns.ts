/**
 * Splits a list into two columns in row-major order (even indices → left, odd → right).
 */
export function splitItemsForTwoColumns<T>(items: T[]): {
  left: T[]
  right: T[]
} {
  const left: T[] = []
  const right: T[] = []
  items.forEach((item, index) => {
    if (index % 2 === 0) {
      left.push(item)
    } else {
      right.push(item)
    }
  })
  return { left, right }
}
