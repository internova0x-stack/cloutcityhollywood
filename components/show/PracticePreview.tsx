"use client";

import { useRouter } from "next/navigation";
import { PracticeShow, type PracticeOptions } from "./PracticeShow";

/** The development preview of a practice run (/preview/practice); quitting goes back to the home preview. */
export function PracticePreview({ options, auto }: { options: PracticeOptions; auto: boolean }) {
  const router = useRouter();
  return <PracticeShow options={options} auto={auto} onExit={() => router.push("/preview/home")} />;
}
