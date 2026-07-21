import { architectureContracts, architectureLayers } from "@/data/redEyeEvidence";

export function ArchitectureMap() {
  return (
    <div className="architecture-evidence">
      <div className="architecture-map" aria-label="Red Eye production architecture">
        {architectureLayers.map((layer, index) => (
          <div className="architecture-layer" key={layer.label}>
            <div className="architecture-layer__label">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{layer.label}</strong>
            </div>
            <div className="architecture-layer__nodes">
              {layer.nodes.map((node) => (
                <span key={node}>{node}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="architecture-contracts">
        {architectureContracts.map((contract) => (
          <article key={contract.title}>
            <h3>{contract.title}</h3>
            <p>{contract.copy}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
