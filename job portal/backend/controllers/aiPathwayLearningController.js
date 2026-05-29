const db = require("../models");
const path = require("path");

function normalizeSkills(skillsGained) {
  if (skillsGained == null) return [];
  if (Array.isArray(skillsGained)) return skillsGained;
  if (typeof skillsGained === "string") {
    try {
      const parsed = JSON.parse(skillsGained);
      return normalizeSkills(parsed);
    } catch {
      return [];
    }
  }
  if (typeof skillsGained === "object") {
    if (skillsGained.skill_name != null || skillsGained.name != null) {
      return [skillsGained];
    }
    const vals = Object.values(skillsGained);
    return vals.filter((v) => v && typeof v === "object");
  }
  return [];
}

function skillLabel(sk) {
  if (sk == null) return null;
  if (typeof sk === "string") return sk;
  if (typeof sk === "object") {
    return sk.skill_name || sk.name || null;
  }
  return null;
}

function buildResourceLink(step, resource) {
  if (resource?.external_url) return resource.external_url;
  if (step.resource_id) {
    return `/pathways/resource/${step.resource_id}`;
  }
  return null;
}

async function syncAiStepsFromPathwaySteps(pathwayId) {
  const existing = await db.AiPathwayStep.count({ where: { pathway_id: pathwayId } });
  if (existing > 0) return;

  const pathwaySteps = await db.PathwayStep.findAll({
    where: { pathway_id: pathwayId },
    order: [["step_order", "ASC"]],
    include: [{ model: db.LearningResource, as: "resource", required: false }],
  });

  for (const s of pathwaySteps) {
    const resource = s.resource;
    const skills = normalizeSkills(s.skills_gained);
    const subSkills = skills.map((sk) => ({
      skill_name: sk.skill_name,
      skill_id: sk.skill_id,
      experience_months: sk.experience_months,
    }));

    await db.AiPathwayStep.create({
      pathway_id: pathwayId,
      pathway_step_id: s.step_id,
      step_title: s.resource_title,
      resource_title: s.resource_title,
      resource_type: s.resource_type,
      resource_link: buildResourceLink(s, resource),
      description: s.step_reasoning || resource?.description || "",
      platform_source:
        resource?.external_provider_name ||
        (resource?.source_type === "external_agency" ? "External" : "Platform"),
      duration_label:
        s.duration_months != null ? `${Number(s.duration_months)} months` : null,
      skills,
      sub_skills: subSkills.length ? subSkills : skills,
      order_index: s.step_order,
    });
  }
}

async function ensureProgressForUser(userId, pathwayId) {
  const steps = await db.AiPathwayStep.findAll({
    where: { pathway_id: pathwayId },
    order: [["order_index", "ASC"]],
    attributes: ["id"],
  });
  for (const st of steps) {
    await db.AiPathwayProgress.findOrCreate({
      where: { user_id: userId, step_id: st.id },
      defaults: {
        pathway_id: pathwayId,
        status: "pending",
      },
    });
  }
}

async function rollupPathwayStatus(pathwayId) {
  const pathway = await db.UserPathway.findByPk(pathwayId);
  if (!pathway) return;
  const steps = await db.AiPathwayStep.findAll({
    where: { pathway_id: pathwayId },
    attributes: ["id"],
  });
  if (!steps.length) return;

  const progresses = await db.AiPathwayProgress.findAll({
    where: { pathway_id: pathwayId, user_id: pathway.user_id },
  });
  const completed = progresses.filter((p) => p.status === "completed").length;
  if (completed === steps.length) {
    await pathway.update({ status: "completed" });
  } else if (completed > 0) {
    await pathway.update({ status: "in_progress" });
  }
}

/**
 * GET /api/pathways/learning/:pathwayId/dashboard
 */
