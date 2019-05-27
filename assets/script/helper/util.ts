import CONFIG from '../config'

/**
 * 下标转文字
 * @param index 
 */
export function transformFruit(index: number):number {
  let finalIndex = 0
  if(index > 0) {
    finalIndex = 7 - (index % 7)
  }else if(index < 0){
    finalIndex = Math.abs(index % 7)
  }
  return finalIndex
}

/**
 * 文字转下标
 * @param name 
 */
export function transformFruitString(name: string): number {
  let finalIndex = 0
  CONFIG.colIconArray.forEach((item, index) => {
    if(item === name) {
      finalIndex = index
      return false
    }
  })
  return finalIndex
}