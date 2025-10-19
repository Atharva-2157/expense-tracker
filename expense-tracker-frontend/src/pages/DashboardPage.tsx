import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";
import axiosClient from "../api/axiosClient";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

interface Expense {
  id: number;
  title: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const options = {
  responsive: true,
  plugins: {
    legend: { position: "top" as const },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
    x: {
      ticks: {
        autoSkip: false,
      },
    },
  },
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);

  const [dailyData, setDailyData] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [categoryData, setCategoryData] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [weeklyData, setWeeklyData] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });

  const fetchLast30DaysExpenses = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const last30 = new Date(today);
      last30.setDate(today.getDate() - 30);
      const startDate = last30.toISOString();
      const dateFilter = `date>${startDate}`;

      const res = await axiosClient.get<ApiResponse<PagedResponse<Expense>>>(
        "/api/expense-tracker/expenses",
        { params: { page: 0, size: 1000, filter: dateFilter }, withCredentials: true }
      );

      const data = res.data.data.content;
      processChartData(data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (expenses: Expense[]) => {
    const dailyMap: Record<string, number> = {};
    const categoryMap: Record<string, number> = {};
    const weeklyMap: Record<string, number> = {};

    expenses.forEach((exp) => {
      const dateObj = new Date(exp.date);
      const dateStr = dateObj.toLocaleDateString();
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + exp.amount;
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;

      const weekNumber = getWeekNumber(dateObj);
      weeklyMap[`Week ${weekNumber}`] = (weeklyMap[`Week ${weekNumber}`] || 0) + exp.amount;
    });

    const sortedDaily = Object.keys(dailyMap).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    setDailyData({ labels: sortedDaily, data: sortedDaily.map((d) => dailyMap[d]) });

    const categories = Object.keys(categoryMap);
    setCategoryData({ labels: categories, data: categories.map((c) => categoryMap[c]) });

    const sortedWeeks = Object.keys(weeklyMap).sort();
    setWeeklyData({ labels: sortedWeeks, data: sortedWeeks.map((w) => weeklyMap[w]) });
  };

  const getWeekNumber = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = (date.getTime() - start.getTime()) + ((start.getDay() + 6) % 7) * 86400000;
    return Math.floor(diff / (7 * 86400000)) + 1;
  };

  useEffect(() => {
    fetchLast30DaysExpenses();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h4" mb={3}>
        Expense Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">Daily Expenses (Last 30 Days)</Typography>
            <Line
              data={{
                labels: dailyData.labels,
                datasets: [
                  {
                    label: "Amount (₹)",
                    data: dailyData.data,
                    borderColor: "rgba(75,192,192,1)",
                    backgroundColor: "rgba(75,192,192,0.2)",
                    tension: 0.2,
                  },
                ],
              }}
              options={options}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} >
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">Category-wise Expenses</Typography>
            <Pie
              data={{
                labels: categoryData.labels,
                datasets: [
                  {
                    data: categoryData.data,
                    backgroundColor: [
                      "#FF6384",
                      "#36A2EB",
                      "#FFCE56",
                      "#4BC0C0",
                      "#9966FF",
                      "#FF9F40",
                    ],
                  },
                ],
              }}
              options={options}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} >
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">Weekly Expenses (Last 30 Days)</Typography>
            <Bar
              data={{
                labels: weeklyData.labels,
                datasets: [
                  {
                    label: "Amount (₹)",
                    data: weeklyData.data,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                  },
                ],
              }}
              options={options}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
