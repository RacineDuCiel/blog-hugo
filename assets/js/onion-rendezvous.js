(function () {
    const steps = {
        1: {
            title: "1. Publication du descripteur",
            body: `<p>Le <strong>service onion</strong> prépare son point d'entrée public sans révéler son adresse réseau.</p>
                <ul>
                    <li>Il établit des circuits vers plusieurs <strong>Introduction Points</strong>.</li>
                    <li>Il publie un <strong>descripteur chiffré</strong> auprès de relais HSDir déterminés par la période et ses clés aveuglées.</li>
                </ul>`,
            actors: ["service", "hsdir", "ip"]
        },
        2: {
            title: "2. Récupération par le client",
            body: `<p>Le <strong>client</strong> connaît l'adresse .onion et peut dériver où chercher le descripteur.</p>
                <ul>
                    <li>Il interroge les <strong>HSDir</strong> pertinents pour la période courante.</li>
                    <li>Il récupère les points d'introduction et leurs clés, pas l'adresse IP du service.</li>
                </ul>`,
            actors: ["client", "hsdir"]
        },
        3: {
            title: "3. Préparation du rendez-vous",
            body: `<p>Le <strong>client</strong> choisit un relais neutre comme Rendezvous Point.</p>
                <ul>
                    <li>Il construit un circuit vers ce relais.</li>
                    <li>Il lui remet un <strong>cookie de rendez-vous</strong> qui servira à reconnaître le bon service.</li>
                </ul>`,
            actors: ["client", "rp"]
        },
        4: {
            title: "4. Introduction opaque",
            body: `<p>Le <strong>client</strong> contacte un Introduction Point listé dans le descripteur.</p>
                <ul>
                    <li>Le message indique le RP, le cookie et la première partie du handshake onion-service.</li>
                    <li>L'Introduction Point relaie une demande opaque au service ; il ne lit pas le contenu sensible.</li>
                </ul>`,
            actors: ["client", "ip", "service"]
        },
        5: {
            title: "5. Jonction côté service",
            body: `<p>Le <strong>service</strong> accepte l'introduction et rejoint le Rendezvous Point.</p>
                <ul>
                    <li>Il construit son propre circuit vers le RP.</li>
                    <li>Il prouve qu'il connaît le cookie et complète le handshake.</li>
                </ul>`,
            actors: ["service", "rp"]
        },
        6: {
            title: "6. Tunnel relayé",
            body: `<p>Le <strong>Rendezvous Point</strong> relie les deux demi-circuits sans apprendre les extrémités réelles.</p>
                <ul>
                    <li>Le client et le service disposent de clés de bout en bout.</li>
                    <li>Le RP relaie les cellules, mais ne voit ni les IP finales ni le contenu.</li>
                </ul>`,
            actors: ["service", "client", "rp"]
        }
    };

    function setStep(container, step) {
        const config = steps[step];
        if (!config) return;

        const buttons = container.querySelectorAll(".onion-rv__nav button");
        const actors = container.querySelectorAll(".onion-rv__actor");
        const flows = container.querySelectorAll(".onion-rv__flow");
        const desc = container.querySelector(".onion-rv__desc");

        buttons.forEach((button) => {
            const isActive = button.dataset.step === String(step);
            button.classList.toggle("active", isActive);
            if (isActive) {
                button.setAttribute("aria-current", "step");
            } else {
                button.removeAttribute("aria-current");
            }
            button.setAttribute("aria-pressed", String(isActive));
        });

        actors.forEach((actor) => {
            const isActive = config.actors.includes(actor.dataset.actor);
            actor.classList.toggle("active", isActive);
            actor.classList.toggle("dim", !isActive);
        });

        flows.forEach((flow) => {
            flow.classList.toggle("visible", flow.dataset.flow === String(step));
        });

        desc.innerHTML = `<h4 class="onion-rv__desc-title">${config.title}</h4>${config.body}`;
    }

    document.querySelectorAll(".onion-rv").forEach((container) => {
        const buttons = Array.from(container.querySelectorAll(".onion-rv__nav button"));
        if (!buttons.length) return;

        buttons.forEach((button, index) => {
            button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");

            button.addEventListener("click", () => {
                setStep(container, Number(button.dataset.step));
            });

            button.addEventListener("keydown", (event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

                event.preventDefault();
                let nextIndex = index;

                if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
                if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
                if (event.key === "Home") nextIndex = 0;
                if (event.key === "End") nextIndex = buttons.length - 1;

                buttons[nextIndex].focus();
                setStep(container, Number(buttons[nextIndex].dataset.step));
            });
        });

        setStep(container, 1);
    });
})();
