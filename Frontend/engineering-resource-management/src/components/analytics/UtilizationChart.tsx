import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface UtilizationChartProps {
  data: { name: string; utilization: number }[];
}

const getChartOptions = (theme: string | undefined, data: UtilizationChartProps['data']): ApexOptions => ({
  chart: {
    type: 'bar',
    height: 350,
    toolbar: { show: false },
    background: 'transparent',
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: false,
      columnWidth: '60%',
    },
  },
  colors: ['#000000'], // This changes the bar color to black
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: data.map(d => d.name),
    labels: {
      style: {
        colors: theme === 'dark' ? '#9ca3af' : '#6b7280',
        fontSize: '12px',
      },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: {
        colors: theme === 'dark' ? '#9ca3af' : '#6b7280',
      },
      formatter: (val) => `${val}%`,
    },
  },
  grid: {
    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
    strokeDashArray: 4,
  },
  fill: {
    opacity: 1,
  },
  tooltip: {
    theme: theme === 'dark' ? 'dark' : 'light',
    y: {
      formatter: (val) => `${val}% Allocated`,
    },
  },
  annotations: {
    yaxis: [{
      y: 100,
      borderColor: '#f43f5e', 
      label: {
        borderColor: '#f43f5e',
        style: {
          color: '#fff',
          background: '#f43f5e',
        },
        text: 'Max Capacity',
        position: 'left',
        offsetX: 5,
      }
    }]
  },
  theme: {
    mode: theme === 'dark' ? 'dark' : 'light',
  }
});

export const UtilizationChart = ({ data }: UtilizationChartProps) => {
  const { theme } = useTheme();
  
  if (typeof window === 'undefined') {
    return <div>Loading Chart...</div>;
  }

  const series = [{
    name: 'Utilization',
    data: data.map(d => d.utilization),
  }];
  
  const options = getChartOptions(theme, data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Utilization</CardTitle>
        <CardDescription>A summary of current workload distribution.</CardDescription>
      </CardHeader>
      <CardContent>
        <Chart options={options} series={series} type="bar" height={325} />
      </CardContent>
    </Card>
  );
};