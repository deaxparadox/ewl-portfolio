"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

// Empty on the server (like the original, which fills #year with JS), the current year on the client.
export function Year() {
  const year = useSyncExternalStore(noop, () => String(new Date().getFullYear()), () => "");
  return <span id="year">{year}</span>;
}
