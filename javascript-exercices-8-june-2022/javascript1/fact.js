function fact(n) {
  if (n < 0) {
    throw "The parameter must be positive !"
  }
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

function testFact() {
  const input = prompt("Please write your number.");
  const number = parseInt(input);
  console.log(fact(number));
}

function apply(f, arr) {
  const res = [];
  for (const el of arr) {
    res.push(f(el));
  }
  return res;
}

function testApply() {
  console.log(apply(fact, [1, 2, 3, 4, 5, 6]));
}