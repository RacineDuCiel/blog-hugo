function calcTDEE() {
    const sex = document.getElementById('calc-sex').value;
    const age = parseFloat(document.getElementById('calc-age').value);
    const weight = parseFloat(document.getElementById('calc-weight').value);
    const height = parseFloat(document.getElementById('calc-height').value);
    const steps = parseFloat(document.getElementById('calc-steps').value) || 0;
    const standing = parseInt(document.getElementById('calc-standing').value);
    const trainingLevel = parseInt(document.getElementById('calc-training').value);
    const mets = parseFloat(document.getElementById('calc-intensity').value);
    const duration = parseFloat(document.getElementById('calc-duration').value);

    let bmr;
    if (sex === 'm') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const tef = bmr * 0.10;
    const stepsKcal = steps * 0.04 * (weight / 70);
    const standingHours = [0.5, 1.5, 3, 5][standing];
    const standingKcal = standingHours * 60 * (1.5 * 3.5 * weight) / 200;
    const neat = stepsKcal + standingKcal;
    const sessionsPerWeek = [0, 1.5, 3.5, 5.5, 7][trainingLevel];
    const eatWeekly = sessionsPerWeek * duration * (mets * 3.5 * weight) / 200;
    const eat = eatWeekly / 7;
    const tdee = Math.round(bmr + tef + neat + eat);

    document.getElementById('calc-output').innerHTML =
        '<div class="calc-results">' +
        '<table>' +
        '<tr><td>BMR</td><td>' + Math.round(bmr) + ' kcal</td></tr>' +
        '<tr><td>TEF (10%)</td><td>+' + Math.round(tef) + ' kcal</td></tr>' +
        '<tr><td>NEAT (' + steps.toLocaleString('fr-FR') + ' pas + activité)</td><td>+' + Math.round(neat) + ' kcal</td></tr>' +
        '<tr><td>EAT (entraînement)</td><td>+' + Math.round(eat) + ' kcal</td></tr>' +
        '<tr class="total"><td><strong>TDEE</strong></td><td><strong>' + tdee.toLocaleString('fr-FR') + ' kcal/j</strong></td></tr>' +
        '</table>' +
        '</div>' +
        '<details class="calc-method">' +
        '<summary>Méthode de calcul</summary>' +
        '<p><strong>BMR</strong> : Mifflin-St Jeor (1990).<br>' +
        '<strong>TEF</strong> : 10% du BMR.<br>' +
        '<strong>NEAT (pas)</strong> : 0.04 kcal/pas × (poids/70).<br>' +
        '<strong>NEAT (debout)</strong> : 1.5 METs × durée.<br>' +
        '<strong>EAT</strong> : Sessions × durée × METs.<br>' +
        '<em>Estimation indicative, non une mesure exacte.</em></p>' +
        '</details>';
}
