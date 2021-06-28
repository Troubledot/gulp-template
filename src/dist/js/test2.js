const sum = (num) => {
  let sumnum = 0

  for (let index = 0; index < num; index++) {
    sumnum += index
  }
  return sumnum
}
console.log(sum(12))
