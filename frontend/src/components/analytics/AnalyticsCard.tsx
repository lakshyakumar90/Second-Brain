import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  growth?: number;
  loading?: boolean;
  className?: string;
  description?: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  icon,
  growth,
  loading = false,
  className,
  description,
}) => {
  const getGrowthIndicator = (growthValue: number) => {
    if (growthValue > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (growthValue < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getGrowthColor = (growthValue: number) => {
    if (growthValue > 0) return 'text-green-600';
    if (growthValue < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {growth !== undefined && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {getGrowthIndicator(growth)}
                <span className={getGrowthColor(growth)}>
                  {growth > 0 ? '+' : ''}{growth.toFixed(1)}% from last period
                </span>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
