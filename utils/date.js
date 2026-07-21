const generateRTDuration = () => {
  const numberOfDays = +process.env.JWT_RT_DURATION_IN_DAYS || 7;
  const currentDate = new Date();
  let futureDate = new Date(currentDate);
  futureDate.setDate(futureDate.getDate() + numberOfDays);
  return futureDate.toISOString();
};

module.exports = { generateRTDuration };
