// src/pages/Dashboard.js
import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { dashboardAPI } from "../utils/api";
import CalendarModal from "../components/modals/CalendarModal";
import ExpenseModal from "../components/modals/ExpenseModal";
import { formatDate } from "../utils/khmerUtils";

const STATUS_BADGE = {
  planned: "badge-planned",
  ongoing: "badge-ongoing",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
};
const CATEGORY_COLORS = {
  food: "#f97316",
  coffee: "#92400e",
  water: "#0ea5e9",
  transport: "#8b5cf6",
  clothing: "#ec4899",
  health: "#ef4444",
  entertainment: "#f59e0b",
  education: "#10b981",
  utilities: "#6366f1",
  shopping: "#14b8a6",
  other: "#94a3b8",
};

// Month names in English and Khmer
const MONTH_NAMES_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MONTH_NAMES_KH = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

function MonthYearNav({ month, year, onPrev, onNext, language }) {
  const monthLabel =
    language === "kh" ? MONTH_NAMES_KH[month] : MONTH_NAMES_EN[month];

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onPrev}
        aria-label="Previous month"
        style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "3px 9px",
          cursor: "pointer",
          color: "var(--text-secondary)",
          fontWeight: "bold",
          fontSize: "14px",
          lineHeight: 1,
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--accent, #0ea5e9)";
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--bg-primary)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        ‹
      </button>

      <div
        style={{
          minWidth: "108px",
          textAlign: "center",
          fontWeight: "700",
          fontSize: "13px",
          color: "var(--text-primary)",
          background: "var(--bg-primary)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "3px 10px",
          userSelect: "none",
        }}
      >
        {monthLabel} {year}
      </div>

      <button
        onClick={onNext}
        aria-label="Next month"
        style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "3px 9px",
          cursor: "pointer",
          color: "var(--text-secondary)",
          fontWeight: "bold",
          fontSize: "14px",
          lineHeight: 1,
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--accent, #0ea5e9)";
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--bg-primary)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        ›
      </button>
    </div>
  );
}

