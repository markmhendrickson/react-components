import { Badge } from './ui/badge'
import { cn } from '../lib/utils'
import { humanizeWorkflowStatus, workflowStatusBadgeClassName } from '../lib/humanize'

interface Props {
  value: unknown
  className?: string
}

export default function WorkflowStatusBadge({ value, className }: Props) {
  const raw = value == null || value === '' ? null : String(value).trim()
  if (!raw) {
    return <span className="text-muted-foreground text-sm">—</span>
  }
  const label = humanizeWorkflowStatus(raw)
  return (
    <Badge
      variant="outline"
      className={cn('font-medium normal-case border-0', workflowStatusBadgeClassName(raw), className)}
      title={raw}
    >
      {label}
    </Badge>
  )
}
