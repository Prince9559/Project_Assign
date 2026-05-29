import { z } from "zod";

// ==================== ZOD VALIDATION SCHEMA FOR JOB POST PAGE ====================

// Main schema with conditional validation
export const jobPostSchema = z
  .object({
    opportunity_type: z.enum(["Internship", "Job", "Project"]),

    // === Job Role ===
    job_role_id: z.union([z.number().positive(), z.null()]).optional(),
    other_job_role: z.string().optional(),

    // === Skills ===
    skill_ids: z.array(z.number()).optional(),
    other_skills: z
      .array(
        z.object({
          domain: z.string().min(1, "Domain name is required"),
          skill: z.string().min(1, "Skill name is required"),
        })
      )
      .optional(),

    // === Locations (multi-select) ===
    eligiblecity_ids: z.array(z.number()).optional(),
    other_eligible_city_names: z.array(z.string()).optional(), // ← array of custom city names

    //Locations (multi-select + custom)
    eligiblecollege_ids: z.array(z.number()).optional(),
    other_eligible_college_names: z.array(z.string()).optional(),

    // Courses (multi-select + custom)
    eligiblecourse_ids: z.array(z.number()).optional(),
    other_eligible_course_names: z.array(z.string()).optional(),

    // === Duration (Internship only) ===
    duration_id: z.union([z.number().positive(), z.null()]).optional(),
    other_duration: z.string().optional(),

    // === Rest of fields (unchanged) ===
    job_type: z.enum(["In office", "Hybrid", "Remote"]),
    job_time: z.enum(["Day Shift", "Night Shift", "Part-time"]),
    number_of_openings: z.coerce
      .number({ invalid_type_error: "Please enter a valid number" })
      .positive("Number of openings must be at least 1"),
    job_description: z
      .string()
      .min(10, "Description is required (minimum 10 characters)"),
    candidate_preferences: z.string().optional(),
    women_preferred: z.boolean().optional(),
    stipend_type: z.enum(["Paid", "Unpaid", "Fixed", "Variable"]).optional(),
    incentive_per_year: z.string().optional(),
    perks: z.array(z.string()).optional(),
    screening_questions: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const lines = val
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
          return lines.length <= 5;
        },
        {
          message: "You can add up to 5 screening questions (one per line).",
        }
      ),
    phone_contact: z.string().min(10, "Phone number is required"),
    alternate_phone_number: z.string().optional().nullable(),
    job_status: z.boolean().default(true),
    stipend_min: z.coerce.number().nullable().optional(),
    stipend_max: z.coerce.number().nullable().optional(),
    days_in_office: z.coerce.number().nullable().optional(),
    minSkillMatchRequired: z.coerce
      .number({ invalid_type_error: "Please enter a percentage (0–100)" })
      .int()
      .min(0)
      .max(100)
      .optional(),

    // Internship-specific dates
    internship_start_date: z.string().optional(),
    internship_from_date: z.string().optional(),
    internship_to_date: z.string().optional(),
    is_custom_internship_date: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // ========== JOB ROLE ==========
    if (data.job_role_id === null && !data.other_job_role?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the custom job role",
        path: ["other_job_role"],
      });
    }
    if (
      data.job_role_id != null &&
      (!data.job_role_id || data.job_role_id <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a job role",
        path: ["job_role_id"],
      });
    }

    // ========== SKILLS ==========
    const hasSelectedSkills =
      Array.isArray(data.skill_ids) && data.skill_ids.length > 0;
    const hasOtherSkills =
      Array.isArray(data.other_skills) && data.other_skills.length > 0;
    if (!hasSelectedSkills && !hasOtherSkills) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "At least one skill is required (select from list or add custom)",
        path: ["skill_ids"],
      });
    }

    // ========== LOCATIONS ==========
    const hasSelectedCities =
      Array.isArray(data.eligiblecity_ids) && data.eligiblecity_ids.length > 0;
    const hasOtherCities =
      Array.isArray(data.other_eligible_city_names) &&
      data.other_eligible_city_names.some((c) => c.trim());
    if (!hasSelectedCities && !hasOtherCities) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select at least one city or add a custom city",
        path: ["eligiblecity_ids"],
      });
    }

    // ========== COLLEGES (all opportunity types) ==========
    const hasSelectedColleges =
      Array.isArray(data.eligiblecollege_ids) &&
      data.eligiblecollege_ids.length > 0;
    const hasOtherColleges =
      Array.isArray(data.other_eligible_college_names) &&
      data.other_eligible_college_names.some((name) => name.trim());
    // if (!hasSelectedColleges && !hasOtherColleges) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message:
    //       "Please select at least one college or add a custom college name",
    //     path: ["eligiblecollege_ids"],
    //   });
    // }

    // ========== COURSES (all opportunity types) ==========
    const hasSelectedCourses =
      Array.isArray(data.eligiblecourse_ids) &&
      data.eligiblecourse_ids.length > 0;
    const hasOtherCourses =
      Array.isArray(data.other_eligible_course_names) &&
      data.other_eligible_course_names.some((name) => name.trim());
    // if (!hasSelectedCourses && !hasOtherCourses) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message:
    //       "Please select at least one course or add a custom course name",
    //     path: ["eligiblecourse_ids"],
    //   });
    // }

    // ========== DURATION (Internship only) ==========
    if (data.opportunity_type === "Internship") {
      if (data.duration_id === null && !data.other_duration?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please specify the custom internship duration",
          path: ["other_duration"],
        });
      }
      if (
        data.duration_id != null &&
        (!data.duration_id || data.duration_id <= 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select an internship duration",
          path: ["duration_id"],
        });
      }

      // Date validation
      if (data.is_custom_internship_date) {
        if (!data.internship_from_date) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Start date is required",
            path: ["internship_from_date"],
          });
        }
        if (!data.internship_to_date) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End date is required",
            path: ["internship_to_date"],
          });
        }
        if (data.internship_from_date && data.internship_to_date) {
          const from = new Date(data.internship_from_date);
          const to = new Date(data.internship_to_date);
          if (from > to) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "End date must be after start date",
              path: ["internship_to_date"],
            });
          }
        }
      }
    }

    // ========== STIPEND ==========
    const needsStipendRange =
      (data.opportunity_type === "Internship" &&
        data.stipend_type === "Paid") ||
      (data.opportunity_type !== "Internship" &&
        ["Fixed", "Variable"].includes(data.stipend_type));

    if (needsStipendRange) {
      if (data.stipend_min == null || data.stipend_max == null) {
        const label =
          data.opportunity_type === "Internship"
            ? "stipend"
            : data.opportunity_type === "Job"
            ? "salary"
            : "budget";
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Please enter both minimum and maximum ${label}`,
          path: ["stipend_min"],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Please enter both minimum and maximum ${label}`,
          path: ["stipend_max"],
        });
      } else if (data.stipend_min > data.stipend_max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Maximum amount must be greater than or equal to minimum",
          path: ["stipend_max"],
        });
      }
    }

    // ========== HYBRID DAYS ==========
    if (
      data.job_type === "Hybrid" &&
      (!data.days_in_office || data.days_in_office <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select the number of in-office days per week",
        path: ["days_in_office"],
      });
    }
  });

