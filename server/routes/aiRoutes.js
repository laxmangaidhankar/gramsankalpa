const express = require("express");
const axios = require("axios");

const router = express.Router();
const pythonAiUrl = (
  process.env.PYTHON_AI_URL || "http://127.0.0.1:8001"
).replace(/\/$/, "");

function upstreamError(error) {
  const status = error.response?.status || 503;
  const detail =
    error.response?.data?.detail ||
    error.response?.data?.error ||
    error.message;
  return { status, detail: `Python AI service unavailable: ${detail}` };
}

async function forwardJson(req, res, path) {
  try {
    const response = await axios({
      method: req.method,
      url: `${pythonAiUrl}${path}`,
      params: req.query,
      data: req.body,
      timeout: 120000,
      headers: { "Content-Type": "application/json" },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    const failure = upstreamError(error);
    res.status(failure.status).json({ detail: failure.detail });
  }
}

router.post("/ai/:village_id/summary", (req, res) => {
  forwardJson(
    req,
    res,
    `/api/v1/ai/${encodeURIComponent(req.params.village_id)}/summary`,
  );
});

router.post("/ai/:village_id/recommendations", (req, res) => {
  forwardJson(
    req,
    res,
    `/api/v1/ai/${encodeURIComponent(req.params.village_id)}/recommendations`,
  );
});

router.get("/ai/:village_id/report-narrative", (req, res) => {
  forwardJson(
    req,
    res,
    `/api/v1/ai/${encodeURIComponent(req.params.village_id)}/report-narrative`,
  );
});

router.post("/ai/:village_id/chat", async (req, res) => {
  try {
    const response = await axios.post(
      `${pythonAiUrl}/api/v1/ai/${encodeURIComponent(req.params.village_id)}/chat`,
      req.body,
      {
        params: req.query,
        responseType: "stream",
        timeout: 120000,
        headers: { "Content-Type": "application/json" },
      },
    );

    res.status(response.status);
    res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    response.data.on("error", () => res.end());
    response.data.pipe(res);

    req.on("close", () => {
      if (!res.writableEnded) response.data.destroy();
    });
  } catch (error) {
    const failure = upstreamError(error);
    res.status(failure.status).json({ detail: failure.detail });
  }
});

module.exports = router;
