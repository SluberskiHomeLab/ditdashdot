import React from 'react';
import yaml from 'js-yaml';

const UploadYAML = ({ setServices }) => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = yaml.load(e.target.result);
        setServices(data.services || []);
      } catch (err) {
        console.error("YAML parsing error:", err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <input type="file" accept=".yml,.yaml" onChange={handleFileUpload} />
    </div>
  );
};

export default UploadYAML;
