const majority = (date) => {
  if (!(date instanceof Date)) {
    throw new Error('Argument date is not valid');
  }
  date = date.getTime();
  const eighteen = 568080000000;
  let now = Date.now();
  let eighteenYearsFromNow = now - eighteen;
  if (date > eighteenYearsFromNow) {
    return false;
  }
  return true;
};

const ageFromDob = (dob) => {
  const year = 3.154e+10;
  const now = Date.now();
  return (Math.floor((now - dob) / year));
};

module.exports = {
  majority,
  ageFromDob
};
