// export function source () {
//   (function constructor () {
//     console.log('source')
//   })()
// }

export class Source {
  constructor () {
    console.log('source')
    this.abc()
  }
  abc () {
    alert('4567894')
  }
}