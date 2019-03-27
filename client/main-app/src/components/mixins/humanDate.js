export default {
  methods: {
    humanDate (timestamp) {
      var date = new Date(timestamp);

      const dateDescr = (date) => {
        const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        return ({
          timestamp: date.getTime(),
          year: date.getFullYear(),
          month: months[date.getMonth()],
          day: date.getDate(),
          hours: date.getHours(),
          minutes: date.getMinutes(),
          timeString: date.toTimeString().slice(0, 5)
        });
      };

      const frontDateString = (date, now) => {
        const HOURS_TO_MS = 3.6e+6;
        const MIN_TO_MS = 6e+4;

        if (now === undefined) now = new Date();
        date = dateDescr(date);
        now = dateDescr(now);

        var frontDate = '';

        // If less than an hour ago -> special string
        if ((now.timestamp - date.timestamp) < (1 * HOURS_TO_MS))
          frontDate = `${Math.round((now.timestamp - date.timestamp) / MIN_TO_MS)} min ago`;

        // Else if less than 23 hours ago -> special string
        else if ((now.timestamp - date.timestamp) < (23 * HOURS_TO_MS))
          frontDate = `${Math.round((now.timestamp - date.timestamp) / HOURS_TO_MS)}h ago`;

        // Else if not this year -> show the year
        else if (now.year !== date.year)
          frontDate = `${date.day} ${date.month} ${date.year}`;

        // Else if yesterday -> special string
        else if ((now.month === date.month) && ((now.day - date.day) === 1))
          frontDate = `yesterday at ${date.timeString}`;

        // Else -> dd MONTH (eg "24 septembre")
        else
          frontDate = `${date.day} ${date.month}`;

        return (frontDate);
      };

      return (frontDateString(date));
    },
  }
};
