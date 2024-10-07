import { ApexOptions } from "apexcharts";
import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";

export default function CircularProgress({ value = 0 }: { value: number }) {
  const colors = useMemo(
    () => ({
      red: "#EF4444",
      orange: "#F59E0B",
      green: "#10B981",
    }),
    [],
  );

  const getColors = useMemo(() => {
    if (value <= 30) return colors.red;
    if (value <= 70) return colors.orange;
    if (value > 70) return colors.green;
  }, [colors, value]);

  const series = useMemo(() => {
    return [value];
  }, [value]);

  const radialBarChart: ApexOptions = useMemo(
    () => ({
      colors: [getColors],
      fill: {
        opacity: 1,
      },
      chart: {
        type: "radialBar",
        sparkline: {
          enabled: true,
        },
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            background: "#EAECF0",
            strokeWidth: "100%",
            margin: 4,
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              show: true,
              offsetY: -0,
              fontSize: "20px",
              fontWeight: "600",
              color: "#101828",
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
              formatter: (data) => {
                // if (data + 150 >= 1000) return "> 1000%";
                if (data === 100) return data.toString();
                return data.toFixed(1);
              },
            },
          },
        },
      },
      stroke: {
        lineCap: "round",
      },
      grid: {
        padding: {
          top: -30,
          bottom: 15,
        },
      },
      labels: ["Collateral Ratio"],
    }),
    [getColors],
  );

  return (
    <ReactApexChart
      className="flex items-center justify-center"
      series={series}
      options={radialBarChart}
      type="radialBar"
      width={160}
    />
  );
}
