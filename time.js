// function addHours(date, hours) {
//   date.setTime(date.getTime() + hours * 60 * 60 * 1000);

//   return date;
// }

// // ✅ Add 1 hour to the current date
// const result1 = addHours(new Date(), 1);
// console.log(result1); // 👉️ 2023-01-13T12:59:22.582Z

// // ✅ Add 2 hours to a different date
// const date = new Date('2024-03-14T18:30:05.000Z');

// const result2 = addHours(date, 2);
// console.log(result2); // 👉️ 2024-03-14T20:30:05.000Z



const new1 = function() {return +new Date() + 1*60*60*1000}


const n = new1();
console.log(new Date(1678615963447));