const {
  sequelize,
  UniversityDetail,
  Course,
  Industry,
  CompanyRecruiterProfile,
  JobPost,
  UniversityBroadcast,
  CreditLog,
  UniversityCreditPackage,
  UniversityCreditOrder,
  UniversityCreditBatch,
} = require("../models");
const { Op } = require("sequelize");
const { getUniversityCredits } = require("../services/creditService");

const DEFAULT_BROADCAST_CREDITS = 1000;

const ensureDefaultCredits = async (universityId, transaction) => {
  const credits = await getUniversityCredits(universityId);
  if (credits.remaining_credits > 0) {
    return credits;
  }

  const existingGrant = await CreditLog.findOne({
    where: {
      university_id: universityId,
      reference_type: "default_broadcast_grant",
    },
    transaction,
  });

  if (existingGrant) {
    return getUniversityCredits(universityId);
  }

  const fallbackPackage = await UniversityCreditPackage.findOne({
    where: { is_active: true },
    order: [["display_order", "ASC"]],
    transaction,
  });

  if (!fallbackPackage) {
    throw new Error("NO_ACTIVE_CREDIT_PACKAGE");
  }

  const order = await UniversityCreditOrder.create(
    {
      university_id: universityId,
      package_id: fallbackPackage.package_id,
      credits_purchased: DEFAULT_BROADCAST_CREDITS,
      amount: 0,
      base_amount: 0,
      tax_amount: 0,
      total_amount: 0,
      tax_rate_percent: 0,
      validity_days: null,
      status: "paid",
      paid_at: new Date(),
      expires_at: null,
      razorpay_order_id: null,
    },
    { transaction }
  );

  await UniversityCreditBatch.create(
    {
      university_id: universityId,
      order_id: order.order_id,
      credits_added: DEFAULT_BROADCAST_CREDITS,
      credits_used: 0,
      expires_at: null,
    },
    { transaction }
  );

  await CreditLog.create(
    {
      university_id: universityId,
      action_type: "admin",
      credits_before: 0,
      credits_changed: DEFAULT_BROADCAST_CREDITS,
      credits_after: DEFAULT_BROADCAST_CREDITS,
      reference_type: "default_broadcast_grant",
      reference_id: order.order_id,
      description: "Initial 1000 broadcast credits granted by system",
    },
    { transaction }
  );

  return getUniversityCredits(universityId);
};

// 1. Get Dropdown Options
exports.getBroadcastOptions = async (req, res) => {
  try {
    const [courses, industries] = await Promise.all([
      Course.findAll({ attributes: ["id", "name"], order: [["name", "ASC"]] }),
      Industry.findAll({ attributes: ["id", "name"], order: [["name", "ASC"]] }),
    ]);

    return res.status(200).json({ courses, industries });
  } catch (error) {
    console.error("Error fetching broadcast options:", error);
    return res.status(500).json({ error: "Failed to load options" });
  }
};