exports.getLearningDashboard = async (req, res) => {
  try {
    const pathwayId = parseInt(req.params.pathwayId, 10);
    const userId = req.user.id;

    const pathway = await db.UserPathway.findOne({
      where: { pathway_id: pathwayId, user_id: userId },
      include: [
        {
          model: db.JobPost,
          as: "targetJob",
          attributes: ["job_id", "job_role_id"],
          required: false,
          include: [{ model: db.JobRole, attributes: ["id", "title"] }],
        },
      ],
    });

    if (!pathway) {
      return res.status(404).json({ success: false, message: "Pathway not found" });
    }

    await syncAiStepsFromPathwaySteps(pathwayId);
    await ensureProgressForUser(userId, pathwayId);

    const steps = await db.AiPathwayStep.findAll({
      where: { pathway_id: pathwayId },
      order: [["order_index", "ASC"]],
    });

    const progresses = await db.AiPathwayProgress.findAll({
      where: { user_id: userId, pathway_id: pathwayId },
    });
    const progressByStep = Object.fromEntries(progresses.map((p) => [p.step_id, p]));

    const merged = steps.map((st) => {
      const plain = st.get({ plain: true });
      const prog = progressByStep[plain.id];
      return {
        ...plain,
        progress: prog ? prog.get({ plain: true }) : null,
      };
    });

    const total = merged.length;
    const completed = merged.filter((m) => m.progress?.status === "completed").length;
    const completion_percent = total ? Math.round((completed / total) * 100) : 0;

    const learned_skills = [];
    const learned_sub_skills = [];
    merged.forEach((m) => {
      if (m.progress?.status !== "completed") return;
      normalizeSkills(m.skills).forEach((sk) => {
        const label = skillLabel(sk);
        if (label) learned_skills.push(label);
      });
      normalizeSkills(m.sub_skills).forEach((sk) => {
        const label = skillLabel(sk);
        if (label) learned_sub_skills.push(label);
      });
    });

    const targetRoleLabel =
      pathway.target_type === "job_specific"
        ? pathway.targetJob?.JobRole?.title || `Job #${pathway.target_job_id || ""}`
        : pathway.target_role_name || "Target role";

    return res.json({
      success: true,
      data: {
        pathway: {
          pathway_id: pathway.pathway_id,
          target_type: pathway.target_type,
          target_role_name: pathway.target_role_name,
          target_job_id: pathway.target_job_id,
          target_display: targetRoleLabel,
          status: pathway.status,
          pathway_rank: pathway.pathway_rank,
        },
        steps: merged.map((m) => ({
          id: m.id,
          step_title: m.step_title,
          resource_title: m.resource_title || m.step_title,
          resource_type: m.resource_type,
          resource_link: m.resource_link,
          description: m.description,
          platform_source: m.platform_source,
          duration_label: m.duration_label,
          skills: normalizeSkills(m.skills),
          sub_skills: normalizeSkills(m.sub_skills),
          order_index: m.order_index,
          status: m.progress?.status || "pending",
          completion_file: m.progress?.completion_file || null,
          completed_at: m.progress?.completed_at || null,
          progress_id: m.progress?.id || null,
        })),
        stats: {
          total_steps: total,
          completed_steps: completed,
          completion_percent,
        },
        learned_skills: [...new Set(learned_skills)],
        learned_sub_skills: [...new Set(learned_sub_skills)],
        remaining_steps: merged.filter((m) => m.progress?.status !== "completed").length,
      },
    });
  } catch (err) {
    console.error("getLearningDashboard:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load pathway learning dashboard",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * PATCH /api/pathways/learning/:pathwayId/steps/:stepId/status
 * Body: { status: "pending" | "in_progress" }
 */
exports.patchStepStatus = async (req, res) => {
  try {
    const pathwayId = parseInt(req.params.pathwayId, 10);
    const stepId = parseInt(req.params.stepId, 10);
    const userId = req.user.id;
    const { status } = req.body;

    if (!["pending", "in_progress"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Only pending or in_progress allowed. Use complete endpoint to finish.",
      });
    }

    const pathway = await db.UserPathway.findOne({
      where: { pathway_id: pathwayId, user_id: userId },
    });
    if (!pathway) {
      return res.status(404).json({ success: false, message: "Pathway not found" });
    }

    const step = await db.AiPathwayStep.findOne({
      where: { id: stepId, pathway_id: pathwayId },
    });
    if (!step) {
      return res.status(404).json({ success: false, message: "Step not found" });
    }

    const [progress, created] = await db.AiPathwayProgress.findOrCreate({
      where: { user_id: userId, step_id: stepId },
      defaults: { pathway_id: pathwayId, status },
    });

    if (!created && progress.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Step already completed",
      });
    }
    if (!created) {
      await progress.update({ status });
    }

    if (step.pathway_step_id) {
      const patch = { status };
      if (status === "in_progress") patch.started_at = new Date();
      await db.PathwayStep.update(patch, { where: { step_id: step.pathway_step_id } });
    }

    await rollupPathwayStatus(pathwayId);

    return res.json({ success: true, data: progress.get({ plain: true }) });
  } catch (err) {
    console.error("patchStepStatus:", err);
    return res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

/**
 * POST /api/pathways/learning/:pathwayId/steps/:stepId/complete
 * multipart field `pathwayProof` required except for resource_type === job
 */
exports.completeStep = async (req, res) => {
  try {
    const pathwayId = parseInt(req.params.pathwayId, 10);
    const stepId = parseInt(req.params.stepId, 10);
    const userId = req.user.id;

    const pathway = await db.UserPathway.findOne({
      where: { pathway_id: pathwayId, user_id: userId },
    });
    if (!pathway) {
      return res.status(404).json({ success: false, message: "Pathway not found" });
    }

    const step = await db.AiPathwayStep.findOne({
      where: { id: stepId, pathway_id: pathwayId },
    });
    if (!step) {
      return res.status(404).json({ success: false, message: "Step not found" });
    }

    const requiresProof = !["job"].includes(step.resource_type);
    let proofFile = null;
    if (req.files && Array.isArray(req.files)) {
      const f = req.files.find((x) => x.fieldname === "pathwayProof");
      if (f) {
        const normalized = f.path.replace(/\\/g, "/");
        const idx = normalized.indexOf("uploads/");
        proofFile =
          idx >= 0
            ? normalized.slice(idx)
            : `uploads/pathwayProofs/${path.basename(normalized)}`;
      }
    }

    if (requiresProof && !proofFile) {
      return res.status(400).json({
        success: false,
        message: "Upload a screenshot or document (PDF/image) to complete this step.",
      });
    }

    const [progress, created] = await db.AiPathwayProgress.findOrCreate({
      where: { user_id: userId, step_id: stepId },
      defaults: {
        pathway_id: pathwayId,
        status: "completed",
        completion_file: proofFile,
        completed_at: new Date(),
      },
    });

    if (!created && progress.status === "completed") {
      return res.status(400).json({ success: false, message: "Step already completed" });
    }

    await progress.update({
      status: "completed",
      completion_file: proofFile || progress.completion_file,
      completed_at: new Date(),
    });

    if (step.pathway_step_id) {
      await db.PathwayStep.update(
        { status: "completed", completed_at: new Date() },
        { where: { step_id: step.pathway_step_id } }
      );
    }

    await rollupPathwayStatus(pathwayId);

    return res.json({
      success: true,
      message: "Step marked completed",
      data: {
        ...progress.get({ plain: true }),
        completed_skills: normalizeSkills(step.skills).map((s) => s.skill_name).filter(Boolean),
      },
    });
  } catch (err) {
    console.error("completeStep:", err);
    return res.status(500).json({ success: false, message: "Failed to complete step" });
  }
};
