import "../styles/StatsPage.scss";
import React, { useState, useEffect } from "react";
import { Card } from "./ui/Card";
import { useTranslation } from "react-i18next";
import { FaClipboardList, FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line } from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

export default function StatsPage({ user }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, year: 0, total: 0 });
  const [weeklyData, setWeeklyData] = useState([]); // Holds posts for last 7 days
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
  
    const fetchPosts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/posts?ownerID=${encodeURIComponent(user.id)}`);
        if (!response.ok) {
          throw new Error(`Les posts ne sont pas disponibles`);
        }
  
        const result = await response.json();
        if (result.error) throw new Error(result.error);
  
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay;
        const oneYear = 365 * oneDay;
  
        let todayCount = 0, weekCount = 0, monthCount = 0, yearCount = 0;
        let last7Days = { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };
  
        result.data.forEach(post => {
          const postDate = new Date(post.created_at);
          const postTime = postDate.getTime();
          const diff = now - postTime;
  
          if (diff <= oneDay) todayCount++;
          if (diff <= oneWeek) weekCount++;
          if (diff <= oneMonth) monthCount++;
          if (diff <= oneYear) yearCount++;
  
          // Get the weekday name
          const postDay = postDate.toLocaleDateString('en-US', { weekday: 'long' });
  
          if (last7Days.hasOwnProperty(postDay)) {
            last7Days[postDay]++;
          }
        });
  
        // Convert last 7 days data into an array for the chart
        const weeklyChartData = Object.entries(last7Days).map(([day, count]) => ({
          name: day,
          posts: count
        }));
  
        setStats({ today: todayCount, week: weekCount, month: monthCount, year: yearCount, total: result.data.length });
        setWeeklyData(weeklyChartData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPosts();
  }, [user]);
  

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const pieData = [
    { name: t("Today"), value: stats.today },
    { name: t("This_week"), value: stats.week },
    { name: t("This_month"), value: stats.month },
    { name: t("This_year"), value: stats.year }
  ];

  return (
    <div className="stats-container">
      <div className="stats-cards">
        <Card className="stats-card">
          <FaClipboardList className="stats-icon" />
          <span className="text-label">{t('Total')}</span>
          <span className="text-value">{stats.total}</span>
        </Card>
        <Card className="stats-card">
          <FaCalendarDay className="stats-icon" />
          <span className="text-label">{t("Today")}</span>
          <span className="text-value">{stats.today}</span>
        </Card>
        <Card className="stats-card">
          <FaCalendarWeek className="stats-icon" />
          <span className="text-label">{t("This_week")}</span>
          <span className="text-value">{stats.week}</span>
        </Card>
        <Card className="stats-card">
          <FaCalendarAlt className="stats-icon" />
          <span className="text-label">{t("This_month")}</span>
          <span className="text-value">{stats.month}</span>
        </Card>
        <Card className="stats-card">
          <FaChartLine className="stats-icon" />
          <span className="text-label">{t("This_year")}</span>
          <span className="text-value">{stats.year}</span>
        </Card>
      </div>

      <div className="charts-cards-container">
        
        <Card className="chart-card">
          <p className="chart-title">{t("Posts_Distribution_Last_7_Days")}</p>
          <ResponsiveContainer width="100%" height={400}>
              <LineChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
    
                    <XAxis dataKey="name" />
                     <YAxis label={{ value: t("Number_of_Posts"), angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 5 }} />
                </LineChart>
            </ResponsiveContainer>   
        </Card>
        <Card className="chart-card">
          <p className="chart-title">{t("Posts_Distribution")}</p>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