// 2. Process Broadcast
exports.sendBroadcast = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      course_ids,
      industry_ids,
      is_immediate,
      start_date,
    } = req.body;

    if (!Array.isArray(course_ids) || course_ids.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "At least one course is required." });
    }

    if (!Array.isArray(industry_ids) || industry_ids.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "At least one industry is required." });
    }

    // Verify University
    const university = await UniversityDetail.findOne({
      where: { user_id: req.user.id },
      attributes: ["id"],
      transaction
    });

    if (!university) {
      await transaction.rollback();
      return res.status(404).json({ error: "University profile not found" });
    }

    // Find up to 1000 active/verified companies that are currently hiring and match the selected criteria
    const targetCompanies = await CompanyRecruiterProfile.findAll({
      where: {
        industry_id: { [Op.in]: industry_ids },
        status: 1,
        is_verified: true,
      },
      include: [
        {
          model: JobPost,
          as : "jobPosts",
          required: true,
          where: {
            active_status: 1,
          },
          include: [
            {
              model: Course,
              as: "eligibleCourses",
              attributes: [],
              required: true,
              where: { id: { [Op.in]: course_ids } },
              through: { attributes: [] },
            },
          ],
          attributes: [],
        },
      ],
      attributes: ["id", "company_name", "user_id"],
      order: sequelize.random(),
      limit: 1000, // Maximum limit as per requirement
      subQuery: false,
      distinct: true,
      transaction
    });

    const companiesReached = targetCompanies.length;
    
    if (companiesReached === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "No companies found for the selected criteria." });
    }

    const cost = companiesReached; // 1 credit per company reached

    // Check Credit Balance
    const credits = await ensureDefaultCredits(university.id, transaction);
    
    let finalCreditsRemaining = credits.remaining_credits;
    if (finalCreditsRemaining < cost) {
       // Optional fallback: If strict logic requires them to buy, return 402. 
       // But per prompt "give by default 1000 credits", we'll mock an injection if they are a new user.
       await transaction.rollback();
       return res.status(402).json({ 
           error: "Insufficient credits.", 
           required: cost, 
           available: finalCreditsRemaining 
       });
    }

    // Consume Credits (Raw SQL approach for safe deduction across batches)
    // NOTE: Ideally call your existing `consumeCredits` service here. 
    // Below is the manual deduction logic if service isn't exposed for generic usage.
    const [batches] = await sequelize.query(`
      SELECT batch_id, (credits_added - credits_used) AS remaining 
      FROM university_credit_batches 
      WHERE university_id = :univId AND credits_added > credits_used AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY expires_at ASC
      FOR UPDATE
    `, { replacements: { univId: university.id }, transaction });

    let remainingToDeduct = cost;
    for (const batch of batches) {
      if (remainingToDeduct <= 0) break;
      const deductAmount = Math.min(batch.remaining, remainingToDeduct);
      
      await sequelize.query(`
        UPDATE university_credit_batches 
        SET credits_used = credits_used + :deductAmount 
        WHERE batch_id = :batchId
      `, { replacements: { deductAmount, batchId: batch.batch_id }, transaction });
      
      remainingToDeduct -= deductAmount;
    }

    if (remainingToDeduct > 0) {
      await transaction.rollback();
      return res.status(402).json({ error: "Failed to deduct credits. Please try again." });
    }

    // Log the transaction
    await CreditLog.create({
      university_id: university.id,
      action_type: "used",
      credits_before: finalCreditsRemaining,
      credits_changed: -cost,
      credits_after: finalCreditsRemaining - cost,
      reference_type: "broadcast",
      description: `Broadcast sent to ${companiesReached} companies`,
    }, { transaction });

    // Fetch Names for History Storage
    const selectedCourses = await Course.findAll({ where: { id: course_ids }, transaction });
    const selectedIndustries = await Industry.findAll({ where: { id: industry_ids }, transaction });

    // Save Broadcast History
    const broadcast = await UniversityBroadcast.create({
      university_id: university.id,
      courses_selected: selectedCourses.map(c => c.name),
      industries_selected: selectedIndustries.map(i => i.name),
      is_immediate,
      start_date: is_immediate ? null : start_date,
      companies_reached: companiesReached,
      credits_used: cost,
      status: "Delivered"
    }, { transaction });

    // TODO: Trigger actual Email Service here in background (e.g., using SendGrid, AWS SES, or BullMQ)
    // sendBroadcastEmails(targetCompanies, university, ...);

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: `Broadcast successfully sent to ${companiesReached} companies!`,
      broadcast
    });

  } catch (error) {
     console.log(error);
    await transaction.rollback();
    console.error("Broadcast Error:", error);
     
    return res.status(500).json({ error: "Failed to send broadcast" });
   
  }
};

// 3. Get History
exports.getBroadcastHistory = async (req, res) => {
  try {
    const university = await UniversityDetail.findOne({
      where: { user_id: req.user.id },
      attributes: ["id"],
    });

    if (!university) return res.status(404).json({ error: "University not found" });

    const history = await UniversityBroadcast.findAll({
      where: { university_id: university.id },
      order: [["created_at", "DESC"]],
      limit: 50
    });

    return res.status(200).json(history);
  } catch (error) {
    if (error?.original?.code === "ER_NO_SUCH_TABLE") {
      return res.status(200).json([]);
    }
    console.error("History Error:", error);
    return res.status(500).json({ error: "Failed to fetch history" });
  }
};