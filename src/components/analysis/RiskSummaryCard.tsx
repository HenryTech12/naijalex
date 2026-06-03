import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ClauseAnalysis, RiskLevel } from '../../types';

interface RiskSummaryCardProps {
  clauses: ClauseAnalysis[];
  overallRisk: RiskLevel;
  summary: string;
  processingTimeMs: number;
}

const SEVERITY_COLORS = {
  Critical: '#E24B4A',
  Caution: '#BA7517',
  Standard: '#1D9E75',
};

export const RiskSummaryCard: React.FC<RiskSummaryCardProps> = ({
  clauses,
  overallRisk,
  summary,
  processingTimeMs,
}) => {
  // ADD THIS LINE
  const safeClauses = clauses ?? [];

  const counts = safeClauses.reduce(
    (acc, c) => {
      acc[c.severity] = (acc[c.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const data = Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    color: SEVERITY_COLORS[name as keyof typeof SEVERITY_COLORS] || '#ccc',
  }));

  // Then replace clauses.length with safeClauses.length in the JSX:
  // <p className="text-2xl font-bold text-brand-textPrimary">{safeClauses.length}</p>
  const riskBg: Record<RiskLevel, string> = {
    High: '#FFF0F0',
    Medium: '#FFF8ED',
    Low: '#F0FBF6',
  };
  const riskText: Record<RiskLevel, string> = {
    High: '#E24B4A',
    Medium: '#BA7517',
    Low: '#1D9E75',
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
      <div
        className="p-4 border-b border-brand-border"
        style={{ backgroundColor: riskBg[overallRisk] }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brand-textSecondary">Overall Risk Level</p>
            <p className="text-3xl font-bold mt-1" style={{ color: riskText[overallRisk] }}>
              {overallRisk.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-brand-textSecondary">Analyzed in</p>
            <p className="text-lg font-bold text-brand-textPrimary">
              {(processingTimeMs / 1000).toFixed(1)}s
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-brand-bg rounded-xl">
            <p className="text-2xl font-bold text-brand-textPrimary">{safeClauses.length}</p>
            <p className="text-xs text-brand-textSecondary mt-1">Total Clauses</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-xl">
            <p className="text-2xl font-bold text-danger">{counts['Critical'] || 0}</p>
            <p className="text-xs text-brand-textSecondary mt-1">Critical Issues</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-xl">
            <p className="text-2xl font-bold text-warning">{counts['Caution'] || 0}</p>
            <p className="text-xs text-brand-textSecondary mt-1">Caution Issues</p>
          </div>
        </div>

        {data.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [value, name]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E4E0' }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#5F5E5A', fontSize: '12px' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <p className="text-sm text-brand-textSecondary leading-relaxed mt-4">{summary}</p>
      </div>
    </div>
  );
};
