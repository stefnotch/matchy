import { useStorage } from "@vueuse/core";

// every user is a visitor and organizer at the same time and can access different views in the frontend
export type PageModes = "eventVisitor" | "eventOrganizer";
export const PageMode = useStorage<PageModes>("page-mode", "eventVisitor");

async function cat() {
  return 1;
}
const cat1 = 3;
console.log(cat1);

console.log(cat());
const doSomething = async (a?: any) => {
  console.log();
};
const promise = new Promise((resolve, reject) => resolve("value"));
promise;

async function returnsPromise() {
  return "value";
}
returnsPromise().then(() => {});

Promise.reject("value").catch();

Promise.reject("value").finally();
Promise.reject("value");
