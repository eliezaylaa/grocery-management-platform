const kpiService = require("../services/kpi.service");

exports.getKPIs = async (req, res, next) => {
  try {
    const kpis = await kpiService.getAllKPIs();
    res.json(kpis);
  } catch (error) {
    next(error);
  }
};

exports.getSalesReport = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const revenue = await kpiService.getTotalRevenue(parseInt(days));
    res.json(revenue);
  } catch (error) {
    next(error);
  }
};
