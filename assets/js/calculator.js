(function () {
  'use strict';

  var defaultState = {
    sex: 'm',
    age: 30,
    weight: 75,
    height: 175,
    steps: 8000,
    standing: 1,
    training: 2,
    intensity: 5.5,
    duration: 60,
    intake: '',
    startWeight: '',
    endWeight: '',
    days: 21
  };

  var state = Object.assign({}, defaultState);

  var STANDING_HOURS = [0.5, 1.5, 3.0, 5.0];
  var SESSIONS_PER_WEEK = [0, 1.5, 3.5, 5.5, 7];

  var INTENSITY_HINTS = {
    '3.5': 'Yoga, mobilité, marche rapide',
    '5.5': 'Musculation, course légère, vélo',
    '8': 'HIIT, sports intenses, intervalles'
  };

  var LS_KEY = 'tdee-estimator-v4';
  var LEGACY_KEY = 'tdee-calc-v3';

  function numberOrNull(value) {
    if (value === '' || value === null || value === undefined) return null;
    var n = parseFloat(value);
    return Number.isFinite(n) ? n : null;
  }

  function roundTo(value, step) {
    return Math.round(value / step) * step;
  }

  function formatNumber(value, decimals) {
    return value.toLocaleString('fr-FR', {
      maximumFractionDigits: decimals || 0,
      minimumFractionDigits: 0
    });
  }

  function formatKcal(value) {
    return formatNumber(Math.round(value), 0) + '&nbsp;kcal';
  }

  function pct(value, total) {
    return total > 0 ? Math.max(0, Math.round((value / total) * 100)) : 0;
  }

  function computeEstimate(s) {
    if (
      !s.weight || s.weight < 30 || s.weight > 250 ||
      !s.height || s.height < 100 || s.height > 250 ||
      !s.age || s.age < 15 || s.age > 100
    ) {
      return null;
    }

    var bmr = 10 * s.weight + 6.25 * s.height - 5 * s.age + (s.sex === 'm' ? 5 : -161);

    // Net walking estimate, scaled by body mass.
    var stepsKcal = s.steps * 0.029 * (s.weight / 70);

    // Net standing estimate, avoiding double counting resting expenditure.
    var standHours = STANDING_HOURS[s.standing] || 0;
    var standKcal = standHours * 60 * (0.5 * 3.5 * s.weight) / 200;
    var neat = stepsKcal + standKcal;

    // Net exercise METs averaged across the week.
    var sessions = SESSIONS_PER_WEEK[s.training] || 0;
    var eatWeekly = sessions * s.duration * ((s.intensity - 1.0) * 3.5 * s.weight) / 200;
    var eat = eatWeekly / 7;

    // TEF as a practical average. Algebra avoids adding TEF twice.
    var tdeeRaw = (bmr + neat + eat) / 0.90;
    var tef = tdeeRaw * 0.10;

    return {
      bmr: Math.round(bmr),
      tef: Math.round(tef),
      neat: Math.round(neat),
      eat: Math.round(eat),
      tdeeRaw: tdeeRaw,
      tdee: roundTo(tdeeRaw, 50),
      low: roundTo(tdeeRaw * 0.90, 50),
      high: roundTo(tdeeRaw * 1.10, 50)
    };
  }

  function computeCalibration(s) {
    var intake = numberOrNull(s.intake);
    var startWeight = numberOrNull(s.startWeight);
    var endWeight = numberOrNull(s.endWeight);
    var days = numberOrNull(s.days);

    if (intake === null && startWeight === null && endWeight === null) {
      return { status: 'empty' };
    }

    if (
      intake === null || intake < 800 || intake > 7000 ||
      startWeight === null || startWeight < 30 || startWeight > 250 ||
      endWeight === null || endWeight < 30 || endWeight > 250 ||
      days === null || days < 7 || days > 60
    ) {
      return { status: 'invalid' };
    }

    var deltaKg = endWeight - startWeight;
    var dailyEnergyChange = (deltaKg * 7700) / days;
    var observed = roundTo(intake - dailyEnergyChange, 50);
    var absDelta = Math.abs(deltaKg);

    var confidence = 'Confiance moyenne';
    var note = 'Interprétation indicative : les variations d’eau, de glycogène et de suivi alimentaire peuvent encore peser.';

    if (days < 14) {
      confidence = 'Confiance faible';
      note = 'La durée est courte. Utilise plutôt 14 à 28 jours pour réduire le bruit.';
    } else if (absDelta < 0.2) {
      confidence = 'Signal faible';
      note = 'Le poids a peu bougé. C’est compatible avec un maintien, mais le bruit peut dominer le calcul.';
    } else if (days >= 21 && absDelta >= 0.3) {
      confidence = 'Confiance correcte';
      note = 'Cette estimation observée devient plus utile que la formule, si les apports et l’activité ont été stables.';
    }

    return {
      status: 'ready',
      intake: intake,
      deltaKg: deltaKg,
      days: days,
      observed: observed,
      confidence: confidence,
      note: note
    };
  }

  function barRowHTML(label, kcal, total) {
    var p = pct(kcal, total);
    return '<div class="tdee-bar-row">' +
      '<span class="tdee-bar-label">' + label + '</span>' +
      '<div class="tdee-bar-track"><div class="tdee-bar-fill" data-bar-width="' + p + '"></div></div>' +
      '<span class="tdee-bar-kcal">' + formatKcal(kcal) + '</span>' +
      '<span class="tdee-bar-pct">' + p + '%</span>' +
      '</div>';
  }

  function renderCalibration(calibration) {
    if (calibration.status === 'empty') {
      return '<section class="tdee-calibration-result tdee-calibration-result--muted">' +
        '<h5 class="tdee-sub-title">Calibration observée</h5>' +
        '<p>Ajoute tes moyennes sur 14 à 28 jours pour comparer la formule à ton maintien réel.</p>' +
        '</section>';
    }

    if (calibration.status === 'invalid') {
      return '<section class="tdee-calibration-result tdee-calibration-result--warning">' +
        '<h5 class="tdee-sub-title">Calibration observée</h5>' +
        '<p>Valeurs incomplètes ou hors plage. Vérifie l’apport moyen, les deux poids moyens et la durée.</p>' +
        '</section>';
    }

    var trend = calibration.deltaKg > 0 ? '+' : '';
    return '<section class="tdee-calibration-result">' +
      '<div>' +
        '<h5 class="tdee-sub-title">Maintien observé</h5>' +
        '<div class="tdee-observed-value">' + formatKcal(calibration.observed) + '<span>/ jour</span></div>' +
      '</div>' +
      '<p><strong>' + calibration.confidence + '</strong> : variation de poids ' +
        trend + formatNumber(calibration.deltaKg, 1) + '&nbsp;kg sur ' + calibration.days +
        '&nbsp;jours, avec ' + formatKcal(calibration.intake) + ' d’apport moyen.</p>' +
      '<p class="tdee-result-note">' + calibration.note + '</p>' +
      '</section>';
  }

  function renderResults(estimate, calibration) {
    var container = document.getElementById('tdee-results');
    if (!container) return;

    if (!estimate) {
      container.innerHTML =
        '<p class="tdee-error" role="alert">Valeurs hors plage : vérifie poids (30-250 kg), taille (100-250 cm) et âge (15-100 ans).</p>';
      return;
    }

    var barsHTML =
      barRowHTML('BMR', estimate.bmr, estimate.tdeeRaw) +
      barRowHTML('TEF', estimate.tef, estimate.tdeeRaw) +
      barRowHTML('NEAT', estimate.neat, estimate.tdeeRaw) +
      barRowHTML('EAT', estimate.eat, estimate.tdeeRaw);

    container.innerHTML =
      '<div class="tdee-results-inner">' +
        '<section class="tdee-hero" aria-label="Résultat estimé">' +
          '<p class="tdee-hero-label">TDEE estimé</p>' +
          '<div class="tdee-hero-value">' + formatNumber(estimate.tdee, 0) + '</div>' +
          '<div class="tdee-hero-unit">kcal / jour</div>' +
          '<p class="tdee-hero-range">Fourchette utile : ' + formatKcal(estimate.low) + ' à ' + formatKcal(estimate.high) + '</p>' +
        '</section>' +

        '<section class="tdee-breakdown">' +
          '<h5 class="tdee-sub-title">Décomposition estimée</h5>' +
          barsHTML +
        '</section>' +

        renderCalibration(calibration) +

        '<details class="tdee-method">' +
          '<summary>Méthode et limites</summary>' +
          '<p><strong>BMR</strong> : équation de Mifflin-St Jeor. <strong>NEAT</strong> : approximation nette des pas et du temps debout. <strong>EAT</strong> : estimation par METs nets, moyennée sur la semaine. <strong>TEF</strong> : moyenne pratique de 10&nbsp;% du total.</p>' +
          '<p>La fourchette +/-10&nbsp;% reflète l’incertitude individuelle normale. La calibration observée devient prioritaire si les apports, le poids moyen et l’activité ont été suivis proprement.</p>' +
        '</details>' +
      '</div>';
    container.querySelectorAll('[data-bar-width]').forEach(function (bar) {
      bar.style.setProperty('--tdee-bar-w', bar.dataset.barWidth + '%');
    });
  }

  function update() {
    renderResults(computeEstimate(state), computeCalibration(state));
    save();
  }

  function save() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(LS_KEY) || localStorage.getItem(LEGACY_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      Object.keys(defaultState).forEach(function (key) {
        if (saved[key] !== undefined) state[key] = saved[key];
      });
    } catch (e) {}
  }

  function rangeOutput(id, text) {
    var out = document.querySelector('output[for="' + id + '"]');
    if (out) out.textContent = text;
  }

  function setPressed(button, active) {
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  }

  function toggleEatDetails() {
    var el = document.getElementById('tdee-eat-details');
    if (el) el.hidden = state.training === 0;
  }

  function applyStateToInputs() {
    document.querySelectorAll('[data-field="sex"]').forEach(function (button) {
      setPressed(button, button.dataset.val === state.sex);
    });

    document.querySelectorAll('[data-field="standing"]').forEach(function (button) {
      setPressed(button, parseInt(button.dataset.val, 10) === state.standing);
    });

    document.querySelectorAll('[data-field="training"]').forEach(function (button) {
      setPressed(button, parseInt(button.dataset.val, 10) === state.training);
    });

    document.querySelectorAll('[data-field="intensity"]').forEach(function (button) {
      setPressed(button, parseFloat(button.dataset.val) === state.intensity);
    });

    var ids = {
      'tdee-weight': state.weight,
      'tdee-height': state.height,
      'tdee-age': state.age,
      'tdee-intake': state.intake,
      'tdee-start-weight': state.startWeight,
      'tdee-end-weight': state.endWeight,
      'tdee-days': state.days
    };

    Object.keys(ids).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = ids[id];
    });

    var stepsEl = document.getElementById('tdee-steps');
    if (stepsEl) {
      stepsEl.value = state.steps;
      rangeOutput('tdee-steps', formatNumber(state.steps, 0));
    }

    var hintEl = document.getElementById('tdee-intensity-hint');
    if (hintEl) hintEl.textContent = INTENSITY_HINTS[String(state.intensity)] || '';

    var durationEl = document.getElementById('tdee-duration');
    if (durationEl) {
      durationEl.value = state.duration;
      rangeOutput('tdee-duration', state.duration + ' min');
    }

    toggleEatDetails();
  }

  function attachListeners() {
    var calc = document.getElementById('tdee-calc');
    if (!calc) return;

    calc.addEventListener('click', function (event) {
      var button = event.target.closest('[data-field]');
      if (!button) return;

      var field = button.dataset.field;
      var value = button.dataset.val;
      var group = button.closest('[role="group"]');

      if (group) {
        group.querySelectorAll('[data-field="' + field + '"]').forEach(function (item) {
          setPressed(item, item === button);
        });
      }

      if (field === 'sex') {
        state.sex = value;
      } else if (field === 'standing') {
        state.standing = parseInt(value, 10);
      } else if (field === 'training') {
        state.training = parseInt(value, 10);
        toggleEatDetails();
      } else if (field === 'intensity') {
        state.intensity = parseFloat(value);
        var hintEl = document.getElementById('tdee-intensity-hint');
        if (hintEl) hintEl.textContent = INTENSITY_HINTS[value] || '';
      }

      update();
    });

    var numericFields = {
      'tdee-weight': 'weight',
      'tdee-height': 'height',
      'tdee-age': 'age',
      'tdee-intake': 'intake',
      'tdee-start-weight': 'startWeight',
      'tdee-end-weight': 'endWeight',
      'tdee-days': 'days'
    };

    Object.keys(numericFields).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', function () {
        var key = numericFields[id];
        state[key] = this.value === '' ? '' : parseFloat(this.value);
        update();
      });
    });

    var stepsEl = document.getElementById('tdee-steps');
    if (stepsEl) {
      stepsEl.addEventListener('input', function () {
        state.steps = parseInt(this.value, 10);
        rangeOutput('tdee-steps', formatNumber(state.steps, 0));
        update();
      });
    }

    var durationEl = document.getElementById('tdee-duration');
    if (durationEl) {
      durationEl.addEventListener('input', function () {
        state.duration = parseInt(this.value, 10);
        rangeOutput('tdee-duration', state.duration + ' min');
        update();
      });
    }
  }

  function init() {
    if (!document.getElementById('tdee-calc')) return;
    load();
    applyStateToInputs();
    attachListeners();
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
