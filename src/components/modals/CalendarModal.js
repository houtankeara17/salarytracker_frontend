// src/components/modals/CalendarModal.js
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { expenseAPI } from "../../utils/api";
import { formatKhmerDate, toKhmerNum } from "../../utils/khmerUtils";

const VIEWS = ["daily", "weekly", "monthly", "yearly"];

// Returns Monday-based week start for a given date
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // go back to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toISO(date) {
  return new Date(date).toISOString().split("T")[0];
}

export default function CalendarModal({
  isOpen,
  onClose,
  initialView = "monthly",
}) {
  const { t, formatAmount, formatNum, language } = useApp();
  const [view, setView] = useState(initialView);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(new Date()); // for daily view
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date())); // for weekly view

  const [drillItems, setDrillItems] = useState(null);
  const [drillTitle, setDrillTitle] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDrillItems(null);
      loadExpenses();
    }
  }, [isOpen, view, selectedYear, selectedMonth, selectedDate, weekStart]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      let params = {};

      if (view === "daily") {
        // fetch exactly the selected date
        params = { date: toISO(selectedDate) };
      } else if (view === "weekly") {
        // fetch Mon–Sun of the selected week
        const weekEnd = addDays(weekStart, 6);
        params = {
          startDate: toISO(weekStart),
          endDate: toISO(weekEnd),
        };
      } else if (view === "monthly") {
        params = { month: selectedMonth + 1, year: selectedYear };
      } else if (view === "yearly") {
        params = { year: selectedYear };
      }

      const res = await expenseAPI.getAll(params);
      setExpenses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Navigation helpers ──────────────────────────────────────────────────────

  const goToPrevYear = () => {
    setDrillItems(null);
    setSelectedYear((y) => y - 1);
  };
  const goToNextYear = () => {
    setDrillItems(null);
    setSelectedYear((y) => y + 1);
  };
  const changeYear = (val) => {
    setDrillItems(null);
    setSelectedYear(Number(val));
  };
  const goToPrevMonth = () => {
    setDrillItems(null);
    setSelectedMonth((m) => (m === 0 ? 11 : m - 1));
  };
  const goToNextMonth = () => {
    setDrillItems(null);
    setSelectedMonth((m) => (m === 11 ? 0 : m + 1));
  };

  // Daily: prev/next day
  const goToPrevDay = () => {
    setDrillItems(null);
    setSelectedDate((d) => addDays(d, -1));
  };
  const goToNextDay = () => {
    setDrillItems(null);
    setSelectedDate((d) => addDays(d, 1));
  };

  // Weekly: prev/next week
  const goToPrevWeek = () => {
    setDrillItems(null);
    setWeekStart((d) => addDays(d, -7));
  };
  const goToNextWeek = () => {
    setDrillItems(null);
    setWeekStart((d) => addDays(d, 7));
  };

  // ── Data helpers ───────────────────────────────────────────────────────────

  const getYears = () => {
    const y = [];
    for (let i = 2024; i <= 2031; i++) y.push(i);
    return y;
  };

  const getDaysInMonth = () =>
    new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const getExpensesForDay = (day) =>
    expenses.filter((e) => {
      const d = new Date(e.date);
      return (
        d.getFullYear() === selectedYear &&
        d.getMonth() === selectedMonth &&
        d.getDate() === day
      );
    });

  const getExpensesForMonth = (month) =>
    expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === selectedYear && d.getMonth() === month;
    });

  const getDayTotal = (day) =>
    getExpensesForDay(day).reduce((s, e) => s + (e.amountUSD || 0), 0);

  const getMonthTotal = (month) =>
    getExpensesForMonth(month).reduce((s, e) => s + (e.amountUSD || 0), 0);

  const openDrill = (items, title) => {
    setDrillItems(items);
    setDrillTitle(title);
  };
  const closeDrill = () => {
    setDrillItems(null);
    setDrillTitle("");
  };

  // ── Labels ─────────────────────────────────────────────────────────────────

  const MONTHS_LABEL =
    language === "kh"
      ? [
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
        ]
      : [
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

  const locale = language === "kh" ? "km-KH" : "en-US";

  const totalAll = expenses.reduce((s, e) => s + (e.amountUSD || 0), 0);

  const formatDayLabel = (date) =>
    new Date(date).toLocaleDateString(locale, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatWeekDayLabel = (date) =>
    new Date(date).toLocaleDateString(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const formatWeekDayLabelLong = (date) =>
    new Date(date).toLocaleDateString(locale, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (!isOpen) return null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box max-w-2xl"
        style={{ minHeight: "520px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h3
            className="font-display font-bold text-base"
            style={{ color: "var(--text-primary)" }}
          >
            📅 {t("expenses")} — {t(view)}
          </h3>
          <button className="btn btn-ghost p-2 text-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* View tabs */}
        <div
          className="flex gap-1 p-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => {
                setView(v);
                setDrillItems(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === v ? "bg-primary-500 text-white" : "btn-secondary"}`}
            >
              {t(v)}
            </button>
          ))}
        </div>

        {/* Navigation bar — adapts per view */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {view === "daily" ? (
            <div className="flex gap-2 items-center">
              <button
                className="btn btn-secondary py-1.5 px-3 text-xs"
                onClick={goToPrevDay}
              >
                ‹
              </button>
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {formatDayLabel(selectedDate)}
              </span>
              <button
                className="btn btn-secondary py-1.5 px-3 text-xs"
                onClick={goToNextDay}
              >
                ›
              </button>
            </div>
          ) : view === "weekly" ? (
            <div className="flex gap-2 items-center">
              <button
                className="btn btn-secondary py-1.5 px-3 text-xs"
                onClick={goToPrevWeek}
              >
                ‹
              </button>
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {new Date(weekStart).toLocaleDateString(locale, {
                  month: "short",
                  day: "numeric",
                })}
                {" – "}
                {addDays(weekStart, 6).toLocaleDateString(locale, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <button
                className="btn btn-secondary py-1.5 px-3 text-xs"
                onClick={goToNextWeek}
              >
                ›
              </button>
            </div>
          ) : (
            <div className="flex gap-4 items-center">
              <div className="flex gap-2 items-center">
                <button
                  className="btn btn-secondary py-1.5 px-3 text-xs"
                  onClick={goToPrevYear}
                >
                  ‹
                </button>
                <select
                  value={selectedYear}
                  onChange={(e) => changeYear(e.target.value)}
                  className="form-input py-1.5 text-xs w-24"
                >
                  {getYears().map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <button
                  className="btn btn-secondary py-1.5 px-3 text-xs"
                  onClick={goToNextYear}
                >
                  ›
                </button>
              </div>
              {view === "monthly" && (
                <div className="flex gap-2 items-center">
                  <button
                    className="btn btn-secondary py-1.5 px-3 text-xs"
                    onClick={goToPrevMonth}
                  >
                    ‹
                  </button>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {MONTHS_LABEL[selectedMonth]}
                  </span>
                  <button
                    className="btn btn-secondary py-1.5 px-3 text-xs"
                    onClick={goToNextMonth}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="text-sm font-bold" style={{ color: "#0ea5e9" }}>
            {t("total")}: {formatAmount(totalAll)}
          </div>
        </div>

        {/* Content */}
        <div className="p-4" style={{ maxHeight: "400px", overflowY: "auto" }}>
          {loading ? (
            <div
              className="flex items-center justify-center h-32 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("loading")}
            </div>
          ) : drillItems ? (
            // ── Drill-down ───────────────────────────────────────────────────
            <div>
              <div className="flex items-center gap-2 mb-3">
                <button
                  className="btn btn-secondary py-1 px-3 text-xs"
                  onClick={closeDrill}
                >
                  ← {t("back")}
                </button>
                <span className="font-semibold text-sm">{drillTitle}</span>
              </div>
              {drillItems.length === 0 ? (
                <div
                  className="text-center py-8 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("noExpenses")}
                </div>
              ) : (
                <div className="space-y-2">
                  {drillItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "var(--bg-primary)" }}
                    >
                      <span className="text-xl">
                        {item.categoryEmoji || "💸"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-semibold text-sm truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.itemName}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {t(item.category)} ·{" "}
                          {language === "kh"
                            ? toKhmerNum(item.quantity)
                            : item.quantity}
                          x · {t(item.paymentMethod)}
                        </div>
                        {item.noted && (
                          <div
                            className="text-xs mt-0.5 truncate"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {item.noted}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className="font-bold text-sm"
                          style={{ color: "#0ea5e9" }}
                        >
                          {formatAmount(item.amountUSD, item.amountKHR)}
                        </div>
                        {item.imageQr && (
                          <span className="text-xs badge badge-planned">
                            QR
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div
                    className="flex justify-between p-3 rounded-xl font-bold text-sm mt-2"
                    style={{
                      background: "linear-gradient(135deg,#e0f2fe,#bae6fd)",
                    }}
                  >
                    <span style={{ color: "#0284c7" }}>{t("total")}</span>
                    <span style={{ color: "#0284c7" }}>
                      {formatAmount(
                        drillItems.reduce((s, i) => s + (i.amountUSD || 0), 0),
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : view === "daily" ? (
            // ── Daily: show all expenses for selectedDate ────────────────────
            <div className="space-y-2">
              {expenses.length === 0 ? (
                <div
                  className="text-center py-12 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("noExpenses")}
                </div>
              ) : (
                expenses.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "var(--bg-primary)" }}
                  >
                    <span className="text-xl">
                      {item.categoryEmoji || "💸"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-semibold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.itemName}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {t(item.category)} ·{" "}
                        {language === "kh"
                          ? toKhmerNum(item.quantity)
                          : item.quantity}
                        x
                      </div>
                      {item.noted && (
                        <div
                          className="text-xs mt-0.5 truncate"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {item.noted}
                        </div>
                      )}
                    </div>
                    <div
                      className="font-bold text-sm"
                      style={{ color: "#0ea5e9" }}
                    >
                      {formatAmount(item.amountUSD, item.amountKHR)}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : view === "weekly" ? (
            // ── Weekly: 7 rows Mon–Sun for selected week ─────────────────────
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, i) => {
                const day = addDays(weekStart, i);
                const dayStr = toISO(day);

                const dayItems = expenses.filter(
                  (e) => toISO(new Date(e.date)) === dayStr,
                );
                const total = dayItems.reduce(
                  (s, e) => s + (e.amountUSD || 0),
                  0,
                );
                const todayFlag = toISO(new Date()) === dayStr;

                return (
                  <button
                    key={dayStr}
                    onClick={() =>
                      openDrill(dayItems, formatWeekDayLabelLong(day))
                    }
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all hover:shadow-md ${todayFlag ? "ring-2 ring-primary-400" : ""}`}
                    style={{
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <div
                        className="font-semibold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {formatWeekDayLabel(day)}
                        {todayFlag && (
                          <span className="ml-2 badge badge-planned text-xs">
                            {t("today")}
                          </span>
                        )}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatNum(dayItems.length)} {t("items")}
                      </div>
                    </div>
                    <div
                      className="font-bold text-base"
                      style={{
                        color: total > 0 ? "#0ea5e9" : "var(--text-secondary)",
                      }}
                    >
                      {formatAmount(total)}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : view === "monthly" ? (
            // ── Monthly calendar grid ────────────────────────────────────────
            <div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div
                    key={i}
                    className="text-center text-xs font-bold py-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({
                  length: new Date(selectedYear, selectedMonth, 1).getDay(),
                }).map((_, i) => (
                  <div key={`e${i}`} />
                ))}
                {Array.from({ length: getDaysInMonth() }).map((_, i) => {
                  const day = i + 1;
                  const dayItems = getExpensesForDay(day);
                  const total = getDayTotal(day);
                  const todayFlag =
                    new Date().getFullYear() === selectedYear &&
                    new Date().getMonth() === selectedMonth &&
                    new Date().getDate() === day;
                  return (
                    <button
                      key={day}
                      onClick={() =>
                        openDrill(
                          dayItems,
                          `${MONTHS_LABEL[selectedMonth]} ${day}`,
                        )
                      }
                      className={`cal-day flex-col p-1 ${todayFlag ? "today" : ""} ${dayItems.length > 0 ? "has-data" : ""}`}
                      style={{ minHeight: "48px" }}
                    >
                      <span className="text-xs font-bold">
                        {language === "kh" ? toKhmerNum(day) : day}
                      </span>
                      {total > 0 && (
                        <span
                          style={{
                            fontSize: "9px",
                            color: todayFlag
                              ? "rgba(255,255,255,0.8)"
                              : "#0ea5e9",
                          }}
                        >
                          ${total.toFixed(0)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // ── Yearly: Jan–Dec grid ─────────────────────────────────────────
            <div className="grid grid-cols-3 gap-3">
              {MONTHS_LABEL.map((mLabel, mi) => {
                const mItems = getExpensesForMonth(mi);
                const mTotal = getMonthTotal(mi);
                const isCurrentMonth =
                  new Date().getMonth() === mi &&
                  new Date().getFullYear() === selectedYear;
                return (
                  <button
                    key={mi}
                    onClick={() => openDrill(mItems, mLabel)}
                    className={`p-4 rounded-2xl text-left transition-all hover:shadow-lg ${isCurrentMonth ? "ring-2 ring-primary-400" : ""}`}
                    style={{
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="font-bold text-sm mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {mLabel}
                    </div>
                    <div
                      className="font-bold text-base"
                      style={{ color: "#0ea5e9" }}
                    >
                      ${mTotal}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {formatNum(mItems.length)} {t("items")}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
