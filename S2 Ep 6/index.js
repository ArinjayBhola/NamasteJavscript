"use strict";
function hello() {
  console.log(this);
}
window.hello();

const obj = {
  a: 13,
  printA: function () {
    console.log(this.a);
  },
};
obj.printA();

const obj2 = {
  a: 768,
};
obj.printA.call(obj2);

const obj3 = {
  a: 145,
  x: () => {
    console.log(this);
  },
};
obj3.x();

const obj4 = {
  a: 98,
  x: function () {
    const y = () => {
      console.log(this);
    };
    y();
  },
};

obj4.x();
