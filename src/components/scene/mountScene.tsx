import { createRoot } from 'react-dom/client';
import { SceneRoot } from '@/components/scene/SceneRoot';

let rootInstance: ReturnType<typeof createRoot> | null = null;

export function mountParticleScene(container: HTMLElement) {
  if (rootInstance) {
    return;
  }
  rootInstance = createRoot(container);
  rootInstance.render(<SceneRoot />);
}
