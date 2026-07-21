export function HeroScene() {
  const nodes = [
    { label: "Workflow", title: "Checkout clarity", style: { left: "79%", top: "21%", "--node-color": "var(--gold)" } },
    { label: "Story", title: "Message structure", style: { left: "76%", top: "39%", "--node-color": "var(--teal)" } },
    { label: "System", title: "Operations tools", style: { left: "72%", top: "61%", "--node-color": "var(--coral)" } },
    { label: "Motion", title: "Interaction polish", style: { left: "82%", top: "73%", "--node-color": "var(--green)" } },
  ];

  return (
    <div aria-hidden="true" className="hero-scene">
      <span className="workflow-line" />
      <span className="workflow-line" />
      <span className="workflow-line" />
      {nodes.map((node, index) => (
        <div
          className="workflow-node"
          key={node.title}
          style={{ ...node.style, animationDelay: `${index * 420}ms` } as React.CSSProperties}
        >
          <span>{node.label}</span>
          <strong>{node.title}</strong>
        </div>
      ))}
    </div>
  );
}
