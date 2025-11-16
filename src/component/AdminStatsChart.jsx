"use client";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        precision: 0,
      },
    },
  },
};

export default function AdminStatsChart({ stats }) {
  const safeStats = stats || {
    laporanMasuk: 0,
    sudahDiselesaikan: 0,
    wilayahDiperbaiki: 0,
  };

  const data = {
    labels: ["Laporan Masuk", "Selesai", "Wilayah"],
    datasets: [
      {
        label: "Jumlah",
        data: [
          safeStats.laporanMasuk,
          safeStats.sudahDiselesaikan,
          safeStats.wilayahDiperbaiki,
        ],
        backgroundColor: ["#3a6bb1", "#22c55e", "#a855f7"],
        borderRadius: 5,
        borderWidth: 0,
      },
    ],
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      {}
      <Bar options={options} data={data} />
    </div>
  );
}
