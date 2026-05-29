import React from "react";

const EditableResumeTemplate = ({
  TemplateComponent,
  resumeData,
  setResumeData,
}) => {
  const handleChange = (path, value) => {
    const keys = path.split(".");
    const updateObject = (obj, keys, value) => {
      const [key, ...rest] = keys;
      if (rest.length === 0) {
        return { ...obj, [key]: value };
      }
      return {
        ...obj,
        [key]: updateObject(obj[key] || {}, rest, value),
      };
    };
    setResumeData((prev) => updateObject(prev, keys, value));
  };

  return <TemplateComponent resumeData={resumeData} onChange={handleChange} />;
};

export default EditableResumeTemplate;
