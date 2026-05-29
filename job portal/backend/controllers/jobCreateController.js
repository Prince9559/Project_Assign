async function createJobWithSubscription({ req, res, company, subscription, post_type, opportunity_type, data }) {
  const transaction = await sequelize.transaction();

  try {
    // Create job as 'free' (will be activated immediately)
    const job = await JobPost.create(
      {
        company_recruiter_profile_id: company.id,
        opportunity_type,
        post_type, // store for analytics
        job_role_id: data.job_role_id,
        skill_required_note: data.skill_required_note,
        job_type: data.job_type,
        duration_id: data.duration_id,
        stipend_min: data.stipend_min,
        stipend_max: data.stipend_max,
        job_description: data.job_description,
        // ... other fields
        payment_type: "free", // temporarily — will update after credit deduction
        active_status: 0, // draft
      },
      { transaction }
    );

    //  Deduct 1 credit
    const oldRemaining = subscription.remaining_credits;
    const newRemaining = oldRemaining - 1;

    await subscription.update(
      {
        remaining_credits: newRemaining,
        used_credits: subscription.used_credits + 1,
      },
      { transaction }
    );

    //  Log credit usage
    await SubscriptionCreditLog.create(
      {
        subscription_id: subscription.subscription_id,
        company_id: company.id,
        action_type: "used",
        credits_before: oldRemaining,
        credits_changed: -1,
        credits_after: newRemaining,
        job_id: job.job_id,
        description: `Job posted: ${job.job_id}`,
      },
      { transaction }
    );

    // Activate job
    await job.update(
      {
        payment_type: "subscription",
        subscription_id: subscription.subscription_id,
        active_status: 1, // active and hiring
      },
      { transaction }
    );

    await transaction.commit();

    //  Success
    res.status(201).json({
      success: true,
      job_id: job.job_id,
      message: "Job posted successfully using subscription credits!",
      credits_remaining: newRemaining,
      job_url: `/jobs/${job.job_id}`,
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Job + credit deduction failed:", err);
    throw err;
  }
}