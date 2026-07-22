import dynamic from "next/dynamic";
import type { DemoComponentKey } from "@/data/projects";
import { CatsCarouselDemo } from "@/components/demos/CatsCarouselDemo";
import { GenericMotionShowcase } from "@/components/demos/GenericMotionShowcase";
import { HeartbeatAnimationDemo } from "@/components/demos/HeartbeatAnimationDemo";
import { RedEyeAutomationDemo } from "@/components/demos/RedEyeAutomationDemo";
import { RedEyeWorkflowDemo } from "@/components/demos/RedEyeWorkflowDemo";

type DemoRendererProps = {
  component?: DemoComponentKey;
};

const NeuralMorphologyVisualizer = dynamic(
  () => import("@/components/demos/NeuralMorphologyVisualizer").then((module) => module.NeuralMorphologyVisualizer),
  { loading: () => <div className="neural-visualizer__module-loading">Preparing 3D viewer…</div> },
);

export function DemoRenderer({ component }: DemoRendererProps) {
  if (component === "red-eye-workflows") {
    return <RedEyeWorkflowDemo />;
  }

  if (component === "red-eye-automation") {
    return <RedEyeAutomationDemo />;
  }

  if (component === "cats-carousel") {
    return <CatsCarouselDemo />;
  }

  if (component === "heartbeat") {
    return <HeartbeatAnimationDemo />;
  }

  if (component === "neural-visualizer") {
    return <NeuralMorphologyVisualizer />;
  }

  if (component === "generic-motion") {
    return <GenericMotionShowcase />;
  }

  return null;
}
