(function () {
  'use strict';

  // ── État par défaut ────────────────────────────────────────────────────────
  var defaultState = {
    sex:       'm',
    age:       30,
    weight:    75,
    height:    175,
    steps:     8000,
    standing:  1,     // index → [0.5, 1.5, 3.0, 5.0] h
    training:  2,     // index → [0, 1.5, 3.5, 5.5, 7] sessions/sem
    intensity: 5.5,   // METs
    duration:  60,    // min
    goal:      'maintain'
  };

  var state = Object.assign({}, defaultState);

  // ── Tables de conversion ───────────────────────────────────────────────────
  var STANDING_HOURS    = [0.5, 1.5, 3.0, 5.0];
  var SESSIONS_PER_WEEK = [0, 1.5, 3.5, 5.5, 7];

  var INTENSITY_HINTS = {
    '3.5': 'Yoga, stretching, marche rapide',
    '5.5': 'Musculation, course légère, vélo',
    '8':   'HIIT, CrossFit, sprint, sports intensifs'
  };

  var GOAL_LABELS = {
    lose:     { title: 'Perte de poids',  delta: '−500 kcal', desc: 'Déficit progressif' },
    maintain: { title: 'Maintien',        delta: '±0 kcal',   desc: 'Équilibre énergétique' },
    gain:     { title: 'Prise de masse',  delta: '+200 kcal', desc: 'Surplus contrôlé' }
  };

  var MACRO_LABELS = { protein: 'Protéines', fat: 'Lipides', carbs: 'Glucides' };
  var MACRO_COLORS = {
    protein: 'var(--macro-protein)',
    fat:     'var(--macro-fat)',
    carbs:   'var(--macro-carbs)'
  };

  // ── Calcul ─────────────────────────────────────────────────────────────────
  function compute(s) {
    // Validation plages
    if (
      !s.weight || s.weight < 30 || s.weight > 250 ||
      !s.height || s.height < 100 || s.height > 250 ||
      !s.age    || s.age    < 15  || s.age    > 100
    ) {
      return null;
    }

    // BMR — Mifflin-St Jeor (1990)
    var bmr = 10 * s.weight + 6.25 * s.height - 5 * s.age + (s.sex === 'm' ? 5 : -161);

    // NEAT — pas : constante nette 0,029 kcal/pas × (poids/70)
    // Dérivé de (3,5 − 1,0) METs nets / 100 pas/min × 3,5 × 70 / 200
    // (Compendium of Physical Activities, Ainsworth et al. 2011)
    var stepsKcal  = s.steps * 0.029 * (s.weight / 70);

    // NEAT — debout : METs nets = (1,5 − 1,0) = 0,5 pour éviter double comptage avec BMR
    var standHours = STANDING_HOURS[s.standing] || 0;
    var standKcal  = standHours * 60 * (0.5 * 3.5 * s.weight) / 200;
    var neat       = stepsKcal + standKcal;

    // EAT — METs nets = (intensity − 1,0) pour éviter double comptage avec BMR
    var sessWeek   = SESSIONS_PER_WEEK[s.training] || 0;
    var eatWeekly  = sessWeek * s.duration * ((s.intensity - 1.0) * 3.5 * s.weight) / 200;
    var eat        = eatWeekly / 7;

    // TDEE — TEF ≈ 10 % de l'apport total (Westerterp, Nutr Metab 2004)
    // Résolution : TDEE = BMR + TEF + NEAT + EAT  et  TEF = 0,10 × TDEE
    // → TDEE = (BMR + NEAT + EAT) / 0,90
    var tdee = Math.round((bmr + neat + eat) / 0.90);
    var tef  = Math.round(tdee * 0.10);

    var goals = {
      lose:     tdee - 500,
      maintain: tdee,
      gain:     tdee + 200
    };

    // Macros par objectif
    var macrosByGoal = {};
    ['lose', 'maintain', 'gain'].forEach(function (g) {
      var kcal          = goals[g];
      var proteinFactor = g === 'lose' ? 2.2 : g === 'gain' ? 2.0 : 1.8;
      var protein       = Math.round(s.weight * proteinFactor);
      var fat           = Math.round((kcal * 0.27) / 9);
      var carbs         = Math.round((kcal - protein * 4 - fat * 9) / 4);
      macrosByGoal[g]   = { protein: protein, fat: Math.max(fat, 0), carbs: Math.max(carbs, 0) };
    });

    return {
      bmr:          Math.round(bmr),
      tef:          Math.round(tef),
      neat:         Math.round(neat),
      eat:          Math.round(eat),
      tdee:         tdee,
      goals:        goals,
      macrosByGoal: macrosByGoal
    };
  }

  // ── Rendu résultats ────────────────────────────────────────────────────────
  function pct(val, total) {
    return total > 0 ? Math.round((val / total) * 100) : 0;
  }

  function barRowHTML(label, kcal, total, extraStyle) {
    var p   = pct(kcal, total);
    var col = extraStyle ? 'style="' + extraStyle + '"' : '';
    return '<div class="tdee-bar-row">' +
      '<span class="tdee-bar-label">' + label + '</span>' +
      '<div class="tdee-bar-track"><div class="tdee-bar-fill" style="--tdee-bar-w:' + p + '%' + (extraStyle ? ';' + extraStyle : '') + '"></div></div>' +
      '<span class="tdee-bar-kcal">' + kcal.toLocaleString('fr-FR') + '&nbsp;kcal</span>' +
      '<span class="tdee-bar-pct">' + p + '%</span>' +
      '</div>';
  }

  function macroRowHTML(key, grams, kcalFromMacro, totalKcal) {
    var p = pct(kcalFromMacro, totalKcal);
    return '<div class="tdee-macro-row">' +
      '<span class="tdee-macro-label">' + MACRO_LABELS[key] + '</span>' +
      '<div class="tdee-bar-track"><div class="tdee-bar-fill" style="--tdee-bar-w:' + p + '%;background:' + MACRO_COLORS[key] + '"></div></div>' +
      '<span class="tdee-macro-g">' + grams + '&nbsp;g</span>' +
      '<span class="tdee-bar-pct">' + p + '%</span>' +
      '</div>';
  }

  function renderResults(r) {
    var container = document.getElementById('tdee-results');
    if (!container) return;

    if (!r) {
      container.innerHTML =
        '<p class="tdee-error" role="alert">Valeurs hors plage — vérifiez poids (30–250 kg), taille (100–250 cm) et âge (15–100 ans).</p>';
      return;
    }

    // ── Décomposition ──────────────────────────────────────────────────────
    var barsHTML =
      barRowHTML('BMR',  r.bmr,  r.tdee) +
      barRowHTML('TEF',  r.tef,  r.tdee) +
      barRowHTML('NEAT', r.neat, r.tdee) +
      barRowHTML('EAT',  r.eat,  r.tdee);

    // ── Cartes objectifs ───────────────────────────────────────────────────
    var cardsHTML = ['lose', 'maintain', 'gain'].map(function (g) {
      var info     = GOAL_LABELS[g];
      var isActive = state.goal === g ? ' is-active' : '';
      return '<button type="button" class="tdee-goal-card' + isActive + '" data-goal="' + g + '">' +
        '<span class="tdee-goal-title">' + info.title + '</span>' +
        '<span class="tdee-goal-kcal">' + r.goals[g].toLocaleString('fr-FR') + '&nbsp;kcal</span>' +
        '<span class="tdee-goal-delta">' + info.delta + '</span>' +
        '<span class="tdee-goal-desc">' + info.desc + '</span>' +
        '</button>';
    }).join('');

    // ── Macros pour l'objectif actif ───────────────────────────────────────
    var macros     = r.macrosByGoal[state.goal];
    var activeKcal = r.goals[state.goal];
    var macrosHTML =
      macroRowHTML('protein', macros.protein, macros.protein * 4, activeKcal) +
      macroRowHTML('fat',     macros.fat,     macros.fat * 9,     activeKcal) +
      macroRowHTML('carbs',   macros.carbs,   macros.carbs * 4,   activeKcal);

    var goalTitle = GOAL_LABELS[state.goal].title;

    // ── Assemblage ─────────────────────────────────────────────────────────
    container.innerHTML =
      '<div class="tdee-results-inner">' +

        '<div class="tdee-hero">' +
          '<div class="tdee-hero-label">TDEE estimé</div>' +
          '<div class="tdee-hero-value">' + r.tdee.toLocaleString('fr-FR') + '</div>' +
          '<div class="tdee-hero-unit">kcal / jour</div>' +
        '</div>' +

        '<div class="tdee-breakdown">' +
          '<h5 class="tdee-sub-title">Décomposition</h5>' +
          barsHTML +
        '</div>' +

        '<div class="tdee-goals">' +
          '<h5 class="tdee-sub-title">Choisir un objectif</h5>' +
          '<div class="tdee-goal-cards">' + cardsHTML + '</div>' +
        '</div>' +

        '<div class="tdee-macros">' +
          '<h5 class="tdee-sub-title">Macros — ' + goalTitle + '</h5>' +
          macrosHTML +
        '</div>' +

        '<details class="tdee-method">' +
          '<summary>Méthode de calcul</summary>' +
          '<p><strong>BMR</strong> : Mifflin-St Jeor (1990) — formule la plus précise pour la population générale (±10 % dans ~80 % des cas).<br>' +
          '<strong>TEF</strong> : 10 % de l\'apport calorique total — résolu algébriquement : TDEE = (BMR + NEAT + EAT) / 0,90 (Westerterp, <em>Nutr Metab</em> 2004).<br>' +
          '<strong>NEAT (pas)</strong> : 0,029 kcal/pas × (poids/70) — constante nette dérivée de (3,5 − 1,0) METs / 100 pas/min, évitant le double comptage avec le BMR (Compendium of Physical Activities, Ainsworth et al. 2011).<br>' +
          '<strong>NEAT (debout)</strong> : (1,5 − 1,0) METs nets × 3,5 × poids × durée / 200 — seule la dépense au-delà du repos est comptée.<br>' +
          '<strong>EAT</strong> : Sessions × durée × (METs − 1,0) × 3,5 × poids / 200 / 7 — METs nets pour éviter le double comptage avec le BMR.<br>' +
          '<strong>Protéines</strong> : 2,2 g/kg (déficit), 1,8 g/kg (maintien), 2,0 g/kg (prise de masse) — d\'après Helms et al. <em>IJSNEM</em> 2014 et Morton et al. <em>Br J Sports Med</em> 2018.<br>' +
          '<em>Estimation indicative basée sur des formules validées — non un résultat de mesure directe (calorimétrie indirecte).</em></p>' +
        '</details>' +

      '</div>';

    // Listeners sur les cartes objectif (réattachés après chaque injection)
    container.querySelectorAll('.tdee-goal-card').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.goal = this.dataset.goal;
        update();
      });
    });
  }

  // ── Persistance localStorage ───────────────────────────────────────────────
  var LS_KEY = 'tdee-calc-v3';

  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        Object.keys(defaultState).forEach(function (k) {
          if (saved[k] !== undefined) state[k] = saved[k];
        });
      }
    } catch (e) {}
  }

  // ── Mise à jour centrale ───────────────────────────────────────────────────
  function update() {
    renderResults(compute(state));
    save();
  }

  // ── Synchronisation HTML → state ──────────────────────────────────────────
  function rangeOutput(id, text) {
    var out = document.querySelector('output[for="' + id + '"]');
    if (out) out.textContent = text;
  }

  function toggleEatDetails() {
    var el = document.getElementById('tdee-eat-details');
    if (el) el.style.display = state.training === 0 ? 'none' : '';
  }

  function applyStateToInputs() {
    // Sexe
    document.querySelectorAll('[data-field="sex"]').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.val === state.sex);
    });

    // Champs numériques
    var nums = { 'tdee-weight': state.weight, 'tdee-height': state.height, 'tdee-age': state.age };
    Object.keys(nums).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = nums[id];
    });

    // Slider pas
    var stepsEl = document.getElementById('tdee-steps');
    if (stepsEl) {
      stepsEl.value = state.steps;
      rangeOutput('tdee-steps', state.steps.toLocaleString('fr-FR'));
    }

    // Debout
    document.querySelectorAll('[data-field="standing"]').forEach(function (b) {
      b.classList.toggle('is-active', parseInt(b.dataset.val) === state.standing);
    });

    // Sessions
    document.querySelectorAll('[data-field="training"]').forEach(function (b) {
      b.classList.toggle('is-active', parseInt(b.dataset.val) === state.training);
    });

    // Intensité
    document.querySelectorAll('[data-field="intensity"]').forEach(function (b) {
      b.classList.toggle('is-active', parseFloat(b.dataset.val) === state.intensity);
    });
    var hintEl = document.getElementById('tdee-intensity-hint');
    if (hintEl) hintEl.textContent = INTENSITY_HINTS[String(state.intensity)] || '';

    // Slider durée
    var durEl = document.getElementById('tdee-duration');
    if (durEl) {
      durEl.value = state.duration;
      rangeOutput('tdee-duration', state.duration + ' min');
    }

    toggleEatDetails();
  }

  // ── Listeners ─────────────────────────────────────────────────────────────
  function attachListeners() {
    var calc = document.getElementById('tdee-calc');
    if (!calc) return;

    // Délégation : toggles & segments
    calc.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-field]');
      if (!btn || btn.id === 'tdee-calc') return;
      var field = btn.dataset.field;
      var val   = btn.dataset.val;

      var group = btn.closest('[role="group"]');
      if (group) {
        group.querySelectorAll('[data-field="' + field + '"]').forEach(function (b) {
          b.classList.remove('is-active');
        });
      }
      btn.classList.add('is-active');

      if (field === 'sex') {
        state.sex = val;
      } else if (field === 'standing') {
        state.standing = parseInt(val);
      } else if (field === 'training') {
        state.training = parseInt(val);
        toggleEatDetails();
      } else if (field === 'intensity') {
        state.intensity = parseFloat(val);
        var hintEl = document.getElementById('tdee-intensity-hint');
        if (hintEl) hintEl.textContent = INTENSITY_HINTS[val] || '';
      }

      update();
    });

    // Champs numériques
    ['tdee-weight', 'tdee-height', 'tdee-age'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', function () {
        var v = parseFloat(this.value);
        if (id === 'tdee-weight')      state.weight = v;
        else if (id === 'tdee-height') state.height = v;
        else if (id === 'tdee-age')    state.age    = v;
        update();
      });
    });

    // Slider pas
    var stepsEl = document.getElementById('tdee-steps');
    if (stepsEl) {
      stepsEl.addEventListener('input', function () {
        state.steps = parseInt(this.value);
        rangeOutput('tdee-steps', state.steps.toLocaleString('fr-FR'));
        update();
      });
    }

    // Slider durée
    var durEl = document.getElementById('tdee-duration');
    if (durEl) {
      durEl.addEventListener('input', function () {
        state.duration = parseInt(this.value);
        rangeOutput('tdee-duration', state.duration + ' min');
        update();
      });
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    if (!document.getElementById('tdee-calc')) return;
    load();
    applyStateToInputs();
    update();
    attachListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
