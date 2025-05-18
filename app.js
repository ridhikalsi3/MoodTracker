// Global Variables
const profileEntry = document.getElementById('profileEntry');
const trackerPage = document.getElementById('trackerPage');
const profileForm = document.getElementById('profileForm');

const profileNameEl = document.getElementById('profileName');
const profileAgeEl = document.getElementById('profileAge');
const profilePicEl = document.getElementById('profilePic');

const moodButtons = document.querySelectorAll('.moodBtn');
const calendarDates = document.getElementById('calendarDates');
const currentMonthYear = document.getElementById('currentMonthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

const pieChartCtx = document.getElementById('pieChart').getContext('2d');
const pieLegend = document.getElementById('pieLegend');

let selectedMood = 'happy'; // default mood
let currentDate = new Date();

// Moods are now stored by month: { 'YYYY-MM': { 'YYYY-MM-DD': 'mood' } }
let moodsData = {};

let pieChart;

// New flag to track if profile is completed
let isProfileCompleted = false;

// Utility Functions
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Handle Profile Form Submission
profileForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const age = document.getElementById('age').value.trim();
  const picInput = document.getElementById('pic');

  if (!name || !age || picInput.files.length === 0) {
    alert('Please fill all fields and upload a picture.');
    return;
  }

  profileNameEl.textContent = name;
  profileAgeEl.textContent = `Age: ${age}`;

  const reader = new FileReader();
  reader.onload = () => {
    profilePicEl.src = reader.result;
  };
  reader.readAsDataURL(picInput.files[0]);

  profileEntry.style.display = 'none';
  trackerPage.style.display = 'flex';

  isProfileCompleted = true;  // mark profile completed here

  renderCalendar(currentDate);
  updatePieChart();
});

// Mood Buttons
moodButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!isProfileCompleted) {
      alert('Please complete your profile before selecting moods.');
      return;
    }
    moodButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedMood = btn.dataset.mood;
  });
});

// Render Calendar
function renderCalendar(date) {
  calendarDates.innerHTML = '';

  const year = date.getFullYear();
  const month = date.getMonth();
  const monthKey = getMonthKey(date);
  const monthMoods = moodsData[monthKey] || {};

  currentMonthYear.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < startDay; i++) {
    const blankBtn = document.createElement('button');
    blankBtn.disabled = true;
    blankBtn.style.visibility = 'hidden';
    calendarDates.appendChild(blankBtn);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateBtn = document.createElement('button');
    dateBtn.textContent = day;

    const fullDate = new Date(year, month, day);
    const dateStr = formatDate(fullDate);

    if (monthMoods[dateStr]) {
      dateBtn.classList.add(`mood-${monthMoods[dateStr]}`);
    }

    const today = new Date();
    if (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    ) {
      dateBtn.style.border = '3px solid #8859e1';
    }

    dateBtn.addEventListener('click', (e) => {
  if (!isProfileCompleted) {
    alert('Please complete your profile before adding mood.');
    return;
  }

  if (!moodsData[monthKey]) {
    moodsData[monthKey] = {};
  }
  moodsData[monthKey][dateStr] = selectedMood;
  renderCalendar(date);
  updatePieChart();

  // 🎉 Show emoji animation
  const emojiMap = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    neutral: '😐',
    love: '😍',
    jealous: '😒',
  };
  const emoji = emojiMap[selectedMood] || '😊';

  const anim = document.createElement('div');
  anim.className = 'emoji-animation';
  anim.textContent = emoji;

  document.body.appendChild(anim);

  setTimeout(() => {
    anim.remove();
  }, 1000); // remove after animation
});


    calendarDates.appendChild(dateBtn);
  }
}

// Month Navigation
prevMonthBtn.addEventListener('click', () => {
  if (!isProfileCompleted) {
    alert('Please complete your profile before changing months.');
    return;
  }
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
  updatePieChart();
});

nextMonthBtn.addEventListener('click', () => {
  if (!isProfileCompleted) {
    alert('Please complete your profile before changing months.');
    return;
  }
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
  updatePieChart();
});

// Pie Chart Update
function updatePieChart() {
  const moodCounts = {
    happy: 0,
    sad: 0,
    angry: 0,
    neutral: 0,
    love: 0,
    jealous: 0,
  };

  const monthKey = getMonthKey(currentDate);
  const monthMoods = moodsData[monthKey] || {};

  for (const dateStr in monthMoods) {
    const mood = monthMoods[dateStr];
    if (mood in moodCounts) {
      moodCounts[mood]++;
    }
  }

  const moodLabels = ['😊 Happy', '😢 Sad', '😠 Angry', '😐 Neutral', '😍 Love', '😒 jealous'];
  const moodColors = ['yellow', 'lightblue', 'red', 'lightgreen', 'pink', 'orange'];
  const moodValues = Object.values(moodCounts);

  if (pieChart) {
    pieChart.destroy();
  }

  if (moodValues.every(val => val === 0)) {
    pieLegend.innerHTML = '<p>No mood data for this month.</p>';
    return;
  }

  pieChart = new Chart(pieChartCtx, {
    type: 'pie',
    data: {
      labels: moodLabels,
      datasets: [{
        data: moodValues,
        backgroundColor: moodColors,
        borderWidth: 1,
        borderColor: '#fff',
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${ctx.parsed}`
          }
        }
      }
    }
  });

  renderLegend(moodLabels, moodColors);
}

// Custom Pie Legend
function renderLegend(labels, colors) {
  pieLegend.innerHTML = '';
  labels.forEach((label, i) => {
    const item = document.createElement('div');
    item.classList.add('pieLegendItem');
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.gap = '8px';
    item.style.fontWeight = '600';
    item.style.color = '#5c4e91';

    const colorBox = document.createElement('span');
    colorBox.style.width = '18px';
    colorBox.style.height = '18px';
    colorBox.style.backgroundColor = colors[i];
    colorBox.style.borderRadius = '4px';
    colorBox.style.display = 'inline-block';

    item.appendChild(colorBox);
    item.appendChild(document.createTextNode(label));

    pieLegend.appendChild(item);
  });
}
