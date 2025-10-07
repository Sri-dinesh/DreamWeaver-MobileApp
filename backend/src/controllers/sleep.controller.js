const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
// exports.deleteSleepPlan = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const plan = await prisma.sleepPlan.findUnique({
//       where: { id: parseInt(id) },
//     });

//     if (!plan) {
//       return res.status(404).json({ message: "Sleep plan not found" });
//     }

//     if (plan.user_id !== req.userId) {
//       return res.status(403).json({ message: "User not authorized" });
//     }

//     await prisma.sleepPlan.delete({
//       where: { id: parseInt(id) },
//     });

//     res.status(500).json({ message: "Something went wrong", error });
//   } catch (error) {
//     res.status(500).json({ message: "Something went wrong", error });
//   }
// };

// Fix the delete sleep plan function
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

    // Fixed response - was returning error 500 incorrectly
    res.status(200).json({ message: "Sleep plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};


// Modify the generateRitual function to save the ritual to a plan
exports.generateRitual = async (req, res) => {
  const { goal, plan_date } = req.body;

  if (!goal) {
    return res.status(400).json({ message: "Goal is required" });
  }

  const prompt = `Create a personalized sleep ritual for someone whose goal is to "${goal}". The ritual should be calming and help them achieve their goal. Format the response as a structured step-by-step ritual with 4-6 steps that they can follow before bed. Include specific techniques for better sleep quality.`;

  try {
    // Generate content using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const ritual = response.text();

    // If plan_date is provided, save the ritual to that plan
    if (plan_date) {
      await prisma.sleepPlan.updateMany({
        where: {
          user_id: req.userId,
          plan_date: new Date(plan_date),
        },
        data: {
          ai_ritual_suggestion: ritual,
        },
      });
    }

    res.status(200).json({ ritual });
  } catch (error) {
    console.error("Error generating ritual:", error);
    res.status(500).json({ 
      message: "Failed to generate sleep ritual", 
      error: error.message 
    });
  }
};

// Add a new endpoint to get sleep plans with search and filters
exports.searchSleepPlans = async (req, res) => {
  const { query, startDate, endDate, sortBy, sortOrder } = req.query;
  
  try {
    // Build the where clause
    const where = { user_id: req.userId };
    
    // Add text search on goal field
    if (query) {
      where.goal = { contains: query, mode: 'insensitive' };
    }
    
    // Add date range filter
    if (startDate || endDate) {
      where.plan_date = {};
      if (startDate) {
        where.plan_date.gte = new Date(startDate);
      }
      if (endDate) {
        where.plan_date.lte = new Date(endDate);
      }
    }
    
    // Build the orderBy object
    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.plan_date = 'desc'; // Default sort
    }
    
    const plans = await prisma.sleepPlan.findMany({
      where,
      orderBy,
    });
    
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// @desc    Get sleep stats for a user
// @route   GET /api/sleep/stats
// @access  Private
// exports.getSleepStats = async (req, res) => {
//   try {
//     // Get sleep records for the past month
//     const oneMonthAgo = new Date();
//     oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

//     const sleepRecords = await prisma.sleepRecord.findMany({
//       where: {
//         user_id: req.userId,
//         date: {
//           gte: oneMonthAgo,
//         },
//       },
//       select: {
//         duration: true,
//       },
//     });

//     // Calculate average sleep duration
//     let averageSleep = 0;
//     if (sleepRecords.length > 0) {
//       const totalSleep = sleepRecords.reduce(
//         (acc, record) => acc + record.duration,
//         0
//       );
//       averageSleep = totalSleep / sleepRecords.length;
//     }

//     res.status(200).json({
//       averageSleep,
//       recordsCount: sleepRecords.length,
//     });
//   } catch (error) {
//     console.error("Error fetching sleep stats:", error);
//     res.status(500).json({
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// };


// Improved sleep stats calculation
exports.getSleepStats = async (req, res) => {
  try {
    // Get sleep plans for the past month for calculating average sleep duration
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const sleepPlans = await prisma.sleepPlan.findMany({
      where: {
        user_id: req.userId,
        plan_date: {
          gte: oneMonthAgo,
        },
        // Only include plans with both sleep and wake times for accurate duration calculation
        sleep_time: { not: null },
        wake_time: { not: null },
      },
      select: {
        sleep_time: true,
        wake_time: true,
      },
    });

    // Calculate average sleep duration
    let totalSleepHours = 0;
    let recordsWithDuration = 0;

    for (const plan of sleepPlans) {
      const sleepTime = new Date(plan.sleep_time);
      const wakeTime = new Date(plan.wake_time);
      
      // Calculate duration in hours
      let diffMs = wakeTime.getTime() - sleepTime.getTime();
      
      // If wake time is earlier than sleep time, assume it's for the next day
      if (diffMs < 0) {
        diffMs += 24 * 60 * 60 * 1000;
      }
      
      const durationHours = diffMs / (1000 * 60 * 60);
      
      // Only count reasonable sleep durations (between 1 and 16 hours)
      if (durationHours >= 1 && durationHours <= 16) {
        totalSleepHours += durationHours;
        recordsWithDuration++;
      }
    }

    // Calculate average
    const averageSleep = recordsWithDuration > 0 ? totalSleepHours / recordsWithDuration : null;

    // Get total number of plans to calculate activity
    const totalPlansCount = await prisma.sleepPlan.count({
      where: {
        user_id: req.userId
      }
    });

    // Get first record date to calculate days active
    const firstRecord = await prisma.sleepPlan.findFirst({
      where: {
        user_id: req.userId
      },
      orderBy: {
        plan_date: 'asc'
      },
      select: {
        plan_date: true
      }
    });

    // Calculate days active (days since first record, or use count if that's more meaningful)
    let daysActive = 0;
    if (firstRecord) {
      const firstRecordDate = new Date(firstRecord.plan_date);
      const today = new Date();
      const diffTime = Math.abs(today - firstRecordDate);
      daysActive = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    res.status(200).json({
      averageSleep: averageSleep !== null ? parseFloat(averageSleep.toFixed(1)) : null,
      recordsCount: sleepPlans.length,
      daysActive: daysActive
    });
  } catch (error) {
    console.error("Error fetching sleep stats:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};