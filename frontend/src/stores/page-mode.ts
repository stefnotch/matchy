import { useStorage } from "@vueuse/core";
import { Option, Some, Result, Ok } from "oxide.ts";

// every user is a visitor and organizer at the same time and can access different views in the frontend
export type PageModes = "eventVisitor" | "eventOrganizer";
export const PageMode = useStorage<PageModes>("page-mode", "eventVisitor");

const n: Option<string> = Some("value");

const y: Result<string, null> = Ok("value");

async function asyncReturnsResult() {
  return Ok("value");
}

function returnsResult() {
  return Some("value");
}
asyncReturnsResult();
returnsResult();
Ok("value");
Some("value");
