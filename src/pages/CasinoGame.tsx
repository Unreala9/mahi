import { useParams, Navigate } from "react-router-dom";
import { getGameComponent } from "@/data/gameFileMapping";

export default function CasinoGame() {
  const { slug } = useParams<{ slug: string }>();

  // Check if there's a specific component for this game
  if (slug) {
    const componentName = getGameComponent(slug);

    // If we have a specific component, redirect to its specific route
    if (componentName) {
      return <Navigate to={`/casino/${slug}`} replace />;
    }
  }

  // Otherwise use generic template
  return;
}
