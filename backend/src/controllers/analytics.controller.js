const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getDreamConsistency = async (req, res) => {
  try {
    const dreams = await prisma.dreamEntry.findMany({
      where: { user_id: req.userId },
      orderBy: { timestamp: "asc" },
    });

    if (dreams.length < 2) {
      return res.status(200).json({
        consistency: 0,
        message: "Not enough dream entries to calculate consistency.",
      });
    }

    const timeDiffs = [];
    for (let i = 1; i < dreams.length; i++) {
      const diff =
        (dreams[i].timestamp.getTime() - dreams[i - 1].timestamp.getTime()) /
        (1000 * 60 * 60 * 24);
      timeDiffs.push(diff);
    }

    const avgDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
    const consistency = 1 / (1 + avgDiff);

    // console.log(
    //   `✅ Dream consistency calculated for user ${req.userId}: ${consistency}`
    // );
    res.status(200).json({ consistency });
  } catch (error) {
    console.error("❌ Error calculating dream consistency:", error);
    res.status(500).json({
      message: "Failed to fetch dream consistency",
      error: error.message,
    });
  }
};

const getEmotionalSleepMap = async (req, res) => {
  try {
    const dreams = await prisma.dreamEntry.findMany({
      where: { user_id: req.userId },
      select: { emotion: true, timestamp: true },
      orderBy: { timestamp: "asc" },
    });

    if (dreams.length === 0) {
      return res.status(200).json({
        message: "No dream entries to create an emotional sleep map.",
      });
    }

    res.status(200).json(dreams);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const getDreamEmotionsDistribution = async (req, res) => {
  try {
    const dreams = await prisma.dreamEntry.findMany({
      where: { user_id: req.userId },
      select: { emotion: true },
    });

    if (dreams.length === 0) {
      return res.status(200).json({
        message: "No dream entries to calculate emotion distribution.",
      });
    }

    const emotionCounts = dreams.reduce((acc, dream) => {
      acc[dream.emotion] = (acc[dream.emotion] || 0) + 1;
      return acc;
    }, {});

    const totalDreams = dreams.length;
    const emotionDistribution = Object.keys(emotionCounts).map((emotion) => ({
      emotion,
      percentage: (emotionCounts[emotion] / totalDreams) * 100,
    }));

    res.status(200).json(emotionDistribution);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const getSleepDuration = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sleepPlans = await prisma.sleepPlan.findMany({
      where: {
        user_id: req.userId,
        plan_date: { gte: thirtyDaysAgo },
        sleep_time: { not: null },
        wake_time: { not: null },
      },
      orderBy: { plan_date: "asc" },
    });

    if (sleepPlans.length === 0) {
      return res.status(200).json({
        message: "No sleep duration data available for the last 30 days.",
      });
    }

    const sleepDurations = sleepPlans.map((plan) => ({
      date: plan.plan_date,
      duration:
        (plan.wake_time.getTime() - plan.sleep_time.getTime()) /
        (1000 * 60 * 60), // in hours
    }));

    res.status(200).json(sleepDurations);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const getLucidDreamsPerDay = async (req, res) => {
  try {
    const lucidDreams = await prisma.dreamEntry.findMany({
      where: {
        user_id: req.userId,
        is_lucid: true,
      },
      orderBy: { timestamp: "asc" },
    });

    if (lucidDreams.length === 0) {
      return res
        .status(200)
        .json({ message: "No lucid dream data available." });
    }

    const lucidDreamsByDay = lucidDreams.reduce((acc, dream) => {
      const date = dream.timestamp.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const result = Object.keys(lucidDreamsByDay).map((date) => ({
      date,
      count: lucidDreamsByDay[date],
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const getSleepDreamCorrelations = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sleepPlans = await prisma.sleepPlan.findMany({
      where: {
        user_id: req.userId,
        plan_date: { gte: thirtyDaysAgo },
        sleep_time: { not: null },
        wake_time: { not: null },
      },
      orderBy: { plan_date: "asc" },
    });

    const dreams = await prisma.dreamEntry.findMany({
      where: {
        user_id: req.userId,
        timestamp: { gte: thirtyDaysAgo },
      },
      orderBy: { timestamp: "asc" },
    });

    if (sleepPlans.length < 2 || dreams.length < 2) {
      return res.status(200).json({
        message:
          "Not enough combined sleep and dream data to calculate correlations.",
      });
    }

    const sleepData = sleepPlans.map((plan) => ({
      date: plan.plan_date.toISOString().split("T")[0],
      duration:
        (plan.wake_time.getTime() - plan.sleep_time.getTime()) /
        (1000 * 60 * 60),
    }));

    const dreamData = dreams.reduce((acc, dream) => {
      const date = dream.timestamp.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { lucidCount: 0 };
      }
      if (dream.is_lucid) {
        acc[date].lucidCount++;
      }
      return acc;
    }, {});

    const combinedData = sleepData.map((sleep) => ({
      ...sleep,
      lucidCount: dreamData[sleep.date] ? dreamData[sleep.date].lucidCount : 0,
    }));

    const correlation = pearsonCorrelation(
      combinedData.map((d) => d.duration),
      combinedData.map((d) => d.lucidCount)
    );

    res.status(200).json({ correlation });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

function pearsonCorrelation(x, y) {
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0,
    sumY2 = 0;
  const n = x.length;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

module.exports = {
  getDreamConsistency,
  getEmotionalSleepMap,
  getDreamEmotionsDistribution,
  getSleepDuration,
  getLucidDreamsPerDay,
  getSleepDreamCorrelations,
};