function PlanCard({ item, icon, t, formatAmount, language }) {
  const progressField =
    item.savedAmount !== undefined
      ? item.savedAmount
      : item.givenAmount !== undefined
        ? item.givenAmount
        : item.paidAmount || 0;
  const progress =
    item.targetAmount > 0
      ? Math.min(100, (progressField / item.targetAmount) * 100)
      : 0;
  return (
    <div
      className="p-3 rounded-xl"
      style={{
        background: "var(--bg-primary)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-start gap-2 mb-2">
        <span className="text-base shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold text-xs truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {item.title}
          </div>
          <span
            className={`badge ${STATUS_BADGE[item.status] || "badge-planned"} mt-0.5`}
            style={{ fontSize: "9px" }}
          >
            {t(item.status)}
          </span>
        </div>
        <div
          className="text-xs font-bold shrink-0"
          style={{ color: "#0ea5e9" }}
        >
          {formatAmount(item.amountUSD)}
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div
        className="text-xs mt-1 text-right"
        style={{ color: "var(--text-secondary)" }}
      >
        {progress.toFixed(0)}%
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t, formatAmount, formatNum, language } = useApp();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calModal, setCalModal] = useState({ open: false, view: "monthly" });
  const [addExpense, setAddExpense] = useState(false);

  // Month/Year navigation state – default to current month/year
  const today = new Date();
  const [navMonth, setNavMonth] = useState(today.getMonth()); // 0-indexed
  const [navYear, setNavYear] = useState(today.getFullYear());

  // True when the nav is pointing at the current month (for data refresh cue)
  const isCurrentMonth =
    navMonth === today.getMonth() && navYear === today.getFullYear();

  const handlePrevMonth = () => {
    setNavMonth((prev) => {
      if (prev === 0) {
        setNavYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setNavMonth((prev) => {
      if (prev === 11) {
        setNavYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Pass month (1-indexed) and year so the API can return data for that period.
      // Falls back gracefully if the API doesn't support these params yet.
      const res = await dashboardAPI.getSummary({
        month: navMonth + 1,
        year: navYear,
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navMonth, navYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading)
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    );

  const stats = data?.stats || {};
  const statCards = [
    {
      key: "daily",
      label: t("dailyExpenses"),
      icon: "☀️",
      color: "#f97316",
      data: stats.daily,
    },
    {
      key: "weekly",
      label: t("weeklyExpenses"),
      icon: "📅",
      color: "#8b5cf6",
      data: stats.weekly,
    },
    {
      key: "monthly",
      label: t("monthlyExpenses"),
      icon: "📆",
      color: "#0ea5e9",
      data: stats.monthly,
    },
    {
      key: "yearly",
      label: t("yearlyExpenses"),
      icon: "🗓️",
      color: "#10b981",
      data: stats.yearly,
    },
  ];

  // Detect if the selected month/year is strictly in the future (no data expected)
  const todayY = today.getFullYear();
  const todayM = today.getMonth(); // 0-indexed
  const isFutureMonth =
    navYear > todayY || (navYear === todayY && navMonth > todayM);

  // Treat as empty when it's a future month OR when the API returned no salary record
  const hasData = !isFutureMonth && !!data?.salary;

  const salaryUSD = hasData ? data?.salaryUSD || 0 : 0;
  const savingUSD = hasData ? data?.savingUSD || 0 : 0;
  const spendableUSD = hasData ? data?.spendableUSD || 0 : 0;
  const remainingUSD = hasData ? data?.remainingUSD || 0 : 0;
  const monthlySpentUSD = hasData ? data?.monthlySpentUSD || 0 : 0;
  const completedDeductionUSD = hasData ? data?.completedDeductionUSD || 0 : 0;
  const plans = hasData ? data?.plans || {} : {};
  const spendPercent =
    spendableUSD > 0
      ? Math.min(
          100,
          ((monthlySpentUSD + completedDeductionUSD) / spendableUSD) * 100,
        )
      : 0;
  const dailyBudget = spendableUSD / 30;
  const savingPercent = salaryUSD > 0 ? (savingUSD / salaryUSD) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in ">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="font-display font-bold text-2xl md:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            {t("dashboard")}
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            {formatDate(new Date(), language, "long")}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddExpense(true)}>
          + {t("addNew")}
        </button>
      </div>

      {/* Salary & Budget summary */}
      <div className="card p-5 font-khmer">
        {/* ── Month/Year navigation header ── */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div
            className="font-display font-bold text-base"
            style={{ color: "var(--text-primary)" }}
          >
            💰 {t("totalSalary")}
            {!isCurrentMonth && (
              <span
                className="ml-2 text-xs font-normal"
                style={{ color: "var(--text-secondary)" }}
              >
                ({t("viewing") || "Viewing"})
              </span>
            )}
          </div>

          <MonthYearNav
            month={navMonth}
            year={navYear}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
            language={language}
          />
        </div>

        {!hasData ? (
          /* ── Empty state for future / no-data months ── */
          <div
            className="flex flex-col items-center justify-center py-8 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <div className="text-4xl mb-3">{isFutureMonth ? "🔮" : "📭"}</div>
            <div
              className="font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {isFutureMonth
                ? language === "kh"
                  ? "មិនទាន់មានទិន្នន័យ"
                  : "No data yet"
                : language === "kh"
                  ? "គ្មានប្រាក់ខែសម្រាប់ខែនេះ"
                  : "No salary set for this month"}
            </div>
            <div style={{ fontSize: "12px" }}>
              {isFutureMonth
                ? language === "kh"
                  ? "ខែនេះនៅមិនទាន់មកដល់ទេ"
                  : "This month hasn't started yet"
                : language === "kh"
                  ? "សូមបន្ថែមប្រាក់ខែក្នុងទំព័រ Salary"
                  : "Add salary on the Salary page"}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 ">
              {[
                {
                  label: t("totalSalary"),
                  icon: "💰",
                  val: formatAmount(salaryUSD),
                  color: "#0ea5e9",
                },
                {
                  label: t("totalSaving"),
                  icon: "🏦",
                  val: formatAmount(savingUSD),
                  color: "#10b981",
                  sub: savingPercent.toFixed(0) + "%",
                },
                {
                  label: t("spendable"),
                  icon: "💳",
                  val: formatAmount(spendableUSD),
                  color: "#8b5cf6",
                },
                {
                  label: t("remaining"),
                  icon: "✅",
                  val: formatAmount(remainingUSD),
                  color: remainingUSD < 0 ? "#ef4444" : "#10b981",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="text-center p-3 rounded-xl"
                  style={{ background: "var(--bg-primary)" }}
                >
                  <div
                    className="text-xs font-semibold mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.icon} {item.label}
                  </div>
                  <div
                    className="font-display font-bold text-lg"
                    style={{ color: item.color }}
                  >
                    {item.val}
                  </div>
                  {item.sub && (
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item.sub}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Budget progress */}
            <div>
              <div
                className="flex justify-between text-xs mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                <span>
                  {t("expenses")}: {formatAmount(monthlySpentUSD)}
                </span>
                {completedDeductionUSD > 0 && (
                  <span>
                    + {t("completedDeduction")}:{" "}
                    {formatAmount(completedDeductionUSD)}
                  </span>
                )}
                <span>{formatNum(spendPercent.toFixed(1))}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${spendPercent}%`,
                    background:
                      spendPercent > 90
                        ? "linear-gradient(90deg,#ef4444,#dc2626)"
                        : undefined,
                  }}
                />
              </div>
              <div
                className="text-xs mt-1.5 flex justify-between"
                style={{ color: "var(--text-secondary)" }}
              >
                <span>
                  {t("daily")} {t("budget")}: {formatAmount(dailyBudget)}/day
                </span>
                <span>
                  {t("remaining")}:{" "}
                  <span
                    style={{
                      color: remainingUSD < 0 ? "#ef4444" : "#10b981",
                      fontWeight: "bold",
                    }}
                  >
                    {formatAmount(remainingUSD)}
                  </span>
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Stat cards - click to open calendar */}
      {hasData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div
              key={card.key}
              className="stat-card"
              onClick={() => setCalModal({ open: true, view: card.key })}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl">{card.icon}</div>
                <div
                  className="text-xs font-bold badge"
                  style={{ background: `${card.color}20`, color: card.color }}
                >
                  {t("clickToView")}
                </div>
              </div>
              <div
                className="font-display font-bold text-2xl md:text-3xl mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {formatAmount(card.data?.totalUSD, card.data?.totalKHR)}
              </div>
              <div
                className="text-sm font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                {card.label}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {formatNum(card.data?.count || 0)} {t("items")}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plans Overview + Category breakdown */}
      {hasData && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Plans overview */}
          <div className="card p-5">
            <h2
              className="font-display font-bold text-lg mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              📋 {t("plansOverview")}
            </h2>
            {/* Plan type stats */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { icon: "✈️", label: t("trips"), stats: plans.stats?.trips },
                { icon: "🎯", label: t("goals"), stats: plans.stats?.goals },
                {
                  icon: "🤝",
                  label: t("givings"),
                  stats: plans.stats?.givings,
                },
                { icon: "📦", label: t("others"), stats: plans.stats?.others },
              ].map((item, i) => (
                <div
                  key={i}
                  className="text-center p-2 rounded-xl"
                  style={{ background: "var(--bg-primary)" }}
                >
                  <div className="text-xl mb-1">{item.icon}</div>
                  <div
                    className="text-xs font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {formatNum(item.stats?.total || 0)}
                  </div>
                  <div className="text-xs" style={{ color: "#10b981" }}>
                    ✓ {formatNum(item.stats?.completed || 0)}
                  </div>
                  <div
                    style={{ fontSize: "10px", color: "var(--text-secondary)" }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Completed this month banner */}
            {plans.completedThisMonth?.length > 0 && (
              <div
                className="rounded-xl p-3 mb-4"
                style={{
                  background: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
                  border: "1px solid #86efac",
                }}
              >
                <div className="text-xs font-bold text-green-800 mb-2">
                  ✅ {t("completedDeduction")} (
                  {formatAmount(data?.completedDeductionUSD)})
                </div>
                <div className="space-y-1">
                  {plans.completedThisMonth.slice(0, 3).map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between text-xs text-green-700"
                    >
                      <span className="truncate mr-2">{item.title}</span>
                      <span className="font-bold shrink-0">
                        {formatAmount(item.amountUSD)}
                      </span>
                    </div>
                  ))}
                  {plans.completedThisMonth.length > 3 && (
                    <div className="text-xs text-green-600">
                      +{plans.completedThisMonth.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent plans list */}
            <div className="space-y-3">
              {[
                { items: plans.recentTrips, icon: "✈️", type: "trips" },
                { items: plans.recentGoals, icon: "🎯", type: "goals" },
                { items: plans.recentGivings, icon: "🤝", type: "givings" },
                { items: plans.recentOthers, icon: "📦", type: "others" },
              ].map(({ items, icon, type }) =>
                items?.length > 0 ? (
                  <div key={type}>
                    <div
                      className="text-xs font-bold mb-1.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {icon} {t(type)}
                    </div>
                    <div className="space-y-1.5">
                      {items.slice(0, 2).map((item) => (
                        <PlanCard
                          key={item._id}
                          item={item}
                          icon={icon}
                          t={t}
                          formatAmount={formatAmount}
                          language={language}
                        />
                      ))}
                    </div>
                  </div>
                ) : null,
              )}
              {!plans.recentTrips?.length &&
                !plans.recentGoals?.length &&
                !plans.recentGivings?.length &&
                !plans.recentOthers?.length && (
                  <div
                    className="text-center py-6 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <div className="text-3xl mb-2">📋</div>
                    {t("noPlans")}
                  </div>
                )}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="card p-5">
            <h2
              className="font-display font-bold text-lg mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              📊 {t("monthly")} {t("category")}
            </h2>
            {data?.categoryBreakdown?.length > 0 ? (
              <div className="space-y-3">
                {data.categoryBreakdown.map((cat) => {
                  const pct =
                    monthlySpentUSD > 0
                      ? (cat.totalUSD / monthlySpentUSD) * 100
                      : 0;
                  return (
                    <div key={cat._id} className="flex items-center gap-3">
                      <span className="text-xl w-8 text-center shrink-0">
                        {cat.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span style={{ color: "var(--text-primary)" }}>
                            {t(cat._id)}
                          </span>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {formatAmount(cat.totalUSD)} (
                            {formatNum(pct.toFixed(1))}%)
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg,${CATEGORY_COLORS[cat._id] || "#0ea5e9"},${CATEGORY_COLORS[cat._id] || "#38bdf8"})`,
                            }}
                          />
                        </div>
                      </div>
                      <div
                        className="text-xs w-5 text-right shrink-0"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatNum(cat.count)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center h-48 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <div className="text-4xl mb-3">📊</div>
                {t("noExpenses")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* No salary hint — only show for current/past months with no salary, not future */}
      {!hasData && !isFutureMonth && isCurrentMonth && (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-3">💡</div>
          <div
            className="font-semibold text-lg mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {language === "kh"
              ? "ចាប់ផ្ដើមដោយបន្ថែមប្រាក់ខែ!"
              : "Get started by adding your salary!"}
          </div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {language === "kh"
              ? "ចូល Salary និង Savings ដើម្បីបញ្ចូលចំនួន"
              : "Go to Salary and Savings pages to set up your monthly budget"}
          </div>
        </div>
      )}

      <CalendarModal
        isOpen={calModal.open}
        onClose={() => setCalModal({ open: false, view: "monthly" })}
        initialView={calModal.view}
      />
      <ExpenseModal
        isOpen={addExpense}
        onClose={() => setAddExpense(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
