const UI = {
  month: document.getElementById('month-display'),
  income: document.getElementById('income-display'),
  cash: document.getElementById('cash-display'),
  bills: document.getElementById('bills-display'),
  essentials: document.getElementById('essentials-display'),
  debt: document.getElementById('debt-display'),
  housing: document.getElementById('housing-display'),
  health: document.getElementById('health-display'),
  support: document.getElementById('support-display'),
  stress: document.getElementById('stress-display'),
  status: document.getElementById('status-pill'),
  log: document.getElementById('log-container'),
  endScreen: document.getElementById('end-screen'),
  endTitle: document.getElementById('end-title'),
  endMessage: document.getElementById('end-message'),
  eventPreview: document.getElementById('event-preview'),
  progressFill: document.getElementById('progress-fill'),
};

const actions = {
  borrow: document.getElementById('action-borrow'),
  cut: document.getElementById('action-cut'),
  support: document.getElementById('action-support'),
  gig: document.getElementById('action-gig'),
  payDebt: document.getElementById('action-paydebt'),
  advance: document.getElementById('advance-button'),
  restart: document.getElementById('restart-button'),
};

const state = {
  month: 1,
  income: 1330,
  cash: 600,
  bills: 650,
  essentials: 220,
  debt: 0,
  housing: 'Stable',
  health: 'OK',
  support: 'None',
  stress: 'Low',
  active: true,
  goals: 12,
};

const palette = {
  health: ['Excellent', 'Good', 'OK', 'Poor', 'Sick'],
  housing: ['Stable', 'At Risk', 'Eviction'],
  support: ['None', 'Pending', 'Approved'],
  stress: ['Low', 'Moderate', 'High', 'Critical'],
};

