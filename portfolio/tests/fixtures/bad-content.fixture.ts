// Deliberately invalid: used by tests/unit/content-types.test.ts to prove the content types reject it.
import type { FocusCard, StackGroup } from "../../app/(portfolio)/content";

export const missingBody: FocusCard = { index: "07 — X", icon: "x", title: "No body", delay: "" };
export const wrongTagsType: StackGroup = { title: "Bad", delay: "", tags: "not-an-array" };
