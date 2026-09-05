import { createFileRoute } from "@tanstack/react-router";
import { StudioApp } from "@/components/spriteforge/StudioApp";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <StudioApp />;
}
