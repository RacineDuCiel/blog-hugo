(function () {
    const stepNames = {
        1: "Publication",
        2: "Découverte",
        3: "Rendez-vous",
        4: "Introduction",
        5: "Jonction",
        6: "Tunnel"
    };

    const descriptions = {
        1: `<div class="step-title">1. Publication</div>
            <p>Le <strong>Service</strong> prépare son accès :</p>
            <ul>
                <li>Publie un <strong>descripteur</strong> sur le HSDir (DHT)</li>
                <li>Établit des circuits vers ses <strong>Introduction Points</strong></li>
            </ul>`,
        2: `<div class="step-title">2. Découverte</div>
            <p>Le <strong>Client</strong> cherche le service :</p>
            <ul>
                <li>Interroge le <strong>HSDir</strong> avec l'adresse .onion</li>
                <li>Récupère le descripteur (liste des IP)</li>
            </ul>`,
        3: `<div class="step-title">3. Rendez-vous</div>
            <p>Le <strong>Client</strong> prépare un point neutre :</p>
            <ul>
                <li>Choisit un relais comme <strong>Rendez-vous Point</strong></li>
                <li>Lui envoie un <strong>cookie secret</strong></li>
            </ul>`,
        4: `<div class="step-title">4. Introduction</div>
            <p>Le <strong>Client</strong> contacte le Service :</p>
            <ul>
                <li>Envoie <strong>INTRODUCE</strong> via l'Intro Point</li>
                <li>Contient : adresse du RP + cookie + handshake DH</li>
            </ul>`,
        5: `<div class="step-title">5. Jonction</div>
            <p>Le <strong>Service</strong> rejoint le RP :</p>
            <ul>
                <li>Construit un circuit vers le Rendez-vous</li>
                <li>Envoie <strong>RENDEZVOUS</strong> avec le cookie</li>
            </ul>`,
        6: `<div class="step-title">6. Tunnel établi</div>
            <p>Communication <strong>anonyme de bout en bout</strong> :</p>
            <ul>
                <li>Le RP connecte les deux circuits</li>
                <li>Aucune IP révélée de chaque côté</li>
            </ul>`
    };

    const actorsByStep = {
        1: ['service', 'hsdir', 'ip'],
        2: ['client', 'hsdir'],
        3: ['client', 'rp'],
        4: ['client', 'ip', 'service'],
        5: ['service', 'rp'],
        6: ['service', 'client', 'rp']
    };

    const container = document.querySelector('.onion-rv');
    if (!container) return;

    const buttons = container.querySelectorAll('.onion-rv-nav button');
    const stepLabel = document.getElementById('rv-step-label');
    const desc = document.getElementById('rv-desc');
    const actors = container.querySelectorAll('.actor');
    const flows = container.querySelectorAll('.flow-path');

    function setStep(step) {
        buttons.forEach(b => b.classList.toggle('active', b.dataset.step == step));
        stepLabel.textContent = stepNames[step];
        desc.innerHTML = descriptions[step];

        const active = actorsByStep[step];
        actors.forEach(a => a.classList.toggle('dim', !active.includes(a.dataset.actor)));
        flows.forEach(f => f.classList.toggle('visible', f.dataset.flow == step));
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => setStep(parseInt(btn.dataset.step)));
    });

    setStep(1);
})();
