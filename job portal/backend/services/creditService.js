// services/creditService.js
const { sequelize, UniversityDetail, UniversityCreditBatch, ContactUnlock, CreditLog } = require("../models");

const {Op, col, literal}=require("sequelize");

// Get university credit balance (real-time, batch-aware)
async function getUniversityCredits(universityId) {
  const [result] = await sequelize.query(
    `
    SELECT 
      COALESCE(SUM(b.credits_added - b.credits_used), 0) AS remaining_credits,
      MIN(b.expires_at) AS next_expiry
    FROM university_credit_batches b
    WHERE 
      b.university_id = :university_id
      AND (b.expires_at IS NULL OR b.expires_at > NOW())
      AND b.credits_added > b.credits_used
    `,
    {
      replacements: { university_id: universityId },
      type: sequelize.QueryTypes.SELECT,
    }
  );
  return {
    remaining_credits: parseInt(result.remaining_credits) || 0,
    next_expiry: result.next_expiry,
  };
}

// Atomically consume 1 credit and unlock contact
async function unlockContact(
  universityId,
  recruiterUserId,
  jobId = null,
  scope = "recruiter"
) {
  // Validate inputs early
  if (!jobId) throw new Error("job_id is required");
  if (scope !== "recruiter" && scope !== "job") {
    throw new Error("Invalid scope: must be 'recruiter' or 'job'");
  }
  return sequelize.transaction(async (t) => {
    // 1. Get university detail (to ensure it exists)
    const university = await UniversityDetail.findByPk(universityId, {
      transaction: t,
    });
    if (!university) throw new Error("University not found");


    //  Key change: build uniqueness condition based on scope
    const uniqueWhere =
      scope === "recruiter"
        ? { university_id: universityId, recruiter_user_id: recruiterUserId }
        : { university_id: universityId, job_id: jobId }; // per-job

    // Check for existing unlock
    const existingUnlock = await ContactUnlock.findOne({
      where: uniqueWhere,
      transaction: t,
    });

    if (existingUnlock) {
      // Reuse existing — no credit consumed
      const credits = await getUniversityCredits(universityId);
      return {
        unlock: existingUnlock,
        remaining_credits: credits.remaining_credits,
        reused: true,
      };
    }


    // 2. Find oldest non-expired batch with available credits
    const batch = await UniversityCreditBatch.findOne({
      where: {
        university_id: universityId,
        credits_added: { [Op.gt]: col("credits_used") },
        [Op.or]: [
          { expires_at: null },
          { expires_at: { [Op.gt]: new Date() } },
        ],
      },
      order: [["created_at", "ASC"]],
      transaction: t,
    });

    if (!batch) {
      throw new Error("INSUFFICIENT_CREDITS");
    }

    // 3. Deduct 1 credit from batch (atomic)
    const [updated] = await UniversityCreditBatch.update(
      {
        credits_used: literal("credits_used + 1"),
      },
      {
        where: {
          batch_id: batch.batch_id,
          credits_added: { [Op.gt]: col("credits_used") }, // prevent race
        },
        transaction: t,
      }
    );

    if (updated === 0) {
      throw new Error("CONCURRENT_UNLOCK_FAILED"); // retry or fail
    }

    // 4. Record unlock
    const unlock = await ContactUnlock.create(
      {
        university_id: universityId,
        recruiter_user_id: recruiterUserId,
        job_id: jobId,
        batch_id: batch.batch_id,
      },
      { transaction: t }
    );

    // 5. Log credit usage
    const creditsBefore = await getUniversityCredits(universityId);
    await CreditLog.create(
      {
        university_id: universityId,
        user_id: null, // or req.user.id if tracking who clicked
        action_type: "used",
        credits_before: creditsBefore.remaining_credits + 1,
        credits_changed: -1,
        credits_after: creditsBefore.remaining_credits,
        reference_type: "contact_unlock",
        reference_id: unlock.unlock_id,
        description: `Unlocked contact for recruiter_user_id=${recruiterUserId}`,
      },
      { transaction: t }
    );

    return {
      unlock,
      remaining_credits: creditsBefore.remaining_credits,
      reused:false,
    };
  });
}

module.exports = {
  getUniversityCredits,
  unlockContact,
};