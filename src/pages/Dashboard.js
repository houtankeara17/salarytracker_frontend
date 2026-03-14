// src/pages/Dashboard.js
import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { dashboardAPI } from "../utils/api";
import CalendarModal from "../components/modals/CalendarModal";
import ExpenseModal from "../components/modals/ExpenseModal";
import { formatDate } from "../utils/khmerUtils";
import StatusBanner from "../components/StatusBanner";
import { useLocation } from "react-router-dom";

/* ─────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────── */
const STATUS_BADGE = {
  planned: "badge-planned",
  ongoing: "badge-ongoing",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
};

const CATEGORY_COLORS = {
  food: "#f97316",
  drink: "#fb923c",
  fruit: "#0ea5e9",
  transport: "#8b5cf6",
  clothing: "#ec4899",
  health: "#ef4444",
  entertainment: "#f59e0b",
  education: "#10b981",
  utilities: "#6366f1",
  shopping: "#14b8a6",
  other: "#94a3b8",
};

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

/* ─────────────────────────────────────────────────────
   Shared micro-components
───────────────────────────────────────────────────── */
function Chip({ children, color = "#6366f1" }) {
  return (
    <span className="dash-chip" style={{ "--chip-color": color }}>
      {children}
    </span>
  );
}

function Bar({ pct, color = "#6366f1", height = 5, glow = false }) {
  return (
    <div className="dash-bar-track" style={{ "--bar-h": `${height}px` }}>
      <div
        className="dash-bar-fill"
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          boxShadow: glow ? `0 0 10px ${color}60` : "none",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   MonthYearNav
───────────────────────────────────────────────────── */
function MonthYearNav({ month, year, onPrev, onNext, language }) {
  const label =
    language === "kh" ? MONTH_NAMES_KH[month] : MONTH_NAMES_EN[month];
  return (
    <div className="dash-nav">
      <button
        className="dash-nav-btn"
        onClick={onPrev}
        aria-label="Previous month"
      >
        ‹
      </button>
      <div className="dash-nav-label">
        {label} {year}
      </div>
      <button className="dash-nav-btn" onClick={onNext} aria-label="Next month">
        ›
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   PlanCard
───────────────────────────────────────────────────── */
function PlanCard({ item, icon, t, formatAmount }) {
  const saved =
    item.savedAmount !== undefined
      ? item.savedAmount
      : item.givenAmount !== undefined
        ? item.givenAmount
        : item.paidAmount || 0;
  const pct =
    item.targetAmount > 0
      ? Math.min(100, (saved / item.targetAmount) * 100)
      : 0;
  const isDone = item.status === "completed";
  const clr = isDone ? "#10b981" : "#6366f1";

  return (
    <div className={`dash-plan-card${isDone ? " is-done" : ""}`}>
      <div className="dash-plan-top">
        <span className="dash-plan-icon">{icon}</span>
        <div className="dash-plan-info">
          <div className="dash-plan-title">{item.title}</div>
          <span
            className={`badge ${STATUS_BADGE[item.status] || "badge-planned"}`}
            style={{ fontSize: "9px" }}
          >
            {t(item.status)}
          </span>
        </div>
        <div className="dash-plan-amount" style={{ color: clr }}>
          {formatAmount(item.amountUSD)}
        </div>
      </div>
      <Bar pct={pct} color={clr} glow={isDone} />
      <div className="dash-plan-foot">
        <span>{saved ? formatAmount(saved) : "—"} saved</span>
        <span style={{ color: clr, fontWeight: 700 }}>{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   StatPill
───────────────────────────────────────────────────── */
function StatPill({ icon, label, total, completed }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div className="dash-stat-pill">
      <div className="dash-stp-icon">{icon}</div>
      <div className="dash-stp-total">{total}</div>
      <div className="dash-stp-label">{label}</div>
      <Bar pct={pct} color="#10b981" height={3} />
      <div className="dash-stp-done">
        {completed}/{total}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Dashboard
───────────────────────────────────────────────────── */
export default function Dashboard() {
  const { t, formatAmount, formatNum, language } = useApp();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [calModal, setCalModal] = useState({ open: false, view: "monthly" });
  const [addExpense, setAddExpense] = useState(false);
  const [banner, setBanner] = useState(null); // ← add

  const today = new Date();
  const [navMonth, setNavMonth] = useState(today.getMonth());
  const [navYear, setNavYear] = useState(today.getFullYear());

  // inside Dashboard():
  const location = useLocation();

  useEffect(() => {
    if (location.state?.justLoggedIn) {
      setBanner({ type: "success", title: t("loginSuccess") });
      window.history.replaceState({}, ""); // clear state so it doesn't show again on refresh
    }
  }, []);

  const isCurrentMonth =
    navMonth === today.getMonth() && navYear === today.getFullYear();

  const handlePrevMonth = () =>
    setNavMonth((p) => {
      if (p === 0) {
        setNavYear((y) => y - 1);
        return 11;
      }
      return p - 1;
    });

  const handleNextMonth = () =>
    setNavMonth((p) => {
      if (p === 11) {
        setNavYear((y) => y + 1);
        return 0;
      }
      return p + 1;
    });

  const loadData = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      try {
        const res = await dashboardAPI.getSummary({
          month: navMonth + 1,
          year: navYear,
        });
        setData(res.data);
      } catch (err) {
        setBanner({ type: "error", title: "Failed to load", sub: err.message });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navMonth, navYear],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ── Skeleton ── */
  if (loading)
    return (
      <div className="dash-skeleton-wrap">
        <div
          className="skeleton"
          style={{ height: "48px", width: "220px", borderRadius: "12px" }}
        />
        <div
          className="skeleton"
          style={{ height: "180px", borderRadius: "20px" }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "14px",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: "110px", borderRadius: "18px" }}
            />
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {[1, 2].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: "320px", borderRadius: "20px" }}
            />
          ))}
        </div>
        <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />
      </div>
    );

  /* ── Derived ── */
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const isFutureMonth =
    navYear > todayY || (navYear === todayY && navMonth > todayM);
  const hasData =
    !isFutureMonth &&
    !!data?.salary &&
    (data?.monthlySpentUSD > 0 || data?.plans);

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
  const spendColor =
    spendPercent > 90 ? "#ef4444" : spendPercent > 70 ? "#f59e0b" : "#6366f1";

  return (
    <div className="dash-root">
      {/* Header */}
      <div className="dash-header dash-section">
        <div>
          <h1 className="dash-title">{t("dashboard")}</h1>
          <p className="dash-subtitle">
            {formatDate(new Date(), language, "long")}
          </p>
        </div>
        <button className="dash-add-btn" onClick={() => setAddExpense(true)}>
          + {t("addNew")}
        </button>
      </div>
      {/* Salary & Budget */}
      <div
        className="dash-glass-card dash-section"
        style={{ animationDelay: ".06s" }}
      >
        <div className="dash-card-head">
          <div>
            <h2 className="dash-card-title">💰 {t("totalSalary")}</h2>
            {!isCurrentMonth && (
              <span className="dash-card-subtitle">
                {t("viewing") || "Viewing selected month"}
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
          <div className="dash-empty">
            <div className="dash-empty-icon">{isFutureMonth ? "🔮" : "📭"}</div>
            <div className="dash-empty-title">
              {isFutureMonth
                ? language === "kh"
                  ? "មិនទាន់មានទិន្នន័យ"
                  : "No data yet"
                : language === "kh"
                  ? "គ្មានប្រាក់ខែសម្រាប់ខែនេះ"
                  : "No salary for this month"}
            </div>
            <div className="dash-empty-sub">
              {isFutureMonth
                ? language === "kh"
                  ? "ខែនេះនៅមិនទាន់មកដល់ទេ"
                  : "This month hasn't started yet"
                : language === "kh"
                  ? "សូមបន្ថែមប្រាក់ខែក្នុងទំព័រ Salary"
                  : "No salary was set for this month"}
            </div>
          </div>
        ) : (
          <>
            <div className="dash-tiles">
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
                  sub: `${savingPercent.toFixed(0)}% of salary`,
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
                  className="dash-tile"
                  style={{ "--tile-color": item.color }}
                >
                  <div className="dash-tile-label">
                    {item.icon} {item.label}
                  </div>
                  <div className="dash-tile-val" style={{ color: item.color }}>
                    {item.val}
                  </div>
                  {item.sub && <div className="dash-tile-sub">{item.sub}</div>}
                </div>
              ))}
            </div>

            <div className="dash-spend-block">
              <div className="dash-spend-row">
                <span className="dash-spend-left">
                  {t("expenses")}:{" "}
                  <strong>{formatAmount(monthlySpentUSD)}</strong>
                  {completedDeductionUSD > 0 && (
                    <span className="dash-spend-deduct">
                      {" "}
                      + {t("completedDeduction")}:{" "}
                      {formatAmount(completedDeductionUSD)}
                    </span>
                  )}
                </span>
                <span className="dash-spend-pct" style={{ color: spendColor }}>
                  {formatNum(spendPercent.toFixed(1))}%
                </span>
              </div>
              <Bar pct={spendPercent} color={spendColor} height={7} glow />
              <div className="dash-spend-foot">
                <span>
                  {t("daily")} {t("budget")}:{" "}
                  <strong>{formatAmount(dailyBudget)}/day</strong>
                </span>
                <span>
                  {t("remaining")}:{" "}
                  <strong
                    style={{ color: remainingUSD < 0 ? "#ef4444" : "#10b981" }}
                  >
                    {formatAmount(remainingUSD)}
                  </strong>
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Stat cards */}
      {hasData && (
        <div
          className="dash-stat-grid dash-section"
          style={{ animationDelay: ".12s" }}
        >
          {statCards.map((card) => (
            <div
              key={card.key}
              className="dash-stat-card"
              style={{ "--sc-color": card.color }}
              onClick={() => setCalModal({ open: true, view: card.key })}
            >
              <div className="dash-sc-decor" />
              <div className="dash-sc-top">
                <span className="dash-sc-icon">{card.icon}</span>
                <Chip color={card.color}>{t("clickToView")}</Chip>
              </div>
              <div className="dash-sc-amount">
                {formatAmount(card.data?.totalUSD, card.data?.totalKHR)}
              </div>
              <div className="dash-sc-label">{card.label}</div>
              <div className="dash-sc-count">
                {formatNum(card.data?.count || 0)} {t("items")}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Plans + Category */}
      {hasData && (
        <div
          className="dash-bottom-grid dash-section"
          style={{ animationDelay: ".18s" }}
        >
          {/* Plans Overview */}
          <div className="dash-glass-card">
            <div className="dash-card-head">
              <div>
                <h2 className="dash-card-title">📋 {t("plansOverview")}</h2>
                <p className="dash-card-subtitle">
                  Active &amp; completed targets
                </p>
              </div>
              <Chip color="#6366f1">
                {(plans.stats?.trips?.total || 0) +
                  (plans.stats?.goals?.total || 0) +
                  (plans.stats?.givings?.total || 0) +
                  (plans.stats?.others?.total || 0)}{" "}
                plans
              </Chip>
            </div>

            <div className="dash-pillrow">
              <StatPill
                icon="✈️"
                label={t("trips")}
                total={plans.stats?.trips?.total || 0}
                completed={plans.stats?.trips?.completed || 0}
              />
              <StatPill
                icon="🎯"
                label={t("goals")}
                total={plans.stats?.goals?.total || 0}
                completed={plans.stats?.goals?.completed || 0}
              />
              <StatPill
                icon="🤝"
                label={t("givings")}
                total={plans.stats?.givings?.total || 0}
                completed={plans.stats?.givings?.completed || 0}
              />
              <StatPill
                icon="📦"
                label={t("others")}
                total={plans.stats?.others?.total || 0}
                completed={plans.stats?.others?.completed || 0}
              />
            </div>

            {plans.completedThisMonth?.length > 0 && (
              <div className="dash-completed-banner">
                <div className="dash-cb-head">
                  <span>✅ {t("completedDeduction")}</span>
                  <strong>{formatAmount(data?.completedDeductionUSD)}</strong>
                </div>
                {plans.completedThisMonth.slice(0, 3).map((item) => (
                  <div key={item._id} className="dash-cb-row">
                    <div className="dash-cb-dot" />
                    <span className="dash-cb-name">{item.title}</span>
                    <span className="dash-cb-amt">
                      {formatAmount(item.amountUSD)}
                    </span>
                  </div>
                ))}
                {plans.completedThisMonth.length > 3 && (
                  <div className="dash-cb-more">
                    +{plans.completedThisMonth.length - 3} more
                  </div>
                )}
              </div>
            )}

            <div className="dash-plans-list">
              {[
                { items: plans.recentTrips, icon: "✈️", type: "trips" },
                { items: plans.recentGoals, icon: "🎯", type: "goals" },
                { items: plans.recentGivings, icon: "🤝", type: "givings" },
                { items: plans.recentOthers, icon: "📦", type: "others" },
              ].map(({ items, icon, type }) =>
                items?.length > 0 ? (
                  <div key={type}>
                    <div className="dash-plans-section-label">
                      {icon} {t(type)}
                    </div>
                    <div className="dash-plans-cards">
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
                  <div className="dash-empty">
                    <div
                      className="dash-empty-icon"
                      style={{ fontSize: "32px" }}
                    >
                      📋
                    </div>
                    <div className="dash-empty-sub">{t("noPlans")}</div>
                  </div>
                )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="dash-glass-card">
            <div className="dash-card-head">
              <div>
                <h2 className="dash-card-title">
                  📊 {t("monthly")} {t("category")}
                </h2>
                <p className="dash-card-subtitle">Spending by category</p>
              </div>
              <span className="dash-cat-total">
                {formatAmount(monthlySpentUSD)}
              </span>
            </div>

            {data?.categoryBreakdown?.length > 0 ? (
              <div className="dash-cat-list">
                {data.categoryBreakdown.map((cat, i) => {
                  const pct =
                    monthlySpentUSD > 0
                      ? (cat.totalUSD / monthlySpentUSD) * 100
                      : 0;
                  const color = CATEGORY_COLORS[cat._id] || "#94a3b8";
                  return (
                    <div key={cat._id} className="dash-cat-row">
                      <span className="dash-cat-rank">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div
                        className="dash-cat-emoji"
                        style={{ "--cat-color": color }}
                      >
                        {cat.emoji}
                      </div>
                      <div className="dash-cat-body">
                        <div className="dash-cat-meta">
                          <span className="dash-cat-name">{t(cat._id)}</span>
                          <span className="dash-cat-amt">
                            {formatAmount(cat.totalUSD)}
                          </span>
                        </div>
                        <Bar pct={pct} color={color} height={4} />
                      </div>
                      <div className="dash-cat-right">
                        <div className="dash-cat-pct" style={{ color }}>
                          {pct.toFixed(1)}%
                        </div>
                        <div className="dash-cat-txn">{cat.count} txn</div>
                      </div>
                    </div>
                  );
                })}
                <div className="dash-cat-footer">
                  <div>
                    <div className="dash-cat-footer-label">
                      TOTAL THIS MONTH
                    </div>
                    <div className="dash-cat-footer-sub">
                      {data.categoryBreakdown.reduce((s, c) => s + c.count, 0)}{" "}
                      transactions
                    </div>
                  </div>
                  <div className="dash-cat-footer-total">
                    {formatAmount(monthlySpentUSD)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="dash-empty">
                <div className="dash-empty-icon">📊</div>
                <div className="dash-empty-sub">{t("noExpenses")}</div>
              </div>
            )}
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
        editData={null}
        onSuccess={() => {
          setAddExpense(false);
          setBanner({ type: "success", title: t("addedSuccess") });
          loadData(true);
        }}
      />
      <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />{" "}
      {/* ← add */}
    </div>
  );
}
