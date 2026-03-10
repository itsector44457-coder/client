const User = require("../models/User");
const Session = require("../models/Session");
const Task = require("../models/Task");

const MIN_DAILY_STUDY_SECONDS = 2 * 60 * 60;
const MAX_STREAK_SHIELDS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

const parseDateStringToUtcMs = (dateString) => {
  const parts = String(dateString || "")
    .split("-")
    .map(Number);

  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return null;
  }

  const [year, month, day] = parts;
  return Date.UTC(year, month - 1, day, 0, 0, 0, 0);
};

const calculateDailyStreakCriteria = async (userId, date) => {
  const [sessions, highPriorityCompletedCount] = await Promise.all([
    Session.find({ userId, date }).select("duration isStrictValid"),
    Task.countDocuments({
      userId,
      isCompleted: true,
      priority: "High",
      completedDate: date,
    }),
  ]);

  const totalStudySeconds = sessions.reduce(
    (sum, session) => sum + Number(session.duration || 0),
    0,
  );
  const strictValidSessions = sessions.filter((session) => session.isStrictValid).length;

  const criteria = {
    totalStudySeconds,
    strictValidSessions,
    highPriorityCompletedCount,
    eligible:
      totalStudySeconds >= MIN_DAILY_STUDY_SECONDS &&
      strictValidSessions >= 1 &&
      highPriorityCompletedCount >= 1,
  };

  return criteria;
};

const maybeAwardDailyStreak = async ({ userId, date }) => {
  if (!userId || !date) {
    return { awarded: false, reason: "missing-input" };
  }

  const user = await User.findById(userId);
  if (!user) {
    return { awarded: false, reason: "user-not-found" };
  }

  user.streakCount = Number.isFinite(Number(user.streakCount))
    ? Number(user.streakCount)
    : 0;
  user.streakShields = Number.isFinite(Number(user.streakShields))
    ? Number(user.streakShields)
    : 0;

  if (user.lastStreakDate === date) {
    const criteria = await calculateDailyStreakCriteria(userId, date);
    return {
      awarded: false,
      reason: "already-awarded",
      streakCount: user.streakCount,
      streakShields: user.streakShields,
      lastStreakDate: user.lastStreakDate,
      criteria,
    };
  }

  const criteria = await calculateDailyStreakCriteria(userId, date);
  if (!criteria.eligible) {
    return {
      awarded: false,
      reason: "criteria-not-met",
      streakCount: user.streakCount,
      streakShields: user.streakShields,
      lastStreakDate: user.lastStreakDate,
      criteria,
    };
  }

  const currentDateMs = parseDateStringToUtcMs(date);
  const lastDateMs = parseDateStringToUtcMs(user.lastStreakDate);

  if (lastDateMs === null) {
    user.streakCount = Number(user.streakCount || 0) > 0 ? user.streakCount + 1 : 1;
  } else {
    const gapDays = Math.round((currentDateMs - lastDateMs) / DAY_MS);

    if (gapDays === 1) {
      user.streakCount += 1;
    } else if (gapDays > 1) {
      if (user.streakShields > 0) {
        user.streakShields -= 1;
        user.streakCount += 1;
      } else {
        user.streakCount = 1;
      }
    } else if (gapDays <= 0) {
      return {
        awarded: false,
        reason: "invalid-date-order",
        streakCount: user.streakCount,
        streakShields: user.streakShields,
        lastStreakDate: user.lastStreakDate,
        criteria,
      };
    }
  }

  user.lastStreakDate = date;

  let shieldEarned = false;
  if (
    user.streakCount > 0 &&
    user.streakCount % 7 === 0 &&
    user.streakShields < MAX_STREAK_SHIELDS
  ) {
    user.streakShields += 1;
    shieldEarned = true;
  }

  await user.save();

  return {
    awarded: true,
    reason: "streak-awarded",
    streakCount: user.streakCount,
    streakShields: user.streakShields,
    lastStreakDate: user.lastStreakDate,
    shieldEarned,
    criteria,
  };
};

module.exports = {
  MIN_DAILY_STUDY_SECONDS,
  calculateDailyStreakCriteria,
  maybeAwardDailyStreak,
};
