import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import Select from "react-select";
import { Label, Input } from "../../../components/ui";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const THEME = {
  light: "#9BC87C",
  bright: "#00C950",
  dark: "#1DB32F",
  text: "#1e1e2d",
};
const lookingForOptions = ["Jobs", "Internship", "Project"];
const workModes = ["In-office", "Hybrid", "Work from home"];

const getCityFromLocation = (fullLocation) => {
  return fullLocation ? fullLocation.split(",")[0].trim() : "";
};

export default function PreferencesForm() {
  const { watch, setValue, register } = useFormContext();

  const [jobProfileSearch, setJobProfileSearch] = useState("");
  const [jobRoleOptions, setJobRoleOptions] = useState([]);
  const [isJobRoleLoading, setIsJobRoleLoading] = useState(false);

  const [locationSearch, setLocationSearch] = useState("");
  const [locationOptions, setLocationOptions] = useState([]);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const [companySearch, setCompanySearch] = useState("");
  const [companyOptions, setCompanyOptions] = useState([]);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);

  const currently_looking_for = watch("currently_looking_for") || [];
  const work_mode = watch("work_mode") || [];
  const job_profile = watch("job_profile") || [];
  const location = watch("location") || [];
  const company = watch("company") || [];
  const min_salary = watch("min_salary") || "";

  const toggle = (field, value) => {
    const arr = watch(field) || [];
    if (arr.includes(value)) {
      setValue(field, arr.filter((v) => v !== value));
    } else {
      setValue(field, [...arr, value]);
    }
  };

  const updateArrayValue = (field, index, value) => {
    const arr = [...(watch(field) || [])];
    arr[index] = value;
    setValue(field, arr.filter(Boolean));
  };

  /* ================= JOB ROLE SEARCH ================= */
  useEffect(() => {
    // if (jobProfileSearch.length < 3) return;
    const timer = setTimeout(async () => {
      try {
        setIsJobRoleLoading(true);
        const res = await fetch(
          `${BASE_URL}/master/job-roles/search?search=${jobProfileSearch}`
        );
        const json = await res.json();
        setJobRoleOptions(
          json.data.map((r) => ({ value: r.title, label: r.title }))
        );
      } finally {
        setIsJobRoleLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [jobProfileSearch]);

  /* ================= LOCATION SEARCH ================= */
  useEffect(() => {
    // if (locationSearch.length < 3) return;
    const timer = setTimeout(async () => {
      try {
        setIsLocationLoading(true);
        const res = await fetch(
          `${BASE_URL}/master/location/search?search=${locationSearch}`
        );
        const json = await res.json();
        setLocationOptions(
          json.data.map((l) => ({ value: l.name, label: l.name }))
        );
      } finally {
        setIsLocationLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [locationSearch]);

  /* ================= COMPANY SEARCH ================= */
  useEffect(() => {
    // if (companySearch.length < 3) return;
    const timer = setTimeout(async () => {
      try {
        setIsCompanyLoading(true);
        const res = await fetch(
          `${BASE_URL}/master/companies/search?search=${companySearch}`
        );
        const json = await res.json();
        setCompanyOptions(
          json.success
            ? json.data.map((c) => ({
              value: c.company_name,
              label: c.company_name,
            }))
            : []
        );
      } finally {
        setIsCompanyLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [companySearch]);

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 40,
      fontSize: "0.875rem",
      borderColor: state.isFocused ? THEME.dark : base.borderColor,
      boxShadow: state.isFocused ? `0 0 0 1px ${THEME.light}` : "none",
      "&:hover": {
        borderColor: state.isFocused ? THEME.dark : THEME.light,
      },
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected
        ? `${THEME.light}33`
        : state.isFocused
        ? `${THEME.light}1F`
        : "white",
      color: THEME.text,
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: `${THEME.light}33`,
      borderRadius: "0.375rem",
      border: `1px solid ${THEME.light}66`,
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: THEME.text,
      fontSize: "0.875rem",
      fontWeight: 600,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: THEME.dark,
      ":hover": {
        backgroundColor: `${THEME.light}33`,
        color: THEME.bright,
      },
    }),
  };
  const getFilteredOptions = (allOptions, selectedValues, currentIndex) => {
    return allOptions.filter(
      (opt) =>
        !selectedValues.includes(opt.value) ||
        selectedValues[currentIndex] === opt.value
    );
  };


  return (
    <div className="space-y-5">
      {/* HIDDEN FIELDS (SUBMIT SAME AS BEFORE) */}
      <input type="hidden" {...register("job_profile")} value={job_profile.join(",")} />
      <input type="hidden" {...register("location")} value={location.join(",")} />
      <input type="hidden" {...register("company")} value={company.join(",")} />
      <input type="hidden" {...register("min_salary")} value={min_salary} />
      <input
        type="hidden"
        {...register("currently_looking_for")}
        value={currently_looking_for.join(",")}
      />
      <input type="hidden" {...register("work_mode")} value={work_mode.join(",")} />

      {/* LOOKING FOR */}
      <div>
        <Label>Currently looking for:</Label>
        <div className="flex gap-2 mt-1 flex-wrap">
          {lookingForOptions.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => toggle("currently_looking_for", o)}
              className={`px-3 py-1.5 text-xs rounded border ${currently_looking_for.includes(o)
                  ? "bg-[#1DB32F] text-white border-[#1DB32F]"
                  : "bg-gray-100 border-gray-200 hover:border-[#9BC87C]"
                }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      {/* WORK MODE */}
      <div>
        <Label>Preferred Work Mode:</Label>
        <div className="flex gap-2 mt-1 flex-wrap">
          {workModes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => toggle("work_mode", m)}
              className={`px-3 py-1.5 text-xs rounded border ${work_mode.includes(m)
                  ? "bg-[#1DB32F] text-white border-[#1DB32F]"
                  : "bg-gray-100 border-gray-200 hover:border-[#9BC87C]"
                }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* JOB PROFILES (3 TIMES) */}
      <div>
        <Label>Preferred Job Profiles</Label>

        <Select
          placeholder="Select up to 3 Job Profiles"
          options={jobRoleOptions}

          // value={jobRoleOptions.filter((opt) =>
          //   job_profile.includes(opt.value)
          // )}
          value={job_profile.map((val) => ({
            value: val,
            label: val,
          }))}
          onInputChange={(v) => setJobProfileSearch(v)}

          onChange={(selectedOptions) => {
            const values = selectedOptions
              ? selectedOptions.map((opt) => opt.value).slice(0, 3)
              : [];

            // setFormData((prev) => ({
            //   ...prev,
            //   job_profile: values,
            // }));
            setValue("job_profile", values);
          }}

          isMulti
          isClearable
          isLoading={isJobRoleLoading}
          styles={selectStyles}
          className="mb-2"
        />
      </div>

      {/* LOCATIONS (3 TIMES) */}
      {/* <div>
        <Label>Preferred Locations</Label>
      {[0, 1, 2].map((i) => (
  <Select
    key={i}
    placeholder={`Location ${i + 1}`}
    options={getFilteredOptions(locationOptions, location, i)}
    value={
      location[i]
        ? { value: location[i], label: location[i] }
        : null
    }
    onInputChange={(v) => setLocationSearch(v)}
    onChange={(opt) =>
      updateArrayValue(
        "location",
        i,
        opt ? getCityFromLocation(opt.value) : ""
      )
    }
    isClearable
    isLoading={isLocationLoading}
    styles={selectStyles}
    className="mb-2"
  />
))}

      </div> */}
      <div>
        <Label>Preferred Locations</Label>

        <Select
          placeholder="Select up to 3 Locations"
          options={locationOptions}

          // value={locationOptions.filter((opt) =>
          //   location.includes(getCityFromLocation(opt.value))
          // )}
          value={location.map((val) => ({
            value: val,
            label: val,
          }))}
          onInputChange={(v) => setLocationSearch(v)}

          onChange={(selectedOptions) => {
            const values = selectedOptions
              ? selectedOptions
                .map((opt) => getCityFromLocation(opt.value))
                .slice(0, 3)
              : [];

            // setFormData((prev) => ({
            //   ...prev,
            //   location: values,
            // }));
            setValue("location", values);
          }}

          isMulti
          isClearable
          isLoading={isLocationLoading}
          styles={selectStyles}
          className="mb-2"
        />
      </div>
      {/* COMPANIES (3 TIMES) */}
      {/* <div>
        <Label>Preferred Companies</Label>
       {[0, 1, 2].map((i) => (
  <Select
    key={i}
    placeholder={`Company ${i + 1}`}
    options={getFilteredOptions(companyOptions, company, i)}
    value={
      company[i]
        ? { value: company[i], label: company[i] }
        : null
    }
    onInputChange={(v) => setCompanySearch(v)}
    onChange={(opt) =>
      updateArrayValue("company", i, opt?.value)
    }
    isClearable
    isLoading={isCompanyLoading}
    styles={selectStyles}
    className="mb-2"
  />
))}

      </div> */}
      <div>
        <Label>Preferred Companies</Label>

        <Select
          placeholder="Select up to 3 Companies"
          options={companyOptions}

          // value={companyOptions.filter((opt) =>
          //   company.includes(opt.value)
          // )}

          value={company.map((val) => ({
            value: val,
            label: val,
          }))}

          onInputChange={(v) => setCompanySearch(v)}

          onChange={(selectedOptions) => {
            const values = selectedOptions
              ? selectedOptions.map((opt) => opt.value).slice(0, 3)
              : [];

            // setFormData((prev) => ({
            //   ...prev,
            //   company: values,
            // }));
            setValue("company", values);
          }}

          isMulti
          isClearable
          isLoading={isCompanyLoading}
          styles={selectStyles}
          className="mb-2"
        />
      </div>

      {/* SALARY */}
      <div>
        <Label>Minimum Annual Salary (INR)</Label>
        <Input
          type="number"
          value={min_salary}
          onChange={(e) => setValue("min_salary", e.target.value)}
          placeholder="e.g. 300000"
        />
      </div>
    </div>
  );
}