function formatMoney(value) {
  const rounded = Math.round(value);
  return `$${rounded.toLocaleString()}`;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function logEntry(title, message) {
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `
    <div class="log-month">Month ${state.month}</div>
    <strong>${title}</strong>
    <span>${message}</span>
  `;
  UI.log.prepend(entry);
}

function updateStatus() {
  UI.status.textContent = `Month ${state.month} of ${state.goals}`;
  const progress = (state.month / state.goals) * 100;
  UI.progressFill.style.width = progress + '%';
  updateEventPreview();
}

function updateEventPreview() {
  let preview = 'Make your choices to resolve this month.';
  
  if (state.stress === 'Critical') {
    preview = 'You\'re are under heavy stress.';
  } else if (state.housing === 'At Risk') {
    preview = 'Housing is becoming unstable.';
  } else if (state.debt >= 2000) {
    preview = 'Debt is mounting. Consider paying down what you can.';
  } else if (state.cash < 100) {
    preview = 'Cash is running low.';
  } else if (state.support === 'Pending') {
    preview = 'Waiting for support decision.';
  } else if (state.health === 'Poor') {
    preview = 'Your health is declining.';
  } else if (state.month % 3 === 1) {
    preview = 'Rent increases are coming soon.';
  } else {
    preview = 'Managing month ' + state.month + '. Keep your budget balanced.';
  }
  
  UI.eventPreview.textContent = preview;
}

function render() {
  UI.month.textContent = state.month;
  UI.income.textContent = formatMoney(state.income);
  UI.cash.textContent = formatMoney(state.cash);
  UI.bills.textContent = formatMoney(state.bills);
  UI.essentials.textContent = formatMoney(state.essentials);
  UI.debt.textContent = formatMoney(state.debt);
  UI.housing.textContent = state.housing;
  UI.health.textContent = state.health;
  UI.support.textContent = state.support;
  UI.stress.textContent = state.stress;
  updateStatus();
}

function changeHealth(amount) {
  const index = palette.health.indexOf(state.health);
  const next = Math.min(palette.health.length - 1, Math.max(0, index + amount));
  state.health = palette.health[next];
}

function changeHousing(amount) {
  const index = palette.housing.indexOf(state.housing);
  const next = Math.min(palette.housing.length - 1, Math.max(0, index + amount));
  state.housing = palette.housing[next];
}

function changeStress(amount) {
  const index = palette.stress.indexOf(state.stress);
  const next = Math.min(palette.stress.length - 1, Math.max(0, index + amount));
  state.stress = palette.stress[next];
}

function resolveSupportDecision() {
  if (state.support !== 'Pending') return;

  const chance = getRandomInt(1, 100);
  if (chance <= 65) {
    state.support = 'Approved';
    state.cash += 400;
    logEntry('Aid Approved', 'A support payment arrived to help cover essentials this month.');
  } else {
    state.support = 'None';
    logEntry('Aid Denied', 'Your application did not succeed. You can apply again next month.');
  }
}

function addRandomEvent() {
  const roll = getRandomInt(1, 100);

  if (roll <= 25) {
    const cost = getRandomInt(80, 260);
    const expense = Math.min(cost, state.cash);
    state.cash -= expense;
    const remaining = cost - expense;
    if (remaining > 0) {
      state.debt += remaining;
      logEntry('Unexpected Bill', `A surprise repair cost ${formatMoney(cost)}. You used cash and added ${formatMoney(remaining)} to debt.`);
    } else {
      logEntry('Unexpected Bill', `A surprise repair cost ${formatMoney(cost)}. You covered it from cash.`);
    }
    changeStress(1);
  } else if (roll <= 55) {
    const change = getRandomInt(-100, 160);
    state.income = Math.max(800, state.income + change);
    const title = change < 0 ? 'Pay Cut' : 'Extra Hours';
    logEntry(title, `Your income ${change < 0 ? 'fell' : 'increased'} by ${formatMoney(Math.abs(change))} this month.`);
    if (change < 0) {
      changeStress(1);
    }
  } else if (roll <= 68) {
    const extraCost = getRandomInt(30, 90);
    state.essentials += extraCost;
    logEntry('Rising Costs', `Food and essential prices rose by ${formatMoney(extraCost)}.`);
    changeStress(1);
  } else {
    logEntry('Quiet Month', 'A month passed without major surprises.');
  }
}

function payMonth() {
  const monthlyCost = state.bills + state.essentials;

  if (state.cash >= monthlyCost) {
    state.cash -= monthlyCost;
    logEntry('Monthly Expenses', `You paid ${formatMoney(monthlyCost)} for housing and essentials.`);
  } else {
    const shortage = monthlyCost - state.cash;
    state.cash = 0;
    state.debt += shortage;
    logEntry('Shortfall', `You could not cover ${formatMoney(shortage)} and had to add it to debt.`);
    changeHousing(1);
    changeStress(1);
  }

  const interest = Math.ceil(state.debt * 0.03);
  if (interest > 0) {
    state.debt += interest;
    logEntry('Debt Interest', `Your debt grew by ${formatMoney(interest)} this month.`);
  }
}

function evaluateEndGame() {
  if (state.month > state.goals) {
    endGame(true, 'You made it through the year.');
    return true;
  }

  if (state.debt >= 3000 || state.housing === 'Eviction' || state.health === 'Sick') {
    message = '';
    if(state.debt >= 3000) {
      message += 'Your debt became unmanageable. ';
    }
    if(state.housing === 'Eviction') {
      message += 'You lost your housing. ';
    }
    if(state.health === 'Sick') {
      message += 'Your health declined too much. ';
    }
    endGame(false, `${message} Your story ends here, but you can try again.`);
    return true;
  }

  return false;
}

function endGame(victory, message) {
  state.active = false;
  UI.endTitle.textContent = victory ? 'You Made It' : 'Game Over';
  UI.endMessage.textContent = message;
  UI.endScreen.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function advanceMonth() {
  if (!state.active) return;

  state.cash += state.income;
  logEntry('Income Received', `You received ${formatMoney(state.income)} in monthly income.`);

  if (state.support === 'Pending') {
    resolveSupportDecision();
  }

  addRandomEvent();
  payMonth();
  state.month += 1;

  if (!evaluateEndGame()) {
    if (state.month % 3 === 0) {
      const increase = getRandomInt(20, 40);
      state.bills += increase;
      logEntry('Cost Increase', `Rent and utilities rose by ${formatMoney(increase)} this month.`);
      changeStress(1);
    }
    render();
  }
}

function applyBorrow() {
  if (!state.active) return;
  state.cash += 300;
  state.debt += 300;
  logEntry('Short-term loan', 'You took out a loan for $300. Cash rose, but the debt burden increased.');
  changeStress(1);
  render();
}

function applyCutSpending() {
  if (!state.active) return;
  state.essentials = Math.max(160, Math.floor(state.essentials * 0.8));
  state.cash += 40;
  logEntry('Skipped a meal', 'You cut back on food this month to save money.');
  changeStress(-1);
  changeHealth(1);
  render();
}

function applySupport() {
  if (!state.active) return;
  if (state.support === 'Pending') {
    logEntry('Already Applied', 'Your current assistance application is still pending.');
    return;
  }
  state.support = 'Pending';
  logEntry('Applied for assistance', 'You applied for aid. The decision will arrive next month.');
  render();
}

function applyGig() {
  if (!state.active) return;
  const extra = getRandomInt(140, 260);
  state.cash += extra;
  logEntry('Worked overtime', `You earned ${formatMoney(extra)} by working extra hours.`);
  changeStress(1);
  changeHealth(1);
  render();
}

function applyPayDebt() {
  if (!state.active) return;
  const amount = Math.min(150, state.cash);
  if (amount <= 0) {
    logEntry('No Cash', 'You do not have enough cash on hand to pay down debt.');
    return;
  }
  state.cash -= amount;
  state.debt = Math.max(0, state.debt - amount);
  logEntry('Debt Payment', `You used ${formatMoney(amount)} of cash to reduce your debt.`);
  changeStress(-1);
  render();
}

actions.borrow.addEventListener('click', applyBorrow);
actions.cut.addEventListener('click', applyCutSpending);
actions.support.addEventListener('click', applySupport);
actions.gig.addEventListener('click', applyGig);
actions.payDebt.addEventListener('click', applyPayDebt);
actions.advance.addEventListener('click', advanceMonth);
actions.restart.addEventListener('click', restartGame);

function restartGame() {
  state.month = 1;
  state.income = 1300;
  state.cash = 600;
  state.bills = 650;
  state.essentials = 220;
  state.debt = 0;
  state.housing = 'Stable';
  state.health = 'OK';
  state.support = 'None';
  state.stress = 'Low';
  state.active = true;
  UI.log.innerHTML = '';
  UI.endScreen.classList.add('hidden');
  document.body.classList.remove('modal-open');
  logEntry('Game Started', 'A new year of survival begins.');
  render();
}

restartGame();
