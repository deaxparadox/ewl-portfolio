"use client";

import { useEffect } from "react";
import { initScrollStack } from "../_lib/scrollStack";

// Renders nothing: attaches the scroll-linked stacking to the server-rendered sections.
export function ScrollStack() {
  useEffect(() => initScrollStack(document, window), []);
  return null;
}
