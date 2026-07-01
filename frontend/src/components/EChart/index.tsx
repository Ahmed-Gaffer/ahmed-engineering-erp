import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { PieChart, BarChart, LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([PieChart, BarChart, LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

const vars = {
  navy800: 'var(--clr-navy-800)',
  gold500: 'var(--clr-gold-500)',
  green500: 'var(--clr-green-500)',
  amber500: 'var(--clr-amber-500)',
  red500: 'var(--clr-red-500)',
  teal500: 'var(--clr-teal-500)',
  navy600: 'var(--clr-navy-600)',
  gold400: 'var(--clr-gold-400)',
  border: 'var(--clr-border)',
  textSecondary: 'var(--clr-text-secondary)',
  textPrimary: 'var(--clr-text-primary)',
};

const palette = [vars.navy800, vars.gold500, vars.green500, vars.amber500, vars.red500, vars.navy600, vars.gold400, vars.teal500];

interface EChartProps {
  option: any;
  height?: number;
  [key: string]: any;
}

export default function EChart({ option, height = 280, ...rest }: EChartProps) {
  return (
    <ReactEChartsCore
      echarts={echarts}
      option={{
        color: palette,
        tooltip: {
          backgroundColor: 'var(--clr-surface)',
          borderColor: 'var(--clr-border)',
          borderWidth: 1,
          borderRadius: 8,
          padding: [10, 14],
          textStyle: { fontSize: 12, color: vars.textPrimary },
          ...option.tooltip,
        },
        grid: {
          containLabel: true,
          top: 24,
          bottom: 20,
          left: 10,
          right: 10,
          borderWidth: 0,
          ...option.grid,
        },
        xAxis: {
          axisLine: { lineStyle: { color: vars.border } },
          axisLabel: { color: vars.textSecondary, fontSize: 11 },
          axisTick: { alignWithLabel: true },
          splitLine: { show: false },
          ...option.xAxis,
        },
        yAxis: {
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: vars.textSecondary, fontSize: 11 },
          splitLine: { lineStyle: { color: vars.border, type: 'dashed' } },
          ...option.yAxis,
        },
        legend: {
          textStyle: { color: vars.textSecondary, fontSize: 11 },
          icon: 'roundRect',
          itemWidth: 10,
          itemHeight: 6,
          ...option.legend,
        },
        series: option.series,
        ...option,
      }}
      style={{ height }}
      {...rest}
    />
  );
}
