"use client";

import { GrainGradient } from "@paper-design/shaders-react";

// AGORA theme: black base with lime (#AAFF00) accent tones
export function GradientBackground() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <GrainGradient
        style={{ height: "100%", width: "100%", display: "block" }}
        colorBack="hsl(0, 0%, 0%)"
        softness={0.8}
        intensity={0.7}
        noise={0.12}
        shape="corners"
        offsetX={0}
        offsetY={0}
        scale={1}
        rotation={0}
        speed={0.5}
        colors={[
          "#AAFF00",   // full AGORA lime
          "#44aa00",   // mid green
          "#1a3300",   // dark forest — keeps it moody not neon
        ]}
      />
    </div>
  );
}
