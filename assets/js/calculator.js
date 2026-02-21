(function () {
    'use strict';

    // ── Helpers DOM ───────────────────────────────────────────────────────
    function el(tag, attrs) {
        const node = document.createElement(tag);
        if (attrs) {
            Object.entries(attrs).forEach(function ([k, v]) {
                if (k === 'className') node.className = v;
                else if (k === 'textContent') node.textContent = v;
                else node.setAttribute(k, v);
            });
        }
        return node;
    }

    function buildRow(label, value) {
        const tr = el('tr');
        const tdL = el('td', { textContent: label });
        const tdV = el('td', { textContent: value });
        tr.appendChild(tdL);
        tr.appendChild(tdV);
        return tr;
    }

    function buildTotalRow(label, value) {
        const tr = el('tr', { className: 'total' });
        const tdL = el('td');
        const strongL = el('strong', { textContent: label });
        tdL.appendChild(strongL);
        const tdV = el('td');
        const strongV = el('strong', { textContent: value });
        tdV.appendChild(strongV);
        tr.appendChild(tdL);
        tr.appendChild(tdV);
        return tr;
    }

    // ── Calcul ────────────────────────────────────────────────────────────
    function calcTDEE() {
        const sex = document.getElementById('calc-sex').value;
        const age = parseFloat(document.getElementById('calc-age').value) || 0;
        const weight = parseFloat(document.getElementById('calc-weight').value) || 0;
        const height = parseFloat(document.getElementById('calc-height').value) || 0;
        const steps = parseFloat(document.getElementById('calc-steps').value) || 0;
        const standing = parseInt(document.getElementById('calc-standing').value) || 0;
        const trainingLevel = parseInt(document.getElementById('calc-training').value) || 0;
        const mets = parseFloat(document.getElementById('calc-intensity').value) || 0;
        const duration = parseFloat(document.getElementById('calc-duration').value) || 0;

        let bmr = 10 * weight + 6.25 * height - 5 * age + (sex === 'm' ? 5 : -161);

        const tef = bmr * 0.10;
        const stepsKcal = steps * 0.04 * (weight / 70);
        const standingHours = [0.5, 1.5, 3, 5][standing];
        const standingKcal = standingHours * 60 * (1.5 * 3.5 * weight) / 200;
        const neat = stepsKcal + standingKcal;
        const sessionsPerWeek = [0, 1.5, 3.5, 5.5, 7][trainingLevel];
        const eatWeekly = sessionsPerWeek * duration * (mets * 3.5 * weight) / 200;
        const eat = eatWeekly / 7;
        const tdee = Math.round(bmr + tef + neat + eat);

        const neatLabel = 'NEAT (' + steps.toLocaleString('fr-FR') + ' pas + activité)';

        // ── Tableau de résultats ─────────────────────────────────────────
        const table = el('table');
        table.appendChild(buildRow('BMR', Math.round(bmr) + ' kcal'));
        table.appendChild(buildRow('TEF (10%)', '+' + Math.round(tef) + ' kcal'));
        table.appendChild(buildRow(neatLabel, '+' + Math.round(neat) + ' kcal'));
        table.appendChild(buildRow('EAT (entraînement)', '+' + Math.round(eat) + ' kcal'));
        table.appendChild(buildTotalRow('TDEE', tdee.toLocaleString('fr-FR') + ' kcal/j'));

        const resultsDiv = el('div', { className: 'calc-results' });
        resultsDiv.appendChild(table);

        // ── Méthodologie (<details>) ──────────────────────────────────────
        const details = el('details', { className: 'calc-method' });
        const summary = el('summary', { textContent: 'Méthode de calcul' });
        details.appendChild(summary);

        const p = el('p');
        const methodItems = [
            { label: 'BMR', text: ' : Mifflin-St Jeor (1990).' },
            { label: 'TEF', text: ' : 10% du BMR.' },
            { label: 'NEAT (pas)', text: ' : 0.04 kcal/pas × (poids/70).' },
            { label: 'NEAT (debout)', text: ' : 1.5 METs × durée.' },
            { label: 'EAT', text: ' : Sessions × durée × METs.' },
        ];
        methodItems.forEach(function (item, i) {
            p.appendChild(el('strong', { textContent: item.label }));
            p.appendChild(document.createTextNode(item.text));
            if (i < methodItems.length - 1) p.appendChild(el('br'));
        });
        p.appendChild(el('br'));
        p.appendChild(el('em', { textContent: 'Estimation indicative, non une mesure exacte.' }));
        details.appendChild(p);

        // ── Injection dans le DOM ─────────────────────────────────────────
        const output = document.getElementById('calc-output');
        output.textContent = ''; // vide proprement, sans innerHTML
        output.appendChild(resultsDiv);
        output.appendChild(details);
    }

    // ── Init : remplace l'onclick inline par un vrai listener ────────────
    const btn = document.querySelector('.calc-container button');
    if (btn) {
        btn.addEventListener('click', calcTDEE);
    }

})();
