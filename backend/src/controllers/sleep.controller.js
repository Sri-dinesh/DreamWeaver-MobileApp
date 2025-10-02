const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @desc    Get all sleep plans for a user
// @route   GET /api/sleep/plans
// @access  Private
exports.getSleepPlans = async (req, res) => {
  try {
    const plans = await prisma.sleepPlan.findMany({
      where: { user_id: req.userId },
      orderBy: { plan_date: "desc" },
    });
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// @desc    Get a sleep plan for a specific date
// @route   GET /api/sleep/plans/:date
// @access  Private
exports.getSleepPlanByDate = async (req, res) => {
  const { date } = req.params;
  try {
    const plan = await prisma.sleepPlan.findFirst({
      where: {
        user_id: req.userId,
        plan_date: new Date(date),
      },
    });
    if (!plan) {
      return res
        .status(404)
        .json({ message: "Sleep plan not found for this date" });
    }
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// @desc    Create or update a sleep plan for a specific date
// @route   POST /api/sleep/plans
// @access  Private
exports.createOrUpdateSleepPlan = async (req, res) => {
  const { plan_date, goal, sleep_time, wake_time } = req.body;

  if (!plan_date || !goal) {
    return res.status(400).json({ message: "Date and goal are required" });
  }

  const data = {
    plan_date: new Date(plan_date),
    goal,
    sleep_time: sleep_time ? new Date(sleep_time) : null,
    wake_time: wake_time ? new Date(wake_time) : null,
    user: { connect: { id: req.userId } },
  };

  try {
    const plan = await prisma.sleepPlan.upsert({
      where: {
        user_id_plan_date: {
          user_id: req.userId,
          plan_date: new Date(plan_date),
        },
      },
      update: data,
      create: data,
    });
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// @desc    Delete a sleep plan
// @route   DELETE /api/sleep/plans/:id
// @access  Private
exports.deleteSleepPlan = async (req, res) => {
  const { id } = req.params;

  try {
    const plan = await prisma.sleepPlan.findUnique({
      where: { id: parseInt(id) },
    });

    if (!plan) {
      return res.status(404).json({ message: "Sleep plan not found" });
    }

    if (plan.user_id !== req.userId) {
      return res.status(403).json({ message: "User not authorized" });
    }

    await prisma.sleepPlan.delete({
      where: { id: parseInt(id) },
    });

    res.status(500).json({ message: "Something went wrong", error });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const { HfInference } = require("@huggingface/inference");

const hf = new HfInference(process.env.HF_TOKEN);

exports.generateRitual = async (req, res) => {
  const { goal } = req.body;

  if (!goal) {
    return res.status(400).json({ message: "Goal is required" });
  }

  const prompt = `Create a personalized sleep ritual for someone whose goal is to "${goal}". The ritual should be calming and help them achieve their goal.`;

  try {
    const response = await hf.textGeneration({
      model: "gpt2",
      inputs: prompt,
    });

    res.status(200).json({ ritual: response.generated_text });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// @desc    Get sleep stats for a user
// @route   GET /api/sleep/stats
// @access  Private
exports.getSleepStats = async (req, res) => {
  try {
    // Get sleep records for the past month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const sleepRecords = await prisma.sleepRecord.findMany({
      where: {
        user_id: req.userId,
        date: {
          gte: oneMonthAgo,
        },
      },
      select: {
        duration: true,
      },
    });

    // Calculate average sleep duration
    let averageSleep = 0;
    if (sleepRecords.length > 0) {
      const totalSleep = sleepRecords.reduce(
        (acc, record) => acc + record.duration,
        0
      );
      averageSleep = totalSleep / sleepRecords.length;
    }

    res.status(200).json({
      averageSleep,
      recordsCount: sleepRecords.length,
    });
  } catch (error) {
    console.error("Error fetching sleep stats:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
