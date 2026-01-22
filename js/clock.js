$(document).ready(function() {
  let clock;

  // Grab the current date
  let currentDate = new Date();

  // Target future date/24 hour time/Timezone
  var heroData = window.WEDDING_DATA && window.WEDDING_DATA.hero;
  var targetValue = heroData && heroData.countdownTarget ? heroData.countdownTarget : "2026-02-19 23:00";
  var targetZone = heroData && heroData.countdownTimezone ? heroData.countdownTimezone : "Asia/Kolkata";
  let targetDate = moment.tz(targetValue, targetZone);

  // Calculate the difference in seconds between the future and current date
  let diff = targetDate / 1000 - currentDate.getTime() / 1000;

  if (diff <= 0) {
    // If remaining countdown is 0
    clock = $(".clock").FlipClock(0, {
      clockFace: "DailyCounter",
      countdown: true,
      autostart: false
    });
    console.log("Date has already passed!")
    
  } else {
    // Run countdown timer
    clock = $(".clock").FlipClock(diff, {
      clockFace: "DailyCounter",
      countdown: true,
      callbacks: {
        stop: function() {
          console.log("Timer has ended!")
        }
      }
    });
    
    // Check when timer reaches 0, then stop at 0
    setTimeout(function() {
      checktime();
    }, 1000);
    
    function checktime() {
      t = clock.getTime();
      if (t <= 0) {
        clock.setTime(0);
      }
      setTimeout(function() {
        checktime();
      }, 1000);
    }
  }
});
