import axios from "axios";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const extractErrorMessage = async (blob, fallback) => {
  try {
    const text = await blob.text();
    const parsed = JSON.parse(text);
    if (parsed.detail) {
      return typeof parsed.detail === "string" ? parsed.detail : JSON.stringify(parsed.detail);
    }
    if (parsed.message) return parsed.message;
    return text || fallback;
  } catch {
    return fallback;
  }
};
const downloadFile = async (url, filename, expectedType) => {
  try {
    const response = await axios.get(url, { responseType: "blob" });
    const contentType = response.headers["content-type"] || "";
    if (expectedType && !contentType.includes(expectedType)) {
      const errorMsg = await extractErrorMessage(response.data, "Unexpected response format received from server.");
      throw new Error(errorMsg);
    }
    const blob = new Blob([response.data], {
      type: contentType
    });
    const contentDisposition = response.headers["content-disposition"];
    let finalFilename = filename;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch.length === 2) {
        finalFilename = filenameMatch[1];
      }
    }
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    if (error.response && error.response.data instanceof Blob) {
      const message = await extractErrorMessage(error.response.data, error.message || "Failed to download file");
      throw new Error(message);
    }
    throw error;
  }
};
export const downloadPDF = async (villageId, year, includeAI) => {
  const url = `${apiBaseUrl}/api/v1/reports/${villageId}/pdf?year=${year}&include_ai=${includeAI}`;
  await downloadFile(url, `GramSankalpa_Report_${villageId}_${year}.pdf`, "application/pdf");
};
export const downloadJSON = async (villageId, year) => {
  const url = `${apiBaseUrl}/api/v1/reports/${villageId}/json?year=${year}`;
  await downloadFile(url, `GramSankalpa_Data_${villageId}_${year}.json`, "application/json");
};
export const downloadCSV = async (villageId) => {
  const url = `${apiBaseUrl}/api/v1/reports/${villageId}/csv`;
  await downloadFile(url, `GramSankalpa_History_${villageId}.csv`, "text/csv");
};
