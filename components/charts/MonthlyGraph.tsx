'use client'

import { useId, useState } from 'react'
import { cn, formatCurrency } from '@/lib/utils'
import type { MonthlyActivity } from '@/types'

type SeriesKey = keyof Omit<MonthlyActivity, 'month'>

interface Series {
  key: SeriesKey
  label: string
  color: string
}

const allSeries: Series[] = [
  { key: 'toKids', label: 'To kids', color: 'var(--chart-1)' },
  { key: 'received', label: 'Received', color: 'var(--chart-2)' },
  { key: 'savings', label: 'Savings', color: 'var(--chart-4)' },
  { key: 'spending', label: 'Spending', color: 'var(--chart-5)' },
]

interface MonthlyGraphProps {
  data: MonthlyActivity[]
  visibleSeries?: SeriesKey[]
  height?: number
}

export function MonthlyGraph({ data, visibleSeries, height = 220 }: MonthlyGraphProps) {
  const gradientId = useId()
  const series = allSeries.filter((s) => !visibleSeries || visibleSeries.includes(s.key))
  const [hovered, setHovered] = useState<number | null>(null)

  const max = Math.max(1, ...data.flatMap((d) => series.map((s) => d[s.key])))
  const width = 720
  const padding = { top: 16, right: 8, bottom: 28, left: 8 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const step = chartWidth / data.length

  const points = (key: SeriesKey) =>
    data.map((d, i) => {
      const x = padding.left + step * i + step / 2
      const y = padding.top + chartHeight - (d[key] / max) * chartHeight
      return { x, y, value: d[key] }
    })

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </div>

      <div className="mt-3 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[560px]"
          role="img"
          aria-label="Monthly account activity chart"
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`${gradientId}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          {[0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={padding.left}
              x2={width - padding.right}
              y1={padding.top + chartHeight * (1 - t)}
              y2={padding.top + chartHeight * (1 - t)}
              stroke="var(--border)"
              strokeDasharray="4 4"
            />
          ))}

          {data.map((d, i) => (
            <text
              key={d.month}
              x={padding.left + step * i + step / 2}
              y={height - 6}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={11}
            >
              {d.month}
            </text>
          ))}

          {series.map((s) => {
            const pts = points(s.key)
            const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
            const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${padding.top + chartHeight} L ${pts[0].x} ${padding.top + chartHeight} Z`
            return (
              <g key={s.key}>
                <path d={areaPath} fill={`url(#${gradientId}-${s.key})`} />
                <path d={linePath} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                {pts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={hovered === i ? 5 : 3} fill={s.color} className="transition-all" />
                ))}
              </g>
            )
          })}

          {data.map((d, i) => (
            <rect
              key={d.month}
              x={padding.left + step * i}
              y={0}
              width={step}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
            />
          ))}

          {hovered !== null && (
            <line
              x1={padding.left + step * hovered + step / 2}
              x2={padding.left + step * hovered + step / 2}
              y1={padding.top}
              y2={padding.top + chartHeight}
              stroke="var(--muted-foreground)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}
        </svg>
      </div>

      {hovered !== null && (
        <div className="mt-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold text-foreground">{data[hovered].month}</p>
          <div className={cn('mt-1.5 grid gap-1.5', series.length > 2 ? 'grid-cols-2' : 'grid-cols-1')}>
            {series.map((s) => (
              <div key={s.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}: <span className="font-medium text-foreground">{formatCurrency(data[hovered][s.key])}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
