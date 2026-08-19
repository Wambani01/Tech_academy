/**
 * Enrolments over the last six months.
 *
 * A real chart, not the striped placeholder from the prototype. Inline SVG so
 * it renders on the server with no charting dependency.
 */
export function EnrolmentChart({
  data,
}: {
  data: Array<{ label: string; value: number }>
}) {
  const width = 620
  const height = 220
  const padX = 34
  const padY = 20
  const max = Math.max(1, ...data.map((d) => d.value))
  const step = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0
  const y = (v: number) => height - padY - (v / max) * (height - padY * 2)

  const points = data.map((d, i) => [padX + i * step, y(d.value)] as const)
  const line = points.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px},${py}`).join(' ')
  const area = `${line} L${points.at(-1)?.[0] ?? padX},${height - padY} L${padX},${height - padY} Z`

  const ticks = [0, max / 2, max]

  if (data.every((d) => d.value === 0)) {
    return (
      <div className="h-[220px] rounded-xl border border-line-soft flex items-center justify-center text-meta text-muted">
        No enrolments recorded yet.
      </div>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-[220px]"
      role="img"
      aria-label={`Enrolments over the last six months: ${data
        .map((d) => `${d.label} ${d.value}`)
        .join(', ')}`}
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={padX}
            x2={width - padX}
            y1={y(t)}
            y2={y(t)}
            stroke="rgba(15,32,25,.08)"
            strokeWidth={1}
          />
          <text x={4} y={y(t) + 4} fontSize={10} fill="#8A968E">
            {Math.round(t)}
          </text>
        </g>
      ))}

      <path d={area} fill="rgba(242,169,59,.16)" />
      <path d={line} fill="none" stroke="#F2A93B" strokeWidth={2.5} strokeLinejoin="round" />

      {points.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={3.5} fill="#0F2019" />
      ))}

      {data.map((d, i) => (
        <text
          key={d.label}
          x={padX + i * step}
          y={height - 4}
          fontSize={10.5}
          fill="#465148"
          textAnchor="middle"
        >
          {d.label}
        </text>
      ))}
    </svg>
  )
}
