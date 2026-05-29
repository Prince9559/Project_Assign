import React, { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import Select from "react-select";
import { Loader, Input, PhoneInput } from "../../../components/ui";
import ReactSelectDropdown from "../../../components/ui/ReactSelectDropdown";
import GreenCreatableSelect from "../../../components/StudentPannel/CreatableSelect";
import axios from "axios";
import { useRef, useState} from "react";
const BASE_URL=import.meta.env.VITE_BASE_URL
export default function PersonalInfo() {
  const {
    register,
    formState: { errors },
    setValue,
    control,
    trigger,
  } = useFormContext();

  const { user } = useSelector((state) => state.auth);



const [locationOptionsApi, setLocationOptionsApi] = useState([]);
const [locationSearchText, setLocationSearchText] = useState("");
const [selectedCityOption, setSelectedCityOption] = useState(null);
const [isLocationLoading, setIsLocationLoading] = useState(false);
const locationSearchTimeoutRef = useRef(null);

const handleLocationInputChange = (inputValue, actionMeta) => {
  if (actionMeta.action === "input-change") {
    setLocationSearchText(inputValue);
  }
  return inputValue;
};

const handleCreateCity = async (cityName, onChange) => {
  const name = cityName.trim();
  if (!name) return;
  try {
    const res = await axios.post(`${BASE_URL}/master/location`, { name });
    const loc = res.data?.data;
    if (!loc?.id) return;
    const option = { value: String(loc.id), label: loc.name };
    setLocationOptionsApi((prev) => {
      const exists = prev.some((o) => o.value === option.value);
      return exists ? prev : [...prev, option];
    });
    setSelectedCityOption(option);
    onChange(String(loc.id));
  } catch (err) {
    console.error("Create city failed", err);
    const existing = locationOptionsApi.find(
      (o) => o.label.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      setSelectedCityOption(existing);
      onChange(existing.value);
    }
  }
};

  // Pre-fill user data into form if available
  useEffect(() => {
    if (user) {
      if (user.first_name) setValue("first_name", user.first_name);
      if (user.last_name) setValue("last_name", user.last_name);
      if (user.email) setValue("email", user.email);
      if (user.phone) setValue("phone", user.phone);
    }
  }, [user, setValue]);


//location
useEffect(() => {
  if (locationSearchTimeoutRef.current) {
    clearTimeout(locationSearchTimeoutRef.current);
  }

  // if (!locationSearchText || locationSearchText.length < 3) {
  //   setLocationOptionsApi([]);
  //   return;
  // }

  locationSearchTimeoutRef.current = setTimeout(async () => {
    try {
      setIsLocationLoading(true);

      const res = await axios.get(
        `${BASE_URL}/master/location/search?search=${locationSearchText}`
      );

      const data = res.data?.data || [];

      setLocationOptionsApi(
        data.map((loc) => ({
          value: String(loc.id),
          label: loc.name,
        }))
      );
    } catch (err) {
      console.error("Location search failed", err);
      setLocationOptionsApi([]);
    } finally {
      setIsLocationLoading(false);
    }
  }, 400);

  return () => clearTimeout(locationSearchTimeoutRef.current);
}, [locationSearchText]);


  // Reusable error message with retry button
  const CustomErrorMessage = ({ message, onRetry }) => (
    <div className="w-full p-3 text-xs text-red-500 border rounded bg-red-50">
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          onClick={onRetry}
          className="px-2 py-1 ml-2 text-xs text-white transition-colors bg-red-500 rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    </div>
  );

  const dobRegister = register("dob");

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* First + Last Name */}
      <div className="flex gap-1 sm:gap-2">
        <div className="flex-1">
          <Input
            label="First Name"
            placeholder="Enter your first name"
            error={errors.first_name?.message}
            {...register("first_name")}
          />
        </div>
        <div className="flex-1">
          <Input
            label="Last Name"
            placeholder="Enter your last name"
            error={errors.last_name?.message}
            {...register("last_name")}
          />
        </div>
      </div>

      {/* Email */}
      <Input
        label="Email ID"
        type="email"
        placeholder="example@email.com"
        error={errors.email?.message}
        className="cursor-not-allowed bg-gray-50"
        readOnly
        {...register("email")}
      />

      {/* Phone */}
      <PhoneInput
        label="Phone Number"
        type="tel"
        placeholder="98765 43210"
        error={errors.phone?.message}
        {...register("phone")}
      />

      {/* Date of Birth */}
      {/* <Input
        label="Date of Birth"
        type="date"
        required
        placeholder="Select your date of birth"
        error={errors.dob?.message}
        variant={errors.dob ? "error" : "default"}
        {...dobRegister}
        onBlur={(e) => {
          dobRegister.onBlur(e);
          void trigger("dob");
        }}
      /> */}
      {/* Date of Birth */}
      <Input
        label="Date of Birth"
        type="date"
        required
        placeholder="Select your date of birth"
        error={errors.dob?.message}
        variant={errors.dob ? "error" : "default"}
        {...dobRegister}
        onBlur={(e) => {
          dobRegister.onBlur(e);
          void trigger("dob");
        }}
      />
      {/* Location Dropdown
      <div className="w-full">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          City
        </label>
        <Controller
          name="current_location_id"
          control={control}
          rules={{ required: "Please select your city" }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            
            <Select
  ref={ref}
  value={
    value
      ? locationOptionsApi.find(
          (opt) => opt.value === String(value)
        ) || { value: String(value), label: "Selected City" }
      : null
  }
  onChange={(option) => {
    onChange(option ? option.value : null);
  }}
  onInputChange={(inputValue, { action }) => {
    if (action === "input-change") {
      setLocationSearchText(inputValue);
    }
  }}
  onBlur={onBlur}
  options={locationOptionsApi}
  isLoading={isLocationLoading}
  placeholder="Search city (min 3 chars)"
  className="text-sm"
  classNamePrefix="select"
  isClearable
  isSearchable
  noOptionsMessage={() =>
    locationSearchText.length < 3
      ? "Type at least 3 characters"
      : "No city found"
  }
   styles={{
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#9bc87c" : base.borderColor,
      boxShadow: state.isFocused ? "0 0 0 1px #9bc87c" : base.boxShadow,
      "&:hover": { borderColor: "#9bc87c" },
    }),
  }}
/>

          )}
        />
        {errors.current_location_id && (
          <p className="mt-1 text-xs text-red-500">
            {errors.current_location_id.message}
          </p>
        )}
      </div> */}

      <Controller
        name="current_location_id"
        control={control}
        rules={{ required: "Please select your city" }}
        render={({ field: { onChange, value, ref, onBlur } }) => (
          <GreenCreatableSelect
            ref={ref}
            label="City"
            placeholder="Type your city name..."
            isLoading={isLocationLoading}
            options={locationOptionsApi}
            isClearable
            isSearchable
            filterOption={() => true}
            formatCreateLabel={(input) => `Add city "${input}"`}
            onInputChange={handleLocationInputChange}
            value={
              selectedCityOption ||
              (value
                ? locationOptionsApi.find((opt) => opt.value === String(value)) ||
                  null
                : null)
            }
            onChange={(opt) => {
              if (!opt) {
                setSelectedCityOption(null);
                setLocationSearchText("");
                onChange(null);
                return;
              }
              if (opt.__isNew__) {
                handleCreateCity(String(opt.value), onChange);
                return;
              }
              const id = Number(opt.value);
              if (!Number.isNaN(id)) {
                setSelectedCityOption(opt);
                setLocationSearchText(opt.label || "");
                onChange(String(id));
              }
            }}
            onCreateOption={(input) => handleCreateCity(input, onChange)}
            onBlur={onBlur}
            noOptionsMessage={() =>
              locationSearchText.trim()
                ? 'No city found — press Enter to add it'
                : "Start typing your city"
            }
            error={errors.current_location_id?.message}
          />
        )}
      />

      {/* Gender */}
      {/* <div className="w-full">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Gender
        </label>
        <Controller
          name="gender"
          control={control}
          rules={{ required: "Gender is required" }}
          render={({ field }) => (
            <Select
              {...field}
              value={
                field.value ? { value: field.value, label: field.value } : null
              }
              onChange={(option) => field.onChange(option?.value || "")}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
              placeholder="Select gender"
              className="text-sm"
              classNamePrefix="select"
              isClearable
               styles={{
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#9bc87c" : base.borderColor,
      boxShadow: state.isFocused ? "0 0 0 1px #9bc87c" : base.boxShadow,
      "&:hover": { borderColor: "#9bc87c" },
    }),
  }}
            />
          )}
        />
        {errors.gender && (
          <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>
        )}
      </div> */}

      <Controller
  name="gender"
  control={control}
  rules={{ required: "Gender is required" }}
  render={({ field }) => (
    <ReactSelectDropdown
      label="Gender"
      placeholder="Select gender"
      isClearable
      options={[
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Other", label: "Other" },
      ]}
      value={field.value ? { value: field.value, label: field.value } : null}
      onChange={(opt) => field.onChange(opt?.value || "")}
      error={errors.gender?.message}
    />
  )}
/>
    </div>
  );
}
