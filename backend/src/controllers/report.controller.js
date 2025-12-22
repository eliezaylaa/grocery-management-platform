const kpiService = require("../services/kpi.service");

exports.getKPIs = async (req, res) => {
  try {
    const kpis = await kpiService.getAllKPIs();
    res.json(kpis);
  } catch (error) {
    console.error("Report.getKPIs error:", error);
    res.status(500).json({ error: "Failed to load KPIs" });
  }
};

exports.getSalesReport = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const revenue = await kpiService.getTotalRevenue(parseInt(days));
    res.json(revenue);
  } catch (error) {
    console.error("Report.getSalesReport error:", error);
    res.status(500).json({ error: "Failed to load sales report" });
  }
};
