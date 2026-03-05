import { Clock3, Flag, Target } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { minutesSeconds } from "@/lib/utils";

interface StatsPanelProps {
  current: number;
  total: number;
  answeredCount: number;
  timerEnabled: boolean;
  timeLeft: number;
  scorePreview?: number;
}

export function StatsPanel({
  current,
  total,
  answeredCount,
  timerEnabled,
  timeLeft,
  scorePreview
}: StatsPanelProps) {
  const completion = total > 0 ? (answeredCount / total) * 100 : 0;

  return (
    <Card>
      <CardBody className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Quiz Stats</p>

        <div className="rounded-xl border border-borderc bg-soft p-3">
          <p className="text-xs text-text-secondary">Progress</p>
          <p className="mt-1 font-mono text-heading font-bold text-text">
            {current}/{total}
          </p>
          <div className="mt-3">
            <ProgressBar value={completion} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between rounded-lg border border-borderc bg-soft px-3 py-2 text-sm transition-all duration-200 ease-out-expo stagger-1">
            <span className="inline-flex items-center gap-2 text-text-secondary">
              <Flag className="h-4 w-4" />
              Answered
            </span>
            <span className="font-mono font-semibold text-text">{answeredCount}</span>
          </div>

          {timerEnabled ? (
            <div className="flex items-center justify-between rounded-lg border border-borderc bg-soft px-3 py-2 text-sm transition-all duration-200 ease-out-expo stagger-2">
              <span className="inline-flex items-center gap-2 text-text-secondary">
                <Clock3 className="h-4 w-4" />
                Time left
              </span>
              <span className="font-mono font-semibold text-text">{minutesSeconds(timeLeft)}</span>
            </div>
          ) : null}

          {typeof scorePreview === "number" ? (
            <div className="flex items-center justify-between rounded-lg border border-borderc bg-soft px-3 py-2 text-sm transition-all duration-200 ease-out-expo stagger-3">
              <span className="inline-flex items-center gap-2 text-text-secondary">
                <Target className="h-4 w-4" />
                Live score
              </span>
              <span className="font-mono font-semibold text-text">{scorePreview}%</span>
            </div>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
