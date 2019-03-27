module.exports = {
  majority: function (date) {
    if (!(date instanceof Date)) {
      throw new Error('Argument date is not valid');
    }
    date = date.getTime();
    const eighteen = 568080000000;
    const now = Date.now();
    const eighteenYearsFromNow = now - eighteen;
    return (date <= eighteenYearsFromNow);
  },
  ageFromDob: function (dob) {
      const year = 3.154e+10;
      const now = Date.now();
      return (Math.floor((now - dob) / year));
  }
}
