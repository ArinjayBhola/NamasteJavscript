// {
//   const p1 = new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve("Promise value resolved");
//     }, 2000);
//   });
//   const p2 = new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve("Promise value resolved");
//     }, 1000);
//   });

//   const p3 = new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve("Promise value resolved");
//     }, 3000);
//   });
//   const p4 = new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve("Promise value resolved");
//     }, 2000);
//   });

//   async function handlePromise() {
//     console.log("hello world");
//     const val = await p1;
//     console.log("object");
//     console.log(val);

//     const val2 = await p2;
//     console.log("object");
//     console.log(val2);
//   }
//   handlePromise();
// }
// function getData() {
//   p.then((res) => console.log(res));
//  console.log("object");
// }
// getData();
