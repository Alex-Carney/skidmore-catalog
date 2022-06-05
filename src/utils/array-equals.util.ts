/**
 * Compares the entries of two arrays regardless of order
 * WARNING: Modifies inputs. The arrays will be sorted after this operation
 * @param arr1
 * @param arr2
 */
export function compareIgnoreOrder(arr1, arr2): boolean {
  return JSON.stringify(arr1.sort()) == JSON.stringify(arr2.sort())
}
