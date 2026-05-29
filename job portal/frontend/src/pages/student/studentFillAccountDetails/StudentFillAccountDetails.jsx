import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import NextButton from "../../../components/ui/NextButton";

import PersonalInfo from "./PersonalInfo";
import EducationInfo from "./EducationInfo";
import SkillsForm from "./SkillsForm";
import PreferencesForm from "./PreferencesForm";
import ProgressBar from "./ProgressBar";

import Button from "../../../components/ui/Button";
import Header from "../../../components/shared/Header";

import { useUserDetailsApi } from "../../../hooks/useUserDetailsApi";
import { updateUser } from "../../../redux/feature/authSlice";
import { showSuccessAlert, showErrorAlert } from "../../../utils/alertService";

/* ---------------- CONSTANTS ---------------- */

const steps = [
  "Personal Info",
  "Education Info",
  "Your Skills",
  "Your Preferences",
];

const SCHOOL_STANDARDS = ["Class X or below", "Class XI", "Class XII"];

const parseDate = (str) => {
  if (!str) return null;
  const [year, month] = str.split("-").map(Number);
  return new Date(year, month - 1);
};

/* ---------------- SCHEMAS ---------------- */

const personalInfoSchema = z.object({
  first_name: z.string().min(1, "First Name is required").max(50),
  last_name: z.string().min(1, "Last Name is required").max(50),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^[+]?[\d\s\-()]+$/, "Invalid phone"),
  dob: z.string().min(1, "Date of Birth is required"),
  current_location_id: z.coerce.string().min(1, "Please select your city"),
  gender: z.string().min(1),
});

const preferencesSchema = z.object({
  currently_looking_for: z.array(z.string()).optional(),
  work_mode: z.array(z.string()).optional(),
  job_profile: z.array(z.string()).max(3).optional(),
  location: z.array(z.string()).max(3).optional(),
  company: z.array(z.string()).max(3).optional(),
  min_salary: z.string().optional(),
});

const skillEntrySchema = z
  .object({
    skill_id: z.coerce.number().nullable().optional(),
    other_skill_name: z.string().optional(),
    skill_name: z.string().optional(),
  })
  .passthrough()
  .refine(
    (s) =>
      (s.skill_id != null && !Number.isNaN(Number(s.skill_id))) ||
      (typeof s.other_skill_name === "string" && s.other_skill_name.trim().length > 0) ||
      (typeof s.skill_name === "string" && s.skill_name.trim().length > 0),
    { message: "Each skill must have a name" }
  );

const domainEntrySchema = z
  .object({
    authority_id: z.union([z.string(), z.number(), z.null()]).optional(),
    organization_name: z.string().optional(),
    domain_id: z.coerce.number().nullable().optional(),
    other_domain_name: z.string().optional(),
    skills: z.array(skillEntrySchema).min(1, "Add at least one skill"),
    start_date: z.string().optional(),
    end_date: z.string().nullable().optional(),
  })
  .passthrough();

const domainsSchema = z.object({
  domains: z.array(domainEntrySchema).default([]),
});

const educationEntrySchema = z.object({
  // level: z.enum(["school", "diploma", "bachelors", "masters", "phd", "other"],

  level: z.enum(["school", "diploma", "bachelors", "masters", "phd", "other"], {
    errorMap: () => ({ message: "Please select an education level" })
  }),
    
 
  school_college_id: z.number().nullable(),
  other_institution_name: z.string().optional(),
  standard_or_grade: z.string().optional(),
  course_id: z.number().nullable().optional(),
  other_course_name: z.string().optional(),
  specialization_id: z.number().nullable().optional(),
  other_specialization_name: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().nullable().optional(),
});

const educationsSchema = z.array(educationEntrySchema).min(1);

const formSchema = z.object({
  ...personalInfoSchema.shape,
  educations: educationsSchema,
  ...preferencesSchema.shape,
  ...domainsSchema.shape,
});


/* ---------------- COMPONENT ---------------- */

export default function StudentFillDetail() {
  const { createUserDetails } = useUserDetailsApi();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      current_location_id: "",
      gender: "",
      currently_looking_for: [],
      work_mode: [],
      domains: [],
      educations: [],
      job_profile: [],
      location: [],
      company: [],
      min_salary: "",
    },
  });

  /* ---------------- NEXT ---------------- */

  const onNext = async () => {
    let fields = [];

    if (step === 0)
      fields = [
        "first_name",
        "last_name",
        "email",
        "phone",
        "dob",
        "current_location_id",
        "gender",
      ];
    if (step === 1) fields = ["educations"];
    if (step === 2) fields = ["domains"];
    if (step === 3) fields = ["currently_looking_for", "work_mode"];

    const valid = await methods.trigger(fields);
    if (!valid) {
      const fieldErrors = methods.formState.errors;
      if (step === 2) {
        const domainList = methods.getValues("domains") || [];
        const parts = [];
        if (fieldErrors.domains?.message) parts.push(fieldErrors.domains.message);
        if (Array.isArray(fieldErrors.domains)) {
          fieldErrors.domains.forEach((err, i) => {
            if (err?.skills?.message) {
              parts.push(`Experience block ${i + 1}: add at least one skill.`);
            }
          });
        }
        if (domainList.length === 0) {
          parts.push(
            "Select company & dates, click “Add skill area”, then add skills—or use Skip below."
          );
        } else {
          domainList.forEach((d, i) => {
            if (!d.skills?.length) {
              parts.push(`Skill area ${i + 1}: add at least one skill (type name → Add or Enter).`);
            }
          });
        }
        await showErrorAlert(
          "Experience step incomplete",
          parts.join(" ") ||
            "Add a skill area and at least one skill, or skip this step."
        );
      }
      return;
    }

    if (step === 2) {
      const domainList = methods.getValues("domains") || [];
      const incomplete = domainList.some((d) => !d.skills?.length);
      if (incomplete) {
        await showErrorAlert(
          "Add skills",
          "Each skill area needs at least one skill. Type a skill name and click Add or press Enter."
        );
        return;
      }
    }

    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const isValid = await methods.trigger();
      if (!isValid) return;

      const formData = methods.getValues();
      await createUserDetails(formData, user.token);

      dispatch(updateUser({ profile_status: 2 }));
      await showSuccessAlert("Success!", "Profile updated");

      navigate("/all-jobs", { replace: true });
    } catch (err) {
      showErrorAlert("Error", "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-[#f5f6f7] min-h-screen">
      <Header />
      <div className="flex justify-center w-full">
        {/* <div className="w-full max-w-2xl p-6 mt-6 bg-white rounded-xl"> */}
        <div className="w-full max-w-2xl p-6 mt-6 bg-white rounded-xl border-1 border-[#00C950]">
          <ProgressBar currentStep={step} steps={steps} />

          <FormProvider {...methods}>
            <form>
              {step === 0 && <PersonalInfo />}
              {step === 1 && <EducationInfo />}
              {step === 2 && <SkillsForm />}
              {step === 3 && <PreferencesForm />}

              <div className="flex justify-end gap-3 mt-8">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      methods.setValue("domains", [], { shouldValidate: true });
                      setStep((s) => s + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Skip experience
                  </Button>
                )}
                {step < steps.length - 1 ? (
                  <Button type="button" onClick={onNext}>Next</Button>
                ) : (
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}