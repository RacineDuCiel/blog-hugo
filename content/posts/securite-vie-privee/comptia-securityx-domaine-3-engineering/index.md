---
title: "CompTIA SecurityX — Domaine 3 : Security Engineering"
date: 2026-02-25
categories: ["Securite-Vie-Privee"]
tags: ["SecurityX", "CASP+", "CompTIA", "Engineering", "Cryptographie", "Certification"]
description: "Fiche de révision SecurityX (ex CASP+) — Domaine 3 : engineering sécurité, identité, endpoints, réseau, cryptographie et automatisation."
showOnHome: true
pageClass: "fiche-revision"
---

# DOMAIN 3 -- SECURITY ENGINEERING

> Concevoir, implémenter et dépanner des architectures sécurisées sur l'ensemble de l'infrastructure d'entreprise : identité, endpoints, réseau, hardware, systèmes spécialisés, automatisation et cryptographie.

---

## OBJECTIF 3.1 -- Troubleshoot IAM Components

*Given a Scenario, Troubleshoot Common Issues with Identity and Access Management (IAM) Components in an Enterprise Environment*

### 3.1.1 Contrôle d'accès des sujets (Subject Access Control)

Tout accès à une ressource est initié par un **sujet** (subject). Il existe quatre types de sujets, chacun avec ses propres vecteurs de défaillance.

**User** -- Un individu qui interagit avec le système. Problème principal : permissions mal assignées ou accumulées (privilege creep) par mauvaise gestion des groupes. Le principe directeur est le **PoLP** (Principle of Least Privilege) : ne donner que les droits strictement nécessaires à la fonction. Les audits réguliers et le RBAC (Role-Based Access Control) correctement maintenu sont les contrôles essentiels.

**Process** -- Une tâche automatisée ou un service exécuté par le système. Problème principal : échec de tâches (backups, scripts) par manque de permissions. Solution : créer des **service accounts** dédiés avec des ACLs précises, effectuer la rotation des credentials, et auditer les logs d'exécution.

**Device** -- Un équipement physique ou virtuel connecté au réseau. Problème principal : **device sprawl**, c'est-à-dire la prolifération d'appareils non managés (BYOD, IoT, shadow IT). Solution : **MDM** (Mobile Device Management), segmentation réseau, et politiques d'accès conditionnelles par appareil.

**Service** -- Un composant applicatif qui interagit avec d'autres services via des API. Problème principal : permissions API trop larges ou mal configurées, entraînant des fuites de données inter-services. Solution : tokens sécurisés (**OAuth 2.0**), communications chiffrées (**TLS**), audit des appels API, et micro-segmentation.

---

### 3.1.2 Biométrie

Les systèmes biométriques utilisent des caractéristiques physiques (empreinte, iris, visage) ou comportementales (frappe clavier, démarche) pour l'authentification.

**Problèmes courants** : échecs de reconnaissance causés par des facteurs environnementaux (luminosité, saleté sur le capteur, gants, blessures, vieillissement).

**Métriques clés** : le **FAR** (False Acceptance Rate) mesure les acceptations erronées, le **FRR** (False Rejection Rate) mesure les rejets erronés. Le point d'équilibre s'appelle le **CER** (Crossover Error Rate) -- plus il est bas, meilleur est le système.

**Mitigation** : toujours coupler la biométrie à un second facteur dans un schéma **MFA** (biométrie + PIN ou smartcard). Calibrer et maintenir les capteurs régulièrement.

---

### 3.1.3 Gestion des secrets (Secret Management)

Un secret est toute information sensible utilisée pour l'authentification ou le chiffrement. La gestion des secrets couvre quatre catégories.

**Tokens** (OAuth, JWT) -- Jetons temporaires représentant une autorisation. Problèmes : expiration sans mécanisme de refresh, réutilisation abusive, vol de token. Solutions : scoping précis (limiter les permissions du token au minimum), durée d'expiration courte et configurée, mécanisme de révocation, surveillance des usages anormaux.

**Certificates** -- Certificats numériques X.509 pour l'authentification et le chiffrement. Problèmes : expiration entraînant des interruptions de service. Cas réel : l'expiration du certificat racine DST Root CA X3 de Let's Encrypt le 30/09/2021 a provoqué des pannes chez Cloudflare et Shopify. Solutions : monitoring des dates d'expiration à tous les niveaux (racine, intermédiaire, feuille), **renouvellement automatisé** (Let's Encrypt, HashiCorp Vault), tests de compatibilité.

**Passwords** -- Mots de passe textuels. Problèmes : mots de passe faibles ou réutilisés rendant possibles le brute force et le credential stuffing. Solutions : politiques de complexité, **MFA** obligatoire, **password managers** pour générer et stocker.

**Keys** -- Clés cryptographiques symétriques ou asymétriques. Problèmes : clés stockées en clair dans le code source, exposées dans les repos Git. Solutions : utiliser des **HSMs** ou des services de gestion de clés (**KMS**) comme AWS Secrets Manager ou Azure Key Vault, appliquer des politiques IAM strictes, chiffrer les clés elles-mêmes (envelope encryption).

**Cycle de vie des secrets** :
- **Rotation** : remplacement périodique automatisé (AWS Secrets Manager, Azure Key Vault). Réduit la fenêtre d'exploitation en cas de compromission.
- **Deletion** : suppression ou révocation des secrets devenus inutiles. Nécessite des audits réguliers et une politique de lifecycle management.

---

### 3.1.4 Accès conditionnel (Conditional Access)

L'accès conditionnel applique des règles dynamiques basées sur le contexte de la requête d'accès. Quatre critères principaux :

**User-to-Device Binding** -- L'accès est lié à un appareil spécifique enregistré. Problème : remplacement d'appareil = accès refusé. Solution : processus d'enrollment correct, mise à jour des registres d'appareils (Microsoft Intune, MDM).

**Geographic Location** -- L'accès est restreint selon la localisation géographique (geofencing). Problème : utilisateur en déplacement légitime bloqué. Solution : allowlists temporaires pour les voyages, ajustements de politique, VPN autorisé avec monitoring renforcé.

**Time-based** -- L'accès est limité à des plages horaires définies. Problème : accès refusé pour des opérations légitimes en dehors des heures normales (astreinte, urgence). Solution : exceptions prédéfinies par rôle, mécanismes d'override temporaire avec approbation.

**Configuration** -- L'accès dépend de l'état de conformité de l'appareil (antivirus à jour, OS patché, chiffrement actif). Problème : appareil rendu non conforme par un retard de mise à jour. Solution : outils de configuration management, alertes proactives de non-conformité, remédiation automatisée.

---

### 3.1.5 Attestation

**Définition** : vérification cryptographique qu'un utilisateur, un appareil ou un système satisfait des exigences de sécurité prédéfinies avant de recevoir l'accès.

**Contexte** : élément central du **Zero Trust**. Exemple : un appareil doit prouver l'intégrité de son firmware et de son OS (via TPM et Measured Boot) avant d'accéder au réseau interne. Si l'attestation échoue, l'accès est refusé ou limité à un réseau de quarantaine.

**Causes d'échec** : patch manquant, configuration altérée, firmware non vérifié. Solutions : intégration avec le patch management, communication rapide entre administrateurs et utilisateurs, politiques de remédiation automatisée.

---

### 3.1.6 Cloud IAM -- Access and Trust Policies

**Problème fondamental** : les politiques IAM cloud mal configurées accordent un accès trop permissif ou créent des restrictions involontaires.

**Cas réel -- Code Spaces (juin 2014)** : des credentials admin AWS compromis (protection par mot de passe seul, sans MFA) ont permis à un attaquant de supprimer l'intégralité des VMs, repos et backups (hébergés sur le même compte AWS). L'entreprise a fermé définitivement. Leçon : MFA obligatoire sur tous les comptes admin, séparation des environnements, backups hors du compte principal.

**Outils d'audit** : AWS IAM Access Analyzer (détecte les ressources partagées de manière non intentionnelle), Azure AD PIM (gestion des accès privilégiés), GCP IAM Recommender (suggestions de réduction de permissions).

**Best practices** : PoLP, audit continu des politiques, MFA obligatoire, séparation des comptes admin et production.

---

### 3.1.7 Logging et Monitoring

Tous les événements IAM doivent être enregistrés et analysés en temps réel :
- Logs détaillés pour chaque tentative d'authentification (réussie ou échouée), changement de permission, et accès aux ressources sensibles.
- Intégration **SIEM** (Security Information and Event Management) pour la corrélation en temps réel.
- Protection des logs contre le tampering (intégrité cryptographique, stockage immuable, accès restreint).

---

### 3.1.8 Privileged Identity Management (PIM)

**Problème** : le **privilege creep** -- accumulation progressive de permissions au fil des changements de rôle, sans retrait des anciens droits. Résultat : des comptes avec des permissions bien au-delà du nécessaire.

**Solution** : outils comme Microsoft Entra ID PIM, application du PoLP, revues d'accès régulières (recertification).

**JIT (Just-In-Time) Access** : au lieu de permissions permanentes, l'utilisateur demande une élévation temporaire (ex: 1h) qui nécessite une approbation. Toutes les activités durant cette période sont loguées. Après expiration, les droits élevés sont automatiquement révoqués.

---

### 3.1.9 Authentification et Autorisation

#### Protocoles d'authentification

**SAML (Security Assertion Markup Language)** -- Protocole XML pour le SSO entre un Identity Provider (IdP) et un Service Provider (SP). L'IdP authentifie l'utilisateur et émet une assertion SAML que le SP valide. Troubleshooting : vérifier les logs IdP/SP, s'assurer que les configurations sont alignées (Entity IDs, URLs SSO, endpoints ACS, metadata, certificats partagés).

**OIDC (OpenID Connect)** -- Couche d'authentification construite sur OAuth 2.0. Permet le login unique décentralisé via des tokens d'identité (ID tokens au format JWT). Troubleshooting : vérifier les redirect URIs, les client credentials, la validité de la signature des tokens.

**MFA (Multifactor Authentication)** -- Combine au moins deux facteurs parmi : ce que l'utilisateur sait (mot de passe), ce qu'il possède (token, smartphone), et ce qu'il est (biométrie). Troubleshooting : prévoir des recovery codes, des méthodes de backup (SMS, email, hardware tokens comme YubiKey).

**SSO (Single Sign-On)** -- Authentification unique donnant accès à plusieurs systèmes. Troubleshooting : vérifier les tokens de session, la configuration IdP-SP, les règles réseau/firewall.

#### Éléments à vérifier sur les tokens SSO

- Période de validité : attributs `NotBefore`, `NotOnOrAfter`, `expiration`
- Erreurs de signature (certificat expiré ou incompatible)
- Attributs manquants ou incorrects (`email`, `groups`, `audience`)
- **Clock drift** entre IdP et SP : la synchronisation **NTP** est indispensable ; un décalage de quelques minutes suffit à invalider les tokens
- Outils de diagnostic : SAML-tracer, Fiddler, JWT.io, logs d'identité

#### Configuration IdP-SP -- checklist

- Entity IDs correspondants des deux côtés
- URLs SSO et endpoints ACS (Assertion Consumer Service) identiques
- Fichiers metadata à jour et synchronisés
- Clés publiques / certificats partagés et non expirés
- Mapping des attributs et transformations rôles/claims
- Compatibilité de version du protocole (SAML 2.0, OIDC)

---

#### Kerberos

Protocole d'authentification réseau basé sur un système de tickets, utilisé dans les environnements Active Directory.

**Fonctionnement** :
1. L'utilisateur s'authentifie auprès du **KDC** (Key Distribution Center)
2. Le KDC émet un **TGT** (Ticket Granting Ticket)
3. L'utilisateur présente le TGT pour obtenir des **service tickets** permettant l'accès aux ressources

**Problème courant** : désynchronisation horaire client-serveur (Kerberos tolère un écart de 5 minutes par défaut). Vérifier : horloge système, synchronisation NTP, accessibilité du KDC.

**Compte KRBTGT et Golden Ticket Attack** :

Le compte **KRBTGT** est le compte de service Active Directory utilisé par le KDC pour signer tous les TGTs. Si le hash NTLM de ce compte est obtenu (via un outil comme **Mimikatz**), un attaquant peut forger des **Golden Tickets** : de faux TGTs valides donnant un accès illimité et indéfini à toutes les ressources du domaine.

**Protection du compte KRBTGT** :
- Limiter les comptes domain admin au strict minimum, utiliser le JIT (LAPS), les PAWs (Privileged Access Workstations), et des comptes séparés pour l'administration
- Monitoring avancé via SIEM avec les Event IDs critiques : **4769** (demande de service ticket), **4770** (renouvellement TGT), **4624** (logon élevé)
- Ne jamais utiliser le compte KRBTGT manuellement, protéger LSASS, désactiver WDigest, activer **Credential Guard**
- Reset du mot de passe KRBTGT **deux fois consécutives** (le compte conserve l'historique des deux derniers mots de passe ; un double reset invalide tous les tickets existants, y compris les Golden Tickets)

---

#### Autres protocoles et concepts

**SAE (Simultaneous Authentication of Equals)** -- Protocole d'authentification Wi-Fi introduit avec WPA3. Utilise un échange Diffie-Hellman résistant au brute force (pas de handshake capturables comme avec WPA2-PSK). Troubleshooting : vérifier la configuration et le firmware des points d'accès.

**PAM (Privileged Access Management)** -- Solutions de contrôle et d'audit des comptes à privilèges élevés. Outils : CyberArk, BeyondTrust. Fonctions : enregistrement des sessions, rotation automatique des mots de passe admin, coffre-fort de credentials.

**OAuth 2.0 (Open Authorization)** -- Framework d'autorisation (pas d'authentification) permettant à une application tierce d'accéder à des ressources au nom d'un utilisateur sans exposer ses credentials. Fonctionne via des **scopes** (permissions granulaires) et des **tokens d'accès**. Troubleshooting : auditer les scopes accordés, restreindre au minimum nécessaire, configurer des expirations courtes.

**EAP (Extensible Authentication Protocol)** -- Framework d'authentification flexible utilisé avec RADIUS/TACACS+ pour le contrôle d'accès réseau. Variantes principales :
- **EAP-TLS** : authentification mutuelle par certificats (le plus sécurisé, nécessite une PKI)
- **EAP-PEAP** : tunnel TLS protégeant un protocole d'authentification interne (souvent MS-CHAPv2)
- **EAP-TTLS** : similaire à PEAP mais plus flexible sur les méthodes internes

**Identity Proofing** -- Processus de vérification initiale de l'identité d'un individu avant la création d'un compte. Méthodes : vérification biométrique, documents gouvernementaux, vérification en personne. Standard de référence : **NIST SP 800-63A** (niveaux de confiance IAL1 à IAL3).

**IEEE 802.1X** -- Standard de contrôle d'accès réseau basé sur les ports (Port-Based NAC). Trois composants : le supplicant (client), l'authenticator (switch/AP), et l'authentication server (RADIUS). L'appareil doit s'authentifier avant d'obtenir l'accès réseau. Utilise des certificats device et un serveur RADIUS.

**Federation** -- Gestion d'identité inter-organisations permettant aux utilisateurs d'une organisation d'accéder aux ressources d'une autre via des relations de confiance. Exige : certificats à jour, synchronisation des configurations IdP-SP, standards communs (SAML, OIDC).

---
---

## OBJECTIF 3.2 -- Enhance Security of Endpoints and Servers

*Given a Scenario, Analyze Requirements to Enhance the Security of Endpoints and Servers*

### 3.2.1 Application Control

Principe : réduire la surface d'attaque en n'autorisant que l'exécution de logiciels explicitement approuvés (whitelisting).

**Outils** :
- **AppLocker** (Windows, domain-joined) : déploiement progressif du mode `Audit` (observation) vers `Enforce` (blocage)
- **Microsoft Intune / UEM** : pour les endpoints non domain-joined (BYOD, remote workers)
- **Gatekeeper** (macOS) : vérifie la signature et la notarisation des applications

**Frameworks de référence** : NIST, CIS Benchmarks. HIPAA impose un contrôle strict des applications médicales.

---

### 3.2.2 Endpoint Detection and Response (EDR)

**Définition** : solution de sécurité qui assure le monitoring en temps réel, la collecte de données télémétriques et la réponse automatisée sur les endpoints.

**Différence avec l'antivirus traditionnel** : l'antivirus s'appuie principalement sur des signatures connues. L'EDR utilise l'analyse comportementale et le ML pour détecter des menaces inconnues, des mouvements latéraux et des comportements anormaux.

**Capacités** : détection d'IoCs (Indicators of Compromise), isolement automatique de l'endpoint, terminaison de processus malveillants, collecte de logs forensiques, intégration avec les threat intelligence feeds et le SIEM.

**Exemple** : Microsoft Defender for Endpoint. Cas réel : lors de l'attaque SolarWinds (2020), un EDR configuré correctement aurait pu détecter l'escalade de privilèges non autorisée issue du backdoor SUNBURST.

**Best practices EDR** :
- Établir un **baseline** du comportement normal pour réduire les faux positifs
- Automatiser les réponses : quarantaine automatique, blocage d'IP
- Mettre à jour les règles de détection avec la threat intelligence récente
- Pratiquer le **threat hunting** actif (proactif), pas seulement la détection passive
- Gérer l'**alert fatigue** du SOC par le fine-tuning des seuils, l'automatisation et l'intégration SIEM

---

### 3.2.3 Event Logging and Monitoring

Les logs d'événements sont le fondement de la détection et de l'investigation.

- SIEM centralisé pour la corrélation et l'analyse en temps réel. Exemple : **Microsoft Sentinel** (cloud-native, SIEM + **SOAR** intégré).
- Intégration avec l'EDR pour une visibilité étendue sur l'ensemble des endpoints.
- Rétention des logs suffisante pour la conformité et l'investigation forensique.

---

### 3.2.4 Endpoint Privilege Management

Application du **PoLP** sur les endpoints : chaque utilisateur et processus ne dispose que des permissions minimales nécessaires.

Objectif : réduire l'impact d'un compte compromis. Un attaquant qui compromet un compte utilisateur standard a beaucoup moins de capacités qu'un attaquant disposant de droits admin locaux.

---

### 3.2.5 Réduction de la surface d'attaque (Attack Surface Monitoring and Reduction)

La surface d'attaque est l'ensemble des points d'entrée exploitables par un attaquant. Pour la réduire :
- Surveiller en continu : services exposés, ports ouverts, logiciels obsolètes
- **RDP** (port **3389**) : désactiver si non nécessaire (vecteur d'attaque majeur pour les ransomwares)
- Scans de vulnérabilité avant ET après patching (ex: **Tenable Nessus**)
- Désactiver les services inutiles, fermer les ports non utilisés
- Segmentation réseau et **NAC** (Network Access Control)

---

### 3.2.6 HIDS / HIPS

Deux systèmes complémentaires de sécurité basés sur l'hôte :

**HIDS (Host-based Intrusion Detection System)** -- Détection passive. Analyse les logs, les fichiers système et les activités pour identifier les anomalies. Exemple : **OSSEC**. Ne bloque pas ; alerte uniquement.

**HIPS (Host-based Intrusion Prevention System)** -- Protection active. Analyse en temps réel et bloque les actions identifiées comme malveillantes. Intervient avant que l'action ne soit complétée.

La combinaison HIDS + HIPS fournit à la fois la visibilité (détection) et la protection (prévention).

---

### 3.2.7 Anti-Malware -- Trois couches de détection

Les solutions anti-malware modernes combinent trois méthodes complémentaires, chacune avec ses forces :

**Signature-based** -- Compare les fichiers à une base de données de signatures connues. Rapide, fiable, très peu de faux positifs. Faiblesse : totalement inefficace contre les menaces inconnues, polymorphes ou zero-day.

**Heuristic** -- Évalue les patterns de code suspects par analyse statique (sans exécution). Capable de détecter les variantes de malwares connus et certains zero-day. Faiblesse : taux de faux positifs plus élevé, analyse plus lente.

**Behavior-based** -- Surveille le comportement des processus en cours d'exécution (analyse dynamique). Efficace contre les malwares zero-day et fileless. Comportements surveillés : modification du registre, consommation CPU anormale, connexion vers un serveur C2, téléchargement de payloads, escalade de privilèges. Faiblesse : consommation de ressources plus importante.

L'ordre de détection est du plus rapide au plus complet : Signature, puis Heuristic, puis Behavior (mnémonique : **SHB**).

**Fonctionnalités avancées** : cloud-based protection (envoi de samples pour analyse), Machine Learning. Exemples : Microsoft Defender Antivirus, Broadcom Endpoint Protection.

---

### 3.2.8 SELinux

**Définition** : module de sécurité Linux développé par la **NSA** (2002) implémentant le **MAC** (Mandatory Access Control). Contrairement au DAC (Discretionary AC) standard de Linux où le propriétaire contrôle l'accès, le MAC impose des politiques système que même root ne peut contourner.

**Composants** :
- **Labels** : contexte de sécurité assigné à chaque objet et processus. Format : `user:role:type:level` (ex: `system_u:object_r:httpd_sys_content_t:s0`)
- **Policies** : règles définissant les actions autorisées entre labels
- **Type Enforcement** : mécanisme principal -- un processus de type `httpd_t` ne peut accéder qu'aux fichiers de type `httpd_sys_content_t`
- **Booleans** : interrupteurs on/off pour activer ou désactiver des règles spécifiques sans réécrire la politique

**Modes de fonctionnement** :

| Mode | Comportement | Commande |
|------|-------------|----------|
| **Enforcing** | Politiques appliquées, violations bloquées | `setenforce 1` |
| **Permissive** | Violations loguées mais non bloquées (mode test) | `setenforce 0` |
| **Disabled** | SELinux complètement désactivé | (fichier config) |

**Commandes utiles** : `sestatus` (vérifier le statut), `getsebool -a` (lister tous les booleans).
**Logs** : `/var/log/audit/audit.log` (daemon `auditd`, messages AVC = Access Vector Cache).

---

### 3.2.9 Host-Based Firewall

Pare-feu logiciel opérant au niveau de l'appareil individuel (pas au périmètre réseau). Filtre le trafic entrant et sortant selon des règles définies localement.

Avantage principal : protection même sur des réseaux non fiables (Wi-Fi public, télétravail). Constitue une couche de défense supplémentaire dans une stratégie de defense-in-depth.

---

### 3.2.10 Browser Isolation

**Principe** : les sessions de navigation web sont exécutées dans un environnement isolé (serveur distant, machine virtuelle ou conteneur) plutôt que directement sur l'endpoint.

Si du code malveillant est exécuté (drive-by download, exploit kit), il est contenu dans l'environnement isolé et ne peut pas atteindre le système hôte.

**Exemples** : Microsoft Application Guard (Edge), Google Chrome site isolation, Safari sandboxing.

---

### 3.2.11 Configuration Management

**Objectif** : maintenir tous les systèmes dans un état de configuration connu, documenté et sécurisé.

**Outils** : Ansible, Puppet, Chef -- permettent le déploiement automatisé et cohérent des configurations sur l'ensemble du parc.

**Importance** : la non-conformité des configurations est un vecteur d'attaque majeur. Cas réel : la vulnérabilité EternalBlue exploitée par WannaCry (2017) a eu un impact massif en partie parce que de nombreux systèmes n'avaient pas été patchés ni correctement configurés.

**Bénéfices** : audit trail complet, conformité réglementaire, réduction du configuration drift.

---

### 3.2.12 MDM (Mobile Device Management)

**Outils** : Microsoft Intune, VMware Workspace ONE, MobileIron.

**Fonctions** : enforcement des politiques de sécurité (complexité mot de passe, chiffrement), remote wipe (effacement à distance en cas de perte/vol), monitoring de conformité, déploiement de mises à jour.

**BYOD** (Bring Your Own Device) : impose le chiffrement obligatoire, les mises à jour forcées, l'accès conditionnel (l'appareil doit être conforme pour accéder aux ressources corporate).

---

### 3.2.13 Threat Actor TTPs -- Techniques sur les endpoints

Les tactiques, techniques et procédures (TTPs) sont classifiées dans le framework **MITRE ATT&CK**.

#### Techniques d'attaque principales

**Injection (XSS, SQLi)** -- Insertion de code malveillant via des entrées utilisateur non validées. Mitigation : input validation côté serveur, fonctions d'échappement (`htmlspecialchars()`), prepared statements / requêtes paramétrées.

**Privilege Escalation** -- Gain de droits supérieurs. Deux formes : verticale (user vers admin) et horizontale (accès aux ressources d'un autre utilisateur de même niveau). Mitigation : PoLP, MFA, patching des vulnérabilités d'élévation.

**Credential Dumping** -- Extraction de credentials depuis la mémoire du système. L'outil principal est **Mimikatz**, qui cible le processus **LSASS** pour extraire les hashes NTLM et les tickets Kerberos. Autres outils : WCE, LaZagne. Mitigation : protection de LSASS, **Credential Guard** (Windows), limiter les comptes admin.

**Unauthorized Execution** -- Exécution de programmes non autorisés sur l'endpoint. Mitigation : application whitelisting (AppLocker, Gatekeeper), solutions anti-malware.

**Lateral Movement** -- Déplacement d'un système compromis vers d'autres systèmes du réseau (trafic east-west). Mitigation : segmentation réseau, micro-segmentation, PoLP, EDR.

**Defensive Evasion** -- Techniques pour éviter la détection par les outils de sécurité. Mitigation : file integrity monitoring, logging exhaustif, EDR/XDR.

#### Lateral Movement -- techniques détaillées

- **Pass-the-Hash** : authentification avec le hash NTLM sans connaître le mot de passe en clair
- **Pass-the-Ticket** : réutilisation de tickets Kerberos volés
- **Internal Spear-Phishing** : emails envoyés depuis un compte interne compromis pour cibler des collègues
- **Removable Media** : clés USB infectées (cas emblématique : **Stuxnet** en 2010)
- **File-Share Propagation** : déploiement de payloads via les partages réseau (C$, ADMIN$)
- **DNS Tunneling / HTTP C2** : utilisation de protocoles légitimes pour masquer le trafic malveillant
- **WMI (Windows Management Instrumentation)** : exécution de scripts à distance via un framework Windows légitime

**Cas réel -- Target (2013)** : un sous-traitant HVAC compromis a servi de point d'entrée. Par mouvement latéral, les attaquants ont atteint les systèmes de points de vente et volé les données de millions de cartes bancaires.

#### Defensive Evasion -- techniques détaillées

- **Obfuscation** : encodage Base64, packing pour masquer le code malveillant
- **Masquerading** : renommage d'un malware en processus légitime (ex: `svchost.exe`)
- **Disabling Security** : désactivation des outils de sécurité (antivirus, firewall)
- **Code Signing** : utilisation de certificats volés pour signer du code malveillant
- **Timestomping** : modification des horodatages de fichiers pour éviter la détection forensique
- **Process Injection** : injection de code dans un processus légitime (ex: `explorer.exe`)
- **Rootkits** : malware s'installant au niveau noyau ou firmware pour un accès persistant et furtif
- **Living off the Land (LotL)** : utilisation d'outils système légitimes (PowerShell, WMI, PsExec) pour des actions malveillantes, évitant ainsi la détection par signatures

---
---

## OBJECTIF 3.3 -- Troubleshoot Network Infrastructure Security Issues

*Given a Scenario, Troubleshoot Complex Network Infrastructure Security Issues*

### 3.3.1 Misconfigurations réseau

**Configuration Drift** -- Dérive progressive des configurations réseau par rapport au baseline sécurisé. Conséquences : ports ouverts non documentés, services inutiles actifs, protocoles obsolètes réactivés. Solution : outils d'automatisation (Ansible, Puppet, Chef) avec audits réguliers de conformité.

**Routing Errors** -- Routes statiques incorrectes ou protocoles de routage dynamique (BGP, OSPF) mal configurés. Cas réel : **BGP Hijack Amazon Route 53 (2018)** -- redirection du trafic DNS de MyEtherWallet via une annonce BGP frauduleuse, vol de $150K en cryptomonnaies. Solution : **RPKI** (Resource Public Key Infrastructure) pour authentifier les origines de routes.

**RPKI (Resource Public Key Infrastructure)** : framework de sécurité pour BGP. Les **RIRs** (Regional Internet Registries : RIPE, ARIN, APNIC, etc.) émettent des certificats cryptographiques aux opérateurs réseau. Les routeurs vérifient la légitimité de chaque annonce BGP via ces certificats et filtrent les routes invalides.

**Switching Errors** -- VLANs mal configurés ou STP (Spanning Tree Protocol) incorrect, provoquant des broadcast storms ou du trafic inter-segments non souhaité. Solution : **802.1Q tagging** correct, STP/RSTP activé et vérifié, port security (limiter le nombre d'adresses MAC par port).

**Insecure Routing** -- Utilisation de protocoles de routage obsolètes sans authentification (ex: RIPv1). Risque : route poisoning menant à des attaques MitM. Solution : migrer vers **OSPFv3** ou **BGP avec authentification TCP MD5**, chiffrer les mises à jour de routage, monitoring avec Wireshark.

---

### 3.3.2 Erreurs VPN / Tunnel

**Weak/Outdated Encryption** -- DES et 3DES sont vulnérables. Solution : imposer **AES-256** minimum.

**Improper Authentication** -- PSK (Pre-Shared Key) faible ou certificats obsolètes. Solution : PSK forts et uniques par connexion, ou mieux, authentification par certificats. **MFA** pour l'accès VPN.

**Key Management Issues** -- Clés non rotées permettant un accès persistant en cas de compromission. Solution : rotation régulière, **PFS** (Perfect Forward Secrecy) pour générer des clés de session éphémères.

**Split Tunneling Misconfiguration** -- Le split tunneling permet au trafic non-corporate de sortir directement par internet. Si mal configuré, du trafic sensible peut transiter sans protection. Solution : désactiver le split tunneling dans les environnements sensibles.

**Incorrect Tunnel Mode** -- Le **transport mode** ne chiffre que le payload (utilisé pour host-to-host). Le **tunnel mode** chiffre le header ET le payload (utilisé pour site-to-site). Utiliser le mauvais mode expose les en-têtes réseau.

**Cas réel -- Colonial Pipeline (2021)** : un VPN compromis par un mot de passe volé (sans MFA) a permis le déploiement du ransomware DarkSide. Rançon de $4.4M payée ($2.3M récupérés par la suite par le FBI).

---

### 3.3.3 IPS/IDS Issues

**Rule Misconfigurations** -- Règles trop larges (faux positifs excessifs) ou trop strictes (menaces manquées). Solution : audit régulier, outils de validation automatique.

**Lack of Rules** -- Absence de règles pour les menaces récentes. Solution : mises à jour automatiques des signatures (Snort, Suricata), création de règles custom pour l'environnement spécifique.

**False Positives / False Negatives** -- Faux positifs : alertes inutiles menant à l'alert fatigue. Faux négatifs : attaques non détectées. Solution : ML et analyse comportementale, fine-tuning des seuils, signatures personnalisées.

**Mauvais Placement** -- Un IDS/IPS uniquement au périmètre laisse des angles morts pour le trafic interne. Solution : **defense-in-depth** -- déployer au périmètre, entre les VLANs, et devant les serveurs critiques.

---

### 3.3.4 Observabilité

L'observabilité repose sur trois piliers complémentaires :

**Logs** -- Enregistrements détaillés d'événements discrets (firewall, DNS, audit, authentification). Exemple : tentatives de login échouées depuis une IP étrangère.

**Metrics** -- Données quantitatives continues (CPU, bande passante, packet loss, latence). Exemple : pic soudain de CPU pouvant indiquer un DoS ou un cryptominer.

**Traces** -- Suivi du cheminement complet d'une requête à travers les différents systèmes et microservices. Exemple : tracer la source d'une requête suspecte passant par un API gateway, un service d'authentification et une base de données.

Combiner logs + metrics + traces donne une vue complète pour détecter, investiguer et répondre aux incidents.

---

### 3.3.5 Sécurité DNS

**DNSSEC (DNS Security Extensions)** -- Ajoute des signatures numériques aux réponses DNS pour garantir l'authenticité et l'intégrité. À activer sur tous les serveurs DNS autoritatifs, avec rotation régulière des clés de signature.

**DNS Poisoning (Cache Poisoning)** -- Injection de données frauduleuses dans le cache d'un résolveur DNS, redirigeant les utilisateurs vers des sites malveillants. Mitigations : DNSSEC, n'accepter que les réponses des sources autoritatives, limiter le TTL du cache, randomisation des ports source.

**DNS Sinkholing** -- Technique défensive redirigeant le trafic DNS malveillant vers un serveur contrôlé par les défenseurs. Particulièrement efficace contre les malwares utilisant des **DGA** (Domain Generation Algorithms) pour contacter leurs serveurs C2.

**Zone Transfers** -- Mécanisme de réplication de zone DNS entre serveurs. Si non restreint, un attaquant peut télécharger l'intégralité de la zone et cartographier l'infrastructure interne. Solution : restreindre aux IPs autorisées, utiliser **TSIG** (Transaction Signature) pour l'authentification, monitoring des demandes de transfert.

---

### 3.3.6 Sécurité Email

**SPF (Sender Policy Framework)** -- Record DNS TXT spécifiant quels serveurs mail sont autorisés à envoyer pour le domaine. Format : `v=spf1 ip4:192.0.2.0/24 include:spf.mailprovider.com -all`. Le `-all` rejette tout serveur non listé.

**DKIM (DomainKeys Identified Mail)** -- Signature cryptographique ajoutée à l'email par le serveur expéditeur. La clé privée signe, la clé publique (publiée dans le DNS) permet la vérification par le serveur récepteur. Rotation régulière des clés DKIM nécessaire.

**DMARC (Domain-based Message Authentication, Reporting and Conformance)** -- Combine SPF + DKIM et indique au serveur récepteur la conduite à tenir en cas d'échec. Politiques : `p=none` (monitoring seul), `p=quarantine` (envoyer en spam), `p=reject` (bloquer). Le tag `rua=` spécifie l'adresse de réception des rapports agrégés.

Exemple de record DMARC : `v=DMARC1; p=quarantine; pct=100; rua=mailto:jane@pogo.net`

L'ordre logique est : SPF (qui peut envoyer) puis DKIM (message non altéré) puis DMARC (que faire si échec). Mnémonique : **SDD**.

**S/MIME (Secure/Multipurpose Internet Mail Extensions)** -- Chiffrement et signature numérique des emails via certificats X.509. Le chiffrement utilise la clé publique du destinataire. La signature utilise la clé privée de l'expéditeur (assurant la non-repudiation).

---

### 3.3.7 Erreurs TLS

**Certificate Errors** -- Certificats expirés, mal configurés ou révoqués. Solution : gestion automatisée du cycle de vie (Let's Encrypt, Venafi), audit régulier, **CT** (Certificate Transparency) logging pour détecter les certificats frauduleux.

**Cipher Mismatch** -- Client et serveur ne parviennent pas à s'accorder sur un algorithme commun. Solution : désactiver les ciphers faibles (RC4, MD5, DES), imposer **TLS 1.2/1.3** avec AES-GCM ou ChaCha20-Poly1305.

**TLS Versioning** -- TLS 1.0 et 1.1 sont vulnérables (attaques BEAST, POODLE, Heartbleed). Solution : imposer **TLS 1.2** minimum, idéalement **TLS 1.3**, et rejeter toute connexion avec des versions antérieures.

**Outils de test** : **Qualys SSL Labs** (en ligne), **testssl.sh** (outil en ligne de commande).

---

### 3.3.8 PKI Issues

**Certificate Expiration** -- Interruption de service par certificat expiré. Cas réel : lors du shutdown du gouvernement américain (2019), plus de 80 sites .gov sont devenus inaccessibles car leurs certificats ont expiré et le HSTS empêchait de contourner l'avertissement. Solution : gestion automatisée (Let's Encrypt, HashiCorp Vault, Venafi).

**Revoked Certificates** -- Certificat révoqué mais toujours utilisé, permettant un accès non autorisé persistant. Solution : vérification via **OCSP** (Online Certificate Status Protocol) ou **CRLs** (Certificate Revocation Lists).

**Mismatched Key Usage** -- Certificat utilisé pour un usage non prévu (ex: certificat de signature utilisé pour du chiffrement). Solution : vérifier les attributs de Key Usage et Extended Key Usage.

**Weak Key Length** -- Clés RSA inférieures à 2048 bits, ou utilisation de SHA-1/MD5 pour le hashing. Solution : **RSA 2048 bits minimum** ou **ECDSA**, **SHA-256 minimum**.

**Intermediate CA Issues** -- Chaîne de certificats incomplète ou mal configurée empêchant la validation. Solution : installer correctement tous les certificats intermédiaires, vérifier avec OpenSSL ou Qualys SSL Labs.

---

### 3.3.9 Cryptographic Implementation Issues

**Improper Key Management** -- Réutilisation de clés, stockage non sécurisé, absence de rotation. Solution : rotation périodique, stockage dans des HSMs, services cloud (AWS KMS, Azure Key Vault).

**Weak Algorithms** -- Utilisation persistante de DES, 3DES ou RC4. Cas réel : **Sweet32 attack (2016)** exploitant les blocs 64 bits de 3DES via une collision de birthday. Solution : AES-256, ECDSA ou RSA-2048+, audits des librairies crypto.

**Vulnerable Libraries** -- Librairies cryptographiques non patchées. Cas réel : **Heartbleed** (CVE-2014-0160, OpenSSL) permettait de lire la mémoire du serveur. Solution : mises à jour immédiates, scanning automatisé (Nessus, OpenVAS).

**Misimplementation** -- TLS mal configuré, ciphers faibles autorisés, validation de certificats désactivée dans le code. Solution : suivre l'**OWASP TLS Cheat Sheet**, imposer TLS 1.2/1.3, audits de configuration réguliers.

---

### 3.3.10 DoS / DDoS

**DoS** : attaque depuis une source unique. **DDoS** : attaque distribuée depuis de multiples sources (botnets).

**Cas réel -- Dyn (octobre 2016)** : le botnet **Mirai**, composé de centaines de milliers d'appareils IoT compromis (caméras, routeurs avec credentials par défaut), a ciblé le fournisseur DNS Dyn. Résultat : pannes majeures de Twitter, Reddit, Netflix et de nombreux autres services.

**Types d'attaques** : volumétriques (saturation de bande passante), protocolaires (SYN flood, amplification Memcached), applicatives (HTTP flood, Slowloris).

**Mitigations** : services anti-DDoS (Cloudflare, Akamai, AWS Shield), rate limiting, traffic shaping, geofencing, anycast routing.

---

### 3.3.11 Resource Exhaustion

**Slowloris** : attaque qui envoie des requêtes HTTP partielles très lentement, maintenant les connexions ouvertes et épuisant les ressources du serveur sans générer de trafic volumétrique significatif.

**Mitigations** : rate limiting, **WAF** (Web Application Firewall), load balancing, monitoring des métriques (CPU, mémoire, connexions actives), **auto-scaling** (AWS Auto Scaling, Azure VM Scale Sets).

---

### 3.3.12 Network ACL Issues

Les ACLs (Access Control Lists) réseau définissent les règles de filtrage du trafic sur les routeurs, switches et firewalls.

**Problème** : ACLs mal configurées entraînent soit un accès non autorisé (trop permissif), soit le blocage de trafic légitime (trop restrictif).

**Best practices** : audits réguliers, PoLP (autoriser uniquement le nécessaire, bloquer tout le reste par défaut -- approche deny-all), logging et monitoring du trafic, outils de gestion centralisée (Juniper Security Director), documentation exhaustive, pentests réguliers.

---
---

## OBJECTIF 3.4 -- Implement Hardware Security Technologies and Techniques

*Given a Scenario, Implement Hardware Security Technologies and Techniques*

### 3.4.1 Roots of Trust (RoT)

**Définition** : ensemble de fonctions matérielles dans un appareil qui sont toujours considérées comme fiables par l'OS. C'est le point de départ de la **chaîne de confiance** (chain of trust) -- si le RoT est compromis, aucune couche supérieure ne peut être considérée comme sûre.

**Impact sur la disponibilité** : si le RoT échoue ou est corrompu, le système peut devenir totalement inaccessible.

**Résilience** : architectures **dual-image** (image firmware primaire + image de récupération) pour permettre un rollback en cas de corruption.

---

#### TPM (Trusted Platform Module)

Puce cryptographique (intégrée ou pluggable sur la carte mère) dédiée au stockage sécurisé de clés et aux opérations cryptographiques.

**Fonctionnement** : le TPM stocke des mesures (hashes) dans des registres appelés **PCRs** (Platform Configuration Registers). Ces mesures représentent l'état du système au moment du boot et permettent l'attestation de l'intégrité.

**Protection** : contre les attaques physiques (cold boot attacks, vol de disque). Les clés stockées dans le TPM ne sont jamais exposées à l'OS ou à un attaquant logiciel.

**Risque** : si le TPM est corrompu ou réinitialisé, les clés deviennent inaccessibles, bloquant des services comme BitLocker.

**Recovery** : backup des clés hors du TPM est essentiel. Exemple : stockage de la clé de récupération BitLocker (48 caractères) dans Active Directory ou Entra ID.

---

#### HSM (Hardware Security Module)

Appareil dédié (network-attached, PCIe, USB ou SD card) à la gestion sécurisée des clés cryptographiques et aux opérations de chiffrement/déchiffrement.

**Certifications** : **FIPS 140-2** et **FIPS 140-3** (niveaux 1 à 4, où le niveau 3 exige la tamper-evidence et le niveau 4 exige la tamper-response).

**Cloud** : AWS CloudHSM, Azure Dedicated HSM, Google Cloud HSM (FIPS 140-3 Level 3).

**Résilience** : déployer en **clusters haute disponibilité** avec load balancing et failover automatique.

**Différence TPM vs HSM** : le TPM est intégré à un appareil spécifique et protège ce seul appareil. Le HSM est un service partagé, souvent en réseau, qui gère les clés pour de multiples systèmes et applications.

---

#### vTPM (Virtual Trusted Platform Module)

Émulation logicielle du TPM pour les environnements virtualisés, permettant aux VMs de bénéficier des fonctionnalités du TPM (Secure Boot, chiffrement de disque, attestation).

**Dépendance critique** : la sécurité du vTPM repose entièrement sur l'hyperviseur. Si l'hyperviseur est compromis, toutes les VMs et leurs vTPMs le sont aussi.

**Technologies de virtualisation sécurisée** :
- **Intel TXT** (Trusted Execution Technology) : vérification d'intégrité du système au boot via des mesures hardware
- **AMD SVM** (Secure Virtual Machine) : virtualisation hardware-assisted avec isolation VM
- **AWS Nitro** : architecture hyperviseur propriétaire avec puce de sécurité dédiée pour EC2, isolation multi-tenant, support BYOK et Nitro Enclaves
- **AMD SEV** (Secure Encrypted Virtualization) : chiffrement de la mémoire des VMs. Variantes : SEV-ES (chiffrement des registres), **SEV-SNP** (intégrité renforcée) -- fondement du **confidential computing**

---

### 3.4.2 Security Coprocessors

#### CPU Security Extensions

**Intel SGX (Software Guard Extensions)** -- Crée des **enclaves** mémoire isolées où le code et les données sont protégés, même contre l'OS, l'hyperviseur et les debuggers. Impact performance : 5-15% de dégradation pour les applications SGX.

**AMD SEV** -- Chiffrement de la mémoire des VMs, empêchant même l'hyperviseur de lire les données en clair.

**Vulnérabilités hardware** : **Spectre** et **Meltdown** (2018) exploitent l'exécution spéculative des CPUs modernes pour accéder à des zones mémoire normalement protégées.

#### Secure Enclave

Zone matériellement protégée où les données sensibles sont traitées en isolation complète. Inaccessible même à l'OS, aux hyperviseurs, aux debuggers et aux malwares. La mémoire de l'enclave est chiffrée et protégée en intégrité directement par le CPU.

Crée un **TEE** (Trusted Execution Environment). Exemples : Intel SGX (serveurs), **Apple Secure Enclave** (données biométriques Face ID/Touch ID).

Cas d'usage : stockage de clés cryptographiques, données biométriques, informations financières, traitement confidentiel en cloud (confidential computing).

---

### 3.4.3 Virtual Hardware

Émulation de composants physiques par l'hyperviseur : **vCPUs**, **vRAM**, **vDisks**, **vNICs** (cartes réseau virtuelles).

**Avantages** : utilisation optimale des ressources physiques, scalabilité rapide, provisioning en minutes.

**Risque principal** : compromission de l'hyperviseur = contrôle de toutes les VMs hébergées.

**VM Escape Attack -- VENOM (CVE-2015-3456)** : vulnérabilité dans le contrôleur de disquette virtuelle QEMU. Un buffer overflow permettait à un attaquant de s'évader de la VM vers le système hôte. Affectait Xen, KVM, VirtualBox. Mitigation : patcher QEMU, désactiver le hardware virtuel inutilisé.

**Overcommit** : allocation de plus de vRAM que la mémoire physique disponible. Fonctionne tant que toutes les VMs ne consomment pas simultanément leur allocation complète ; sinon, dégradation sévère.

**Haute disponibilité** : migration automatique des VMs (live migration) en cas de panne hardware.

---

### 3.4.4 Host-Based Encryption -- BitLocker

Chiffrement complet du disque implémenté au niveau de l'OS (Windows).

**Mécanisme** : le hash du processus de boot est stocké dans les PCRs du TPM. Au démarrage, si les mesures correspondent (intégrité vérifiée), le TPM libère la clé de déchiffrement. Si une modification est détectée (boot altéré, hardware changé), BitLocker verrouille le système et exige la recovery key.

**Algorithme par défaut** : **XTS-AES-128**, accéléré par les instructions CPU **AES-NI**.

---

### 3.4.5 Self-Encrypting Drive (SED)

Disque qui chiffre automatiquement toutes les données écrites, en hardware.

**Performance** : overhead quasi nul car le chiffrement est géré par des **ASICs** dédiés dans le disque, pas par le CPU.

**Sécurité des clés** : les clés de chiffrement sont générées et stockées à l'intérieur du disque, jamais exposées à l'OS. L'authentification (mot de passe ou token) est requise au boot pour déverrouiller.

**SED vs BitLocker** : le SED opère au niveau hardware (plus performant, clés mieux protégées physiquement) ; BitLocker opère au niveau software (plus facile à gérer à grande échelle via Active Directory, plus flexible).

**Limitation** : le SED ne protège pas contre les menaces en cours d'exécution (malware, RAT ayant accès au système déverrouillé).

---

### 3.4.6 Secure Boot

Fonctionnalité **UEFI** (successeur du BIOS) qui vérifie les signatures numériques de chaque composant chargé au démarrage : firmware, bootloader, drivers, OS. Si un composant n'est pas signé ou a été altéré, le boot est **refusé**.

**Chaîne de confiance Secure Boot** :

| Composant | Rôle |
|-----------|------|
| **PK** (Platform Key) | Root of Trust du Secure Boot, installé par l'OEM ou l'administrateur. Il n'en existe qu'un seul. |
| **KEK** (Key Exchange Key) | Liste de clés autorisées à modifier DB et DBX (ex: Microsoft, Red Hat) |
| **DB** (Signature Database) | **Allow list** : signatures et hashes des composants de confiance autorisés à s'exécuter |
| **DBX** (Revocation Database) | **Deny list** : signatures et hashes révoqués, interdits d'exécution |

Mnémonique : **PK > KEK > DB + DBX** = "PKDD"

---

### 3.4.7 Measured Boot

Extension de Secure Boot qui enregistre les mesures cryptographiques (hashes) de chaque composant chargé pendant le boot, sans bloquer.

**Fonctionnement** : chaque mesure est stockée dans les **PCRs** du TPM. Les hashes sont chaînés : hash(firmware) + hash(bootloader) = hash intermédiaire 1, hash intermédiaire 1 + hash(kernel) = hash intermédiaire 2, etc.

**Utilité** : permet la **remote attestation** -- un serveur distant peut vérifier l'intégrité de la chaîne de boot d'un appareil. Détecte les APTs et rootkits qui modifient le bootloader ou le kernel.

**Différence clé avec Secure Boot** : Secure Boot *bloque* le boot si la vérification échoue. Measured Boot *enregistre* les mesures et permet la vérification a posteriori sans bloquer.

---

### 3.4.8 Self-Healing Hardware

Systèmes dotés de mécanismes intégrés pour détecter, récupérer et atténuer les pannes automatiquement.

**Mécanismes** : failover vers des systèmes redondants, rollback vers un état connu (firmware golden image), patching et recovery automatisés.

**Protection** : contre les attaques firmware persistantes (rootkits UEFI qui survivent aux réinstallations d'OS).

**Standard de référence** : **NIST SP 800-193** (Platform Firmware Resiliency Guidelines).

---

### 3.4.9 Tamper Detection and Countermeasures

Capteurs physiques intégrés au hardware qui détectent les tentatives d'ouverture, de modification ou d'accès non autorisé.

**Réponses possibles** : déclenchement d'alarmes, logging de l'événement, shutdown automatique, **zeroization** (effacement immédiat des données sensibles et des clés cryptographiques).

**Certification** : **FIPS 140-3 Level 3** exige la tamper-evidence (preuve de tentative). **FIPS 140-3 Level 4** exige la tamper-response automatique (zeroization).

---

### 3.4.10 Threat Actor TTPs -- Hardware

**Firmware Tampering** -- Modification malveillante du BIOS/UEFI pour installer des rootkits ou backdoors persistants qui survivent aux réinstallations d'OS. Cas réel : **LoJax (2018)**, premier rootkit UEFI détecté en environnement réel, ciblant la mémoire SPI flash. Mitigation : mises à jour firmware, vérification d'intégrité, Secure Boot.

**Shimming** -- Insertion de code ou de hardware malveillant entre deux couches (logicielle ou matérielle). Exemple : un shim hardware placé entre un terminal point de vente (POS) et le lecteur de carte pour capturer les données magnétiques (Track 1 et Track 2). Mitigation : inspection physique régulière, détection de comportement anormal.

**USB-based Attacks** -- Clés USB malveillantes contenant du malware, des keyloggers ou simulant un clavier (HID attack). Cas réels : **Stuxnet (2010)** via USB sur des systèmes SCADA air-gapped ; **Hak5 Rubber Ducky** (outil simulant un clavier pour injecter des commandes). Mitigation : désactiver les ports USB non utilisés, endpoint protection, éducation des employés.

**BIOS/UEFI Attacks** -- Modification du firmware pour injecter du malware pré-OS, assurant une persistance extrêmement difficile à détecter et à éliminer. Mitigation : Secure Boot activé, firmware signé cryptographiquement, mises à jour régulières.

**Memory-based Attacks** -- Exploitation de la mémoire volatile : buffer overflow, process injection, DLL injection, fileless malware (PowerShell, WMI). Mitigation : **DEP** (Data Execution Prevention), **ASLR** (Address Space Layout Randomization), patching, application whitelisting, EDR/XDR.

**EMI (Electromagnetic Interference)** -- Signaux électromagnétiques parasites perturbant les systèmes électroniques, pouvant affecter les ICS et les équipements médicaux. Mitigation : câbles blindés, twisted-pair, shielding des équipements.

**EMP (Electromagnetic Pulse)** -- Impulsion électromagnétique de haute intensité (origine solaire ou artificielle) capable de détruire l'électronique. Mitigation : blindage EMP (cage de Faraday), protection contre les surtensions.

---
---

## OBJECTIF 3.5 -- Secure Specialized and Legacy Systems

*Given a Set of Requirements, Secure Specialized and Legacy Systems Against Threats*

### 3.5.1 Operational Technology (OT)

**Définition** : ensemble des systèmes hardware et software utilisés pour surveiller, contrôler et gérer des opérations industrielles physiques.

**Secteurs** : manufacturing, énergie, transport, utilities (eau, gaz, électricité), infrastructure critique.

**IT/OT Convergence** : les systèmes OT, historiquement isolés (air-gapped), sont de plus en plus interconnectés avec les réseaux IT pour la collecte de données et l'optimisation. Cette convergence expose les systèmes OT aux cybermenaces IT sans que leurs protections soient adaptées.

---

#### SCADA (Supervisory Control and Data Acquisition)

Architecture de contrôle industriel composée de trois éléments :

| Composant | Rôle |
|-----------|------|
| **Supervisory Computers** | Communiquent avec les PLCs et agrègent les données |
| **HMI** (Human-Machine Interface) | Interface graphique permettant aux opérateurs de surveiller et contrôler l'ICS |
| **PLCs** (Programmable Logic Controllers) | Hardware spécialisé recevant la télémétrie des capteurs et actionneurs (pompes, valves, moteurs) |

**Flux de données** : les données remontent (équipement physique -> PLC -> ordinateur superviseur -> HMI) et les commandes descendent (HMI -> PLC -> équipement physique).

---

#### PLCs (Programmable Logic Controllers)

Contrôleurs programmables exécutant des OS embarqués spécialisés (pas d'OS commercial) avec traitement temps réel. Dotés de hardware roots-of-trust (bootloaders sécurisés, firmware signé). Le premier PLC historique : Modicon 084 (General Motors, 1968).

#### Operational Historian

Système de logging industriel collectant les données depuis les capteurs et PLCs pour analyse temps réel et historique. Composants : data collectors, server software, client applications.

#### Ladder Logic

Langage de programmation graphique pour PLCs, basé sur la logique de relais électriques. Traitement séquentiel : **haut en bas, gauche à droite** (comme les barreaux d'une échelle). Si tous les inputs d'une ligne sont TRUE, l'output est TRUE.

#### HVAC (Heating, Ventilation, Air Conditioning)

Contrôlé par des **BAS** (Building Automation Systems) ou **BMS** (Building Management Systems). Risques de sécurité : accès non autorisé au BAS, utilisation comme point d'entrée réseau, mouvement latéral vers les systèmes IT. Best practice : segmentation réseau stricte, contrôles d'accès physiques.

---

### 3.5.2 IoT (Internet of Things)

Capteurs, logiciels et technologies connectés collectant et transmettant des données automatiquement.

**Défis sécurité** : puissance de traitement limitée (chiffrement souvent absent ou faible), absence de protocoles de sécurité standardisés, mises à jour difficiles, credentials par défaut, déploiement massif rendant la gestion complexe.

**Standards** : **ETSI EN 303 645** (Cyber Security for Consumer IoT), **OWASP IoT Top 10**.

---

### 3.5.3 SoC (System-on-Chip)

Puce unique intégrant CPU, mémoire, stockage et I/O. Exemples : Qualcomm Snapdragon, TI AM335x, Broadcom BCM (Raspberry Pi).

**Limitations de sécurité** : puissance de traitement insuffisante pour un chiffrement robuste, credentials hardcodés ou mots de passe par défaut, mémoire souvent non chiffrée, firmware vulnérable sans mécanisme de mise à jour sécurisé, risques supply chain (backdoors matérielles), susceptibilité aux attaques physiques et side-channel, souvent pas de Secure Boot ni d'isolation de processus.

---

### 3.5.4 Embedded Systems

Systèmes combinant hardware et software dédiés à un processus opérationnel spécifique. Utilisés dans les centrales électriques, le traitement de l'eau, le transport. Certains systèmes en production ont 50+ ans, écrits en code machine bas niveau.

**FPGAs (Field-Programmable Gate Arrays)** -- Circuits intégrés reconfigurables par l'utilisateur final. Risque : reprogrammation malveillante. Cas réel : **Starbleed** (septembre 2019), vulnérabilité dans les Xilinx 7 Series permettant la création de backdoors, la reprogrammation et potentiellement des dommages physiques.

Statistique importante : environ **70% des attaques contre les systèmes embedded/ICS** sont exécutables à distance sans authentification.

---

### 3.5.5 Technologies sans fil / RF dans l'OT

| Technologie | Fréquence | Débit | Portée | Chiffrement | Usage typique |
|-------------|-----------|-------|--------|-------------|---------------|
| **Wi-Fi** (802.11) | 2.4/5/6 GHz | Jusqu'à 9.6 Gbps (Wi-Fi 6) | Variable | **WPA3** (DH + AES-256), Enterprise : 802.1X/EAP-TLS | Données temps réel, monitoring |
| **Zigbee** (802.15.4) | 2.4 GHz / 868/915 MHz | 250 Kbps | 10-100m (mesh) | AES-128 | Capteurs, domotique, automation industrielle |
| **Bluetooth / BLE** | 2.4 GHz | Jusqu'à 3 Mbps | 10-100m | AES-128, SSP | Monitoring équipement, wearables |
| **LoRa** | ISM bands (868/915/433 MHz) | 0.3-50 Kbps | Jusqu'à 15 km | AES-128 | Monitoring distant, IoT longue portée |
| **Cellular** (4G/5G) | 700 MHz - 39 GHz | Très élevé (5G) | Jusqu'à 35 km | AES (LTE), auth renforcée (5G) | Assets distants, robotique, véhicules |
| **RFID** | 125 kHz - 960 MHz | -- | 10cm - 10m | Variable | Asset tracking, inventaire, contrôle d'accès |
| **WirelessHART** | 2.4 GHz (802.15.4) | 250 Kbps | 50-100m (mesh) | **AES-128 E2E** | Automation industrielle (chimie, raffineries) |
| **ISA100.11a** | 2.4 GHz | -- | Variable (mesh) | AES-128 | Automation industrielle, contrôle de processus |

---

### 3.5.6 Mesures de sécurité OT/SCADA/ICS

| Mesure | Description |
|--------|-------------|
| **Segmentation** | VLANs, firewalls, micro-segmentation, DMZ interne, gateways dédiés entre réseaux IT et SCADA |
| **Monitoring** | IDS/IPS, monitoring RF, SIEM, surveillance physique |
| **Aggregation** | Centralisation des logs, metrics et alertes dans un SIEM avec normalisation des données |
| **Hardening** | Suppression des credentials par défaut, fermeture des ports/services inutiles, whitelisting, Secure Boot |
| **Data Analytics** | ML pour la détection d'anomalies, analytics prédictifs pour anticiper les pannes |
| **Environmental** | Blindage EMI, contrôle climatique, accès physique contrôlé |
| **Compliance** | NIST SP 800-82, IEC 62443, GDPR -- audits réguliers |

#### Safety Considerations

**SIS (Safety Instrumented System)** -- Système failsafe indépendant du PCN (Process Control Network) qui arrête automatiquement un processus si des conditions critiques sont détectées. Exemples d'actions : ouverture d'une valve de sécurité, activation de la suppression incendie.

Standards : **ISA-84** (US), **IEC-61511** (Europe/international).

---

### 3.5.7 Défis par industrie

| Industrie | Menaces principales | Régulations / Standards |
|-----------|--------------------|-----------------------|
| **Utilities** | Attaques SCADA/ICS, ransomware, nation-state actors | **NERC CIP**, NIST SP 800-82, EU NIS Directive, ISO/IEC 27019 |
| **Transportation** | IoT compromis (véhicules autonomes, feux), GPS spoofing, ransomware | EU Aviation Cyber Regulation, **ISO/SAE 21434** (automotive), CISA Transport Plan |
| **Healthcare** | Vol de PHI, ransomware (retard des soins), IoT médical compromis | **HIPAA**, GDPR, **ISO/IEC 27799**, FDA Cybersecurity Guidance for Medical Devices |
| **Manufacturing** | Ransomware, vol de propriété intellectuelle, disruption OT | NIST SP 800-82, **ISA/IEC 62443**, **CMMC** |
| **Financial Services** | Ransomware, fraude, insider threats | **PCI DSS**, **SOX**, **GLBA**, **23 NYCRR 500** (NYDFS) |
| **Government/Defense** | Cyber espionage (APT), supply chain attacks, infrastructure critique | NIST SP 800-53, **FISMA**, CMMC, ISO 27001/27002, **ITAR**, EU Cybersecurity Act |

---

### 3.5.8 Caractéristiques des systèmes spécialisés et legacy

| Caractéristique | Description | Workaround |
|----------------|-------------|------------|
| **Unable to Secure** | Pas de chiffrement natif, pas d'authentification, protocoles non sécurisés (Modbus, OPC Classic, DNP3 legacy) | Segmentation réseau, tunnels VPN, secure gateways |
| **Obsolete** | Durée de vie 20-30+ ans, incompatibles avec les solutions modernes | Compensating controls, **phased modernization roadmap** |
| **Unsupported** | Plus de patches ni de support du fabricant, vulnérables aux zero-day | Isolation réseau stricte, IDS dédié, contrôle d'accès renforcé |
| **Highly Constrained** | Ressources limitées (mémoire, CPU, stockage) empêchant l'exécution de solutions de sécurité modernes | Contrôles basés sur le réseau (firewalls périmètre, IDS externe) plutôt que sur l'appareil |

---
---

## OBJECTIF 3.6 -- Use Automation to Secure the Enterprise

*Given a Scenario, Use Automation to Secure the Enterprise*

### 3.6.1 Scripting

| Langage | Environnement | Cas d'usage sécurité |
|---------|---------------|---------------------|
| **PowerShell** | Windows (+ Linux/macOS via PowerShell Core) | Gestion AD, group policies, threat hunting, audit de permissions |
| **Bash** | Unix/Linux/macOS (+ Windows via WSL) | Rotation de logs, mises à jour de sécurité, backups, configuration firewall |
| **Python** | Cross-platform | Incident response, parsing de logs, intégration API SIEM/IDS, analyse comportementale |

**Avantages de l'automatisation** : élimination des erreurs humaines répétitives, scalabilité, monitoring continu, intégration avec les outils de sécurité existants.

---

### 3.6.2 Cron / Scheduled Tasks

**Linux -- `cron`** : planificateur de tâches récurrentes. Format : `minute heure jour_du_mois mois jour_de_semaine commande`. Exemple : `0 2 * * * /usr/bin/rsync -a /home /backup/home` (backup quotidien à 2h). Commandes : `crontab -l` (lister les tâches de l'utilisateur courant), `sudo crontab -u username -l` (tâches d'un utilisateur spécifique).

**Windows -- Task Scheduler / PowerShell** : tâches planifiées. Commande : `Get-ScheduledTask` pour lister les tâches existantes. Point d'attention sécurité : les attaquants utilisent souvent les tâches planifiées comme mécanisme de **persistence**.

---

### 3.6.3 Event-Based Triggers

Actions automatiques déclenchées par des événements spécifiques (failed logins, escalade de privilèges, changements de configuration non autorisés).

Exemples : **Windows Event Viewer** pour détecter les tentatives de brute force et verrouiller automatiquement le compte ; **Incron** (Linux) pour surveiller les modifications de fichiers critiques en temps réel.

Prérequis : logging robuste et audit trails fiables pour éviter les faux positifs et les déclenchements intempestifs.

---

### 3.6.4 Infrastructure as Code (IaC)

**Définition** : déploiement et gestion de l'infrastructure via des fichiers de configuration versionnnés, remplaçant la configuration manuelle.

**Outils** : **Terraform** (multi-cloud), **Ansible** (configuration management + IaC), **AWS CloudFormation** (AWS-native).

**Avantages sécurité** : configurations prédéfinies et standardisées, réduction des erreurs humaines, disaster recovery rapide (re-déploiement à l'identique), auditabilité via le version control.

**Best practices** : stocker les configurations dans des repos Git avec version control, restreindre l'accès au code IaC, effectuer des security checks statiques sur les configurations, ne **jamais hard-coder** de secrets (API keys, mots de passe) -- utiliser un secrets vault (HashiCorp Vault, AWS Secrets Manager).

---

### 3.6.5 Configuration Files -- Formats

| Format | Caractéristiques | Usage typique | Risque sécurité |
|--------|-----------------|---------------|-----------------|
| **YAML** | Human-readable, basé sur l'indentation | Kubernetes manifests, Ansible playbooks | Erreurs d'indentation silencieuses |
| **XML** | Hiérarchique, verbeux, très structuré | WAF rules, policies de sécurité, web services | Vulnérable aux attaques **XXE** (XML External Entity) |
| **JSON** | Léger, paires clé-valeur, idéal pour les API | AWS IAM policies, REST API configs | Injection si non validé |
| **TOML** | Simple, peu d'erreurs de syntaxe | Configs d'applications, conteneurs | -- |

**Exemple Kubernetes YAML -- Security Context** :
- `resources.limits` (memory/cpu) : prévient le DoS par consommation excessive
- `runAsUser: 1000` / `runAsGroup: 3000` : conteneur non-root
- `readOnlyRootFilesystem: true` : empêche l'écriture sur le filesystem root
- `allowPrivilegeEscalation: false` : bloque l'escalade de privilèges

**Exemple JSON -- AWS IAM Policy** (read-only S3) : `Effect: Allow`, `Action: s3:GetObject, s3:ListBucket`, Resource limitée au bucket spécifique. Illustration du **Least Privilege**.

---

### 3.6.6 Cloud APIs / SDKs

| Plateforme | Outil | Fonction |
|-----------|-------|---------|
| **AWS** | Boto3 (Python SDK) | Création automatisée de ressources avec policies de sécurité intégrées |
| **GCP** | Cloud Functions API | Fonctions serverless déclenchées par événements (ex: monitoring accès DB) |
| **Webhooks** | Push model (HTTP POST) | Notifications temps réel (ex: SIEM déclenche un webhook vers Teams/Slack lors d'une alerte) |

**Fonctionnement d'un Webhook** :
1. Configuration : le développeur définit un événement déclencheur et une URL cible
2. Trigger : l'événement se produit dans le système source
3. Send : un payload (JSON ou XML) est envoyé via HTTP POST à l'URL cible
4. Process : l'application réceptrice traite le payload et exécute les actions appropriées

---

### 3.6.7 Generative AI en sécurité

**Outils d'assistance au code** : GitHub Copilot (OpenAI Codex/GPT), Tabnine, IntelliCode (Microsoft Visual Studio). **Documentation automatique** : ChatGPT/Bard pour la génération de documentation, Doxygen avec plugins AI.

**Risque majeur** : ne jamais soumettre de code propriétaire ou sensible à des endpoints AI publics (risque de fuite de propriété intellectuelle).

**Best practice** : toujours revoir, tester et analyser le code généré par l'IA avant de l'intégrer. L'IA peut introduire des vulnérabilités subtiles ou des dépendances non vérifiées.

---

### 3.6.8 Containerization

Isolation des applications avec leurs dépendances dans des conteneurs (Docker, Kubernetes).

**Avantage sécurité** : une vulnérabilité exploitée dans un conteneur reste (en théorie) confinée à ce conteneur, sans affecter l'hôte ni les autres conteneurs.

**Best practices** : maintenir les images de base à jour, scanner les images pour les vulnérabilités (Trivy, Snyk), segmentation réseau entre conteneurs, exécution en mode non-root.

---

### 3.6.9 Automated Patching

**Outils** : Microsoft Endpoint Configuration Manager (+ WSUS), Ansible, Chef.

**Deployment Rings** : déploiement progressif : pilot group (early adopters) -> groupes de plus en plus larges. Permet de valider le patch avant un déploiement généralisé.

**ADRs (Automatic Deployment Rules)** : règles définissant le téléchargement et le déploiement automatiques des patches basés sur des critères (sévérité, produit, date).

**Patch Tuesday** : cycle de mises à jour Microsoft, le 2ème mardi de chaque mois. **Out-of-band updates** : patches critiques hors cycle pour les vulnérabilités zero-day activement exploitées.

---

### 3.6.10 Auto-Containment

Isolation automatique des processus ou applications potentiellement dangereux dans un environnement sandboxé.

**Valeur ajoutée** : défense supplémentaire contre les zero-day qui contournent l'antivirus. Permet d'observer le comportement du malware dans un environnement contrôlé avant de prendre une décision (bloquer ou autoriser).

**Exemples EDR avec auto-containment** : Sophos Intercept X, CrowdStrike Falcon Insight.

---

### 3.6.11 SOAR (Security Orchestration, Automation, and Response)

**Trois piliers** (mnémonique : **OAR**) :

**Security Orchestration** -- Intégration des outils de sécurité disparates (SIEM, threat intelligence, EDR, firewalls, ticketing) dans une plateforme unifiée. Permet aux outils de communiquer et d'agir de concert.

**Security Automation** -- Scripts et workflows automatisés pour les tâches répétitives : collecte de threat intelligence, scans, mise à jour de règles firewall, blocage automatique d'IPs malveillantes.

**Incident Response** -- Actions structurées pour traiter les incidents : confinement, remédiation, récupération, documentation. Exécutées via des **playbooks** prédéfinis.

**Éléments clés du SOAR** :
- **Playbooks** : guides de haut niveau pour des scénarios spécifiques (phishing, malware, breach). Décrivent le workflow global.
- **Runbooks** : guides techniques détaillés avec des étapes exactes et reproductibles. Sous-ensemble exécutable du playbook.
- **Case Management** : organisation, suivi et documentation centralisée des incidents.
- **Threat Intelligence** : intégration de feeds externes, enrichissement des alertes avec des IoCs, corrélation.
- **Reporting/Analytics** : métriques clés comme le **MTTD** (Mean Time To Detect) et le **MTTR** (Mean Time To Respond).
- **Automated Decision-Making** : logique pré-configurée et ML pour évaluer la sévérité et déclencher les actions appropriées.

**Best practice** : traiter les playbooks et runbooks comme du code -- gestion dans Git, peer reviews, versioning.

**Exemples** : Fortinet FortiSOAR, Palo Alto Cortex XSOAR.

---

### 3.6.12 Vulnerability Scanning

**Types de scans** :

| Type | Description |
|------|-------------|
| **Credentialed** | Scan avec des credentials admin : rapport détaillé (versions logiciel, services, vulnérabilités registry, patch levels) |
| **Non-Credentialed** | Scan anonyme (perspective attaquant) : moins de détails. Exemple : Nmap |
| **Agent-based** | Agent installé sur l'endpoint, résultats poussés vers la console centrale (pull technology) |
| **Server-based (agentless)** | Le serveur de scan pousse les requêtes vers les endpoints via le réseau |
| **Active** | Interaction directe avec les endpoints : plus précis mais plus intrusif |
| **Passive** | Analyse du trafic réseau via port SPAN/mirror : non intrusif (important pour OT) mais moins précis |

**Criticality Ranking** : priorisation des remédiations par score CVSS. Traiter les vulnérabilités critiques en premier.

**Outil principal** : **Tenable Nessus** (Nessus Essentials = 16 hosts gratuits pour les labs).

**Best practice** : créer un **compte de service dédié** pour le scanner (pas un compte admin personnel), stocker ses credentials dans un vault, effectuer une rotation régulière.

---

### 3.6.13 SCAP (Security Content Automation Protocol)

Framework développé par le **NIST** pour automatiser l'évaluation et l'enforcement des configurations de sécurité. Formats machine-readable, évaluation continue. Utilisé par le **DoD** (Department of Defense), conforme **FISMA**.

**Cinq composants** (mnémonique : **XOCCC**) :

| Composant | Description |
|-----------|-------------|
| **XCCDF** (Extensible Configuration Checklist Description Format) | Format XML de checklists de configuration. Dans le contexte DoD, ces checklists sont appelées **STIGs** (Secure Technical Implementation Guides) |
| **OVAL** (Open Vulnerability and Assessment Language) | Langage standardisé pour évaluer les vulnérabilités et les configurations. Traite les exigences définies en XCCDF |
| **CPE** (Common Platform Enumeration) | Identifie de manière unique les OS, appareils et applications. Permet de cibler les bons plugins de scan |
| **CVE** (Common Vulnerabilities and Exposures) | Système de nommage standardisé des vulnérabilités. Format : `CVE-[ANNÉE]-[NUMÉRO]` (ex: CVE-2021-34527 = PrintNightmare) |
| **CVSS** (Common Vulnerability Scoring System) | Scoring de sévérité des vulnérabilités de 0.0 à 10.0. Version actuelle : **4.0** |

**CVSS Base Metrics** :

| Métrique | Valeurs possibles |
|----------|-------------------|
| **Attack Vector (AV)** | Network, Adjacent, Local, Physical |
| **Attack Complexity (AC)** | Low, High |
| **Privileges Required (PR)** | None, Low, High |
| **User Interaction (UI)** | None, Required |
| **Confidentiality (VC)** | None, Low, High |
| **Integrity (VI)** | None, Low, High |
| **Availability (VA)** | None, Low, High |
| **Subsequent C/I/A (SC/SI/SA)** | None, Low, High |

**CVSS Threat Metrics** :

| Métrique | Valeurs |
|----------|---------|
| **Exploit Maturity (E)** | Not Defined, Unproven, PoC, Functional, High |
| **Remediation Level (RL)** | Not Defined, Official Fix, Temporary Fix, Workaround, Unavailable |
| **Confidence (C)** | Not Defined, Unknown, Reasonable, Confirmed |

---

### 3.6.14 Workflow Automation

**Automated Incident Response** : IDS/EDR détecte une menace -> isolement automatique de l'endpoint -> blocage de l'IP source -> notification de l'équipe SOC -> création de ticket dans le SIEM.

**Automated Threat Intelligence** : intégration automatique de feeds -> tagging, priorisation et enrichissement des alertes avec les IoCs correspondants.

**Vulnerability Management** : scanner détecte une vulnérabilité -> ticket automatiquement ouvert -> assignation au responsable -> déploiement du patch.

---
---

## OBJECTIF 3.7 -- Advanced Cryptographic Concepts

*Explain the Importance of Advanced Cryptographic Concepts*

### 3.7.1 Post-Quantum Cryptography (PQC)

**Contexte** : les ordinateurs quantiques utilisent des **qubits** exploitant la superposition et l'intrication (entanglement) pour effectuer certains calculs exponentiellement plus vite que les ordinateurs classiques.

**La menace** : l'algorithme de **Shor** peut casser les systèmes basés sur la factorisation (RSA) et le logarithme discret (DH, ECC) en temps polynomial, rendant ces algorithmes inutiles face à un ordinateur quantique suffisamment puissant.

**État actuel de la technologie quantique** :
- Environ 1000 qubits maximum (IBM Condor = 1121 qubits)
- Estimation pour casser RSA 2048 bits : ~20 millions de qubits
- Estimation pour casser SHA-256 : ~1 million de qubits
- Google Willow (décembre 2024) : calcul en 5 minutes qui prendrait 10^25 ans sur un ordinateur classique

**Familles d'algorithmes résistants aux quantiques** :

| Type | Principe de sécurité |
|------|---------------------|
| **Lattice-based** | Complexité de trouver le vecteur le plus court dans un treillis de haute dimension |
| **Hash-based** | Fonctions de hachage résistantes aux attaques classiques et quantiques |
| **Code-based** | Codes correcteurs d'erreurs dont le décodage est difficile pour les ordinateurs quantiques |

**Standards NIST PQC (publiés en août 2024)** :

| Standard | Nom | Type |
|----------|-----|------|
| **FIPS 203** | ML-KEM (CRYSTALS-KYBER) | Key Encapsulation Mechanism |
| **FIPS 204** | ML-DSA (CRYSTALS-DILITHIUM) | Digital Signature |
| **FIPS 205** | SLH-DSA (SPHINCS+) | Stateless Hash-Based Digital Signature |

Mnémonique : FIPS **203** (KEM), **204** (Signature), **205** (Hash-Based Signature).

**Implémentations actuelles** : Chrome et Edge supportent **Kyber/ML-KEM** pour le key exchange dans TLS 1.3.

---

### 3.7.2 Key Stretching

Technique pour renforcer des clés ou mots de passe faibles en les passant à travers un algorithme coûteux en calcul, produisant une clé dérivée beaucoup plus résistante.

**Algorithmes** : **PBKDF2** (Password-Based Key Derivation Function 2), **bcrypt** (basé sur Blowfish).

**Fonctionnement** : multiples itérations de hashing. Plus le nombre d'itérations est élevé, plus le calcul est lent, rendant les attaques brute force et dictionnaire économiquement non viables.

---

### 3.7.3 Key Splitting (Secret Sharing)

Division d'une clé cryptographique en plusieurs **shares** (parts) distribuées entre différentes parties. La clé originale ne peut être reconstituée qu'en réunissant un nombre minimum de shares.

**Shamir's Secret Sharing (SSS)** : schéma à seuil (k, n). Exemple : (3, 5) signifie que la clé est divisée en 5 parts et que 3 parts suffisent pour la reconstruire. Moins de 3 parts ne révèlent aucune information sur la clé.

---

### 3.7.4 Homomorphic Encryption (HE)

Permet d'effectuer des calculs directement sur des données chiffrées, sans jamais les déchiffrer. Le résultat du calcul, une fois déchiffré, est identique à celui qu'on obtiendrait sur les données en clair.

| Type | Opérations supportées | Exemples |
|------|----------------------|----------|
| **PHE** (Partially Homomorphic) | Une seule opération (addition OU multiplication), nombre illimité de fois | RSA (multiplication), ElGamal, Paillier (addition) |
| **SHE** (Somewhat Homomorphic) | Addition ET multiplication, mais en nombre limité (accumulation de bruit cryptographique) | -- |
| **FHE** (Fully Homomorphic) | Toutes les opérations, nombre illimité -- le plus puissant mais le plus coûteux en performance | Bibliothèque Microsoft SEAL |

**Applications** : cloud computing sécurisé (calculs sur données sans que le fournisseur cloud y accède), ML sur données chiffrées, vote électronique sécurisé, transactions financières.

**Défi majeur** : overhead de performance significatif (FHE est actuellement des milliers de fois plus lent que le traitement en clair).

---

### 3.7.5 Forward Secrecy (FS / PFS)

**Principe** : chaque session de communication génère des clés de session **éphémères**, indépendantes de la clé privée à long terme. Ces clés sont supprimées à la fin de la session.

**Conséquence** : même si la clé privée à long terme est compromise dans le futur, les sessions passées restent indéchiffrables car les clés de session n'existent plus.

**Protocoles** : **DHE** (Ephemeral Diffie-Hellman), **ECDHE** (Elliptic Curve Ephemeral DH).

| Aspect | Avec PFS | Sans PFS |
|--------|----------|----------|
| Key exchange | DHE / ECDHE | RSA key exchange statique |
| Clé de session | Éphémère, supprimée après usage | Dérivée de la clé privée à long terme |
| Impact d'une compromission de clé | N'affecte PAS les sessions passées | Toutes les données passées sont déchiffrables |

Mnémonique : Forward Secrecy = clés **Éphémères**. DHE/ECDHE -> session -> session terminée -> clé **supprimée** -> passé indéchiffrable.

**Implémentations** : TLS 1.3 (PFS obligatoire), Signal, WhatsApp, WireGuard, OpenVPN, WPA3 SAE.

---

### 3.7.6 Hardware Acceleration

Technologies matérielles accélérant les opérations cryptographiques :

| Technologie | Fonction | Cas d'usage |
|-------------|---------|-------------|
| **AES-NI** | Instructions CPU dédiées au chiffrement AES | TLS, VPNs, chiffrement de disque |
| **TPM** | Stockage et traitement sécurisé des clés | Secure Boot, BitLocker, attestation |
| **HSM** | Hardware dédié à la gestion de clés à grande échelle | Signatures numériques, CAs, banking |
| **Intel SGX** | Enclaves sécurisées pour computing confidentiel | Protection des données applicatives |
| **GPUs** | Traitement parallèle massif | Blockchain mining, password hashing (PBKDF2, bcrypt) |
| **FPGAs** | Accélération crypto personnalisable et reconfigurable | Chiffrement low-latency en réseaux haute vitesse |
| **ASICs** | Circuits dédiés au traitement crypto ultra-rapide | VPN concentrators, cloud encryption |

---

### 3.7.7 Envelope Encryption

Approche de chiffrement à deux niveaux combinant performance et sécurité :
1. Les données sont chiffrées avec un **DEK** (Data Encryption Key) -- clé symétrique rapide
2. Le DEK est lui-même chiffré avec un **KEK** (Key Encryption Key) -- clé asymétrique gérée par un KMS

**Avantages** : performance (chiffrement symétrique pour les données volumineuses), sécurité (le KEK protégé dans un KMS n'est jamais exposé), rotation simplifiée (on re-chiffre uniquement le DEK avec un nouveau KEK sans re-chiffrer toutes les données).

Mnémonique : **DEK** chiffre les données, **KEK** chiffre le DEK.

**Utilisé par** : AWS KMS, Google Cloud KMS, Azure Key Vault.

---

### 3.7.8 Performance vs Security

Le chiffrement fort (AES-256, PFS, deep packet inspection) augmente la sécurité mais impacte la performance (latence, consommation CPU/mémoire).

**Solutions d'équilibrage** : hardware acceleration (AES-NI), load balancing, caching intelligent, authentification risk-based (niveaux de sécurité adaptés au contexte), anomaly detection par AI.

**Principe directeur** : aligner la stratégie de sécurité avec la tolérance au risque de l'organisation, les exigences de conformité et les objectifs de performance opérationnelle.

---

### 3.7.9 Secure Multiparty Computation (SMPC / MPC)

Permet à plusieurs parties de calculer conjointement le résultat d'une fonction sur leurs données respectives **sans qu'aucune partie ne révèle ses données aux autres**.

**Pas besoin de tiers de confiance** : le calcul est distribué entre les participants.

**Applications** : transactions financières inter-institutions, recherche médicale collaborative, ML privacy-preserving, enchères sécurisées, détection de fraude inter-banques.

**Standard** : ISO/IEC 4922-1:2023.

---

### 3.7.10 AEAD (Authenticated Encryption with Associated Data)

Combine en une seule opération la **confidentialité** (chiffrement symétrique) et l'**intégrité** (authentification via un tag).

**Associated Data (AD)** : les métadonnées (headers, routing info) sont **authentifiées** (protégées contre la modification) mais **pas chiffrées** (restent lisibles pour le routage).

**Mécanisme** : le récepteur recalcule le tag d'authentification. S'il ne correspond pas, le message entier est **rejeté** sans tentative de déchiffrement.

**Algorithmes** : **AES-GCM** (optimisé par hardware via AES-NI), **ChaCha20-Poly1305** (performant sur les plateformes sans support hardware AES).

**Mandaté dans TLS 1.3** : seuls les cipher suites AEAD sont autorisés.

---

### 3.7.11 Mutual Authentication

Les **deux parties** vérifient mutuellement l'identité de l'autre avant d'établir la connexion.

**mTLS (mutual TLS)** : client et serveur échangent chacun un certificat X.509. Chaque partie vérifie le certificat de l'autre auprès d'une CA de confiance.

**Kerberos** : le KDC agit comme tiers de confiance, authentifiant les deux parties via des tickets.

**Protection** : contre les attaques MitM (l'attaquant ne possède pas le certificat légitime) et le phishing (le client vérifie aussi l'identité du serveur).

---
---

## OBJECTIF 3.8 -- Cryptographic Use Cases and Techniques

*Given a Scenario, Apply the Appropriate Cryptographic Use Case and/or Technique*

### 3.8.1 Protection des données selon leur état

| État | Technologies | Best Practices |
|------|-------------|----------------|
| **Data at Rest** | **AES-256**, BitLocker, VeraCrypt, **TDE** (Transparent Data Encryption) | HSMs pour gestion de clés, rotation régulière |
| **Data in Transit** | **TLS**, **IPsec**, **SSH**, SMTP over TLS | Mutual authentication, désactiver les algorithmes faibles, PFS, segmentation réseau |
| **Data in Use** | **TEEs** (Intel SGX, AMD SEV, ARM TrustZone), HE, SMPC, data masking/tokenization | Confidential computing, zero-trust, PoLP, memory encryption (Intel TME, AMD SME) |

---

### 3.8.2 Secure Email

| Technologie | Fonction |
|-------------|---------|
| **TLS** | Chiffrement en transit (serveur à serveur) |
| **PGP / S/MIME** | Chiffrement de bout en bout (E2EE) : seul le destinataire peut déchiffrer |
| **DMARC, SPF, DKIM** | Prévention du spoofing et du phishing |

---

### 3.8.3 Immutable Databases / Blockchain

Enregistrements permanents et non modifiables, fournissant un historique tamper-proof.

**Mécanismes de consensus** : **PoW** (Proof of Work) -- résolution de problèmes cryptographiques coûteux en calcul ; **PoS** (Proof of Stake) -- les validateurs sont sélectionnés en proportion de leurs tokens verrouillés.

**Applications** : transactions financières, records légaux, traçabilité supply chain, forensique numérique.

---

### 3.8.4 Non-Repudiation

Garantie qu'une partie ne peut pas nier ses actions (envoi de message, signature de document, transaction).

**Techniques** : signatures numériques (la clé privée prouve l'identité du signataire), MACs (codes d'authentification de message), blockchain (enregistrement immuable), services de timestamping (horodatage certifié), certificats émis par des CAs.

---

### 3.8.5 Privacy Applications

| Technologie | Fonction |
|-------------|---------|
| **E2EE** (End-to-End Encryption) | Chiffrement où seuls l'expéditeur et le destinataire peuvent déchiffrer. Exemples : Signal, WhatsApp |
| **HE** (Homomorphic Encryption) | Calculs sur données chiffrées sans déchiffrement |
| **ZKP** (Zero-Knowledge Proofs) | Prouver la connaissance ou la possession d'une information sans la révéler |
| **Zk-SNARK** | ZKP non interactif (pas de dialogue entre prouveur et vérifieur). Utilisé par Zcash |
| **Differential Privacy** | Ajout de bruit mathématique calibré aux données pour protéger les individus dans les datasets statistiques |
| **Tor** | Navigation anonyme via The Onion Router (chiffrement en couches successives) |

---

### 3.8.6 Legal and Regulatory Considerations

- **Régulations de chiffrement** : GDPR, HIPAA, PCI DSS, FIPS
- **Export controls** : **Wassenaar Arrangement** (accord multinational), **ITAR** (restrictions US) -- réglementent la distribution internationale des technologies de chiffrement
- **Key escrow / backdoors** : politiques d'accès légal des gouvernements demandant le dépôt de clés ou l'insertion de backdoors
- **Key management regulations** : exigences de stockage sécurisé, rotation périodique et destruction certifiée des clés

---

### 3.8.7 Resource Considerations

- **CPU/mémoire** : algorithmes lourds compensés par hardware acceleration (AES-NI, TPMs, HSMs)
- **Énergie** : algorithmes légers pour appareils à batterie (ChaCha20 plutôt que AES si pas de hardware dédié, SHA-256 plutôt que SHA-512)
- **Bande passante** : TLS 1.3 réduit l'overhead des handshakes (1-RTT au lieu de 2-RTT)
- **Scalabilité** : les algorithmes PQC nécessitent des clés plus grandes et plus de ressources que les algorithmes actuels

---

### 3.8.8 Data Sanitization

| Méthode | Description |
|---------|-------------|
| **Crypto-shredding** | Destruction irréversible des clés de chiffrement, rendant les données chiffrées définitivement illisibles |
| **Data Wiping** | Écrasement avec des patterns aléatoires, empêchant la récupération forensique |
| **Degaussing** | Champs magnétiques puissants effaçant les médias magnétiques (HDD, bandes) |
| **Physical Destruction** | Broyage, incinération -- pour les environnements haute sécurité |
| **CE MEK** | Cryptographic Erase via suppression de la Media Encryption Key (pour les SEDs conformes TCG Opal) |

Standard de référence : **NIST SP 800-88** (Guidelines for Media Sanitization).

---

### 3.8.9 Data Anonymization

| Technique | Description |
|-----------|-------------|
| **Data Masking** | Remplacement des valeurs sensibles par des alternatives fictives mais réalistes (ex: nom réel -> nom généré) |
| **Tokenization** | Substitution par des tokens aléatoires sans valeur exploitable (mapping conservé dans un token vault sécurisé) |
| **Generalization** | Réduction de la spécificité des données (âge exact -> tranche d'âge, adresse -> ville) |
| **Differential Privacy** | Ajout de bruit statistique calibré pour préserver la vie privée tout en maintenant l'utilité analytique |

**Risque** : les **re-identification attacks** corrèlent des données anonymisées avec des sources publiques pour identifier les individus.

---

### 3.8.10 Certificate-Based Authentication (CBA)

Utilisation de certificats numériques émis par une CA (Certificate Authority) pour l'authentification, en remplacement des mots de passe.

**mTLS** (mutual TLS) : client ET serveur s'authentifient mutuellement via certificats.

**Cas d'usage** : architectures zero-trust, PAM, IoT (authentification d'appareils), smart cards, VPN, SSO fédéré.

---

### 3.8.11 Passwordless Authentication

Élimination complète des mots de passe traditionnels.

**Méthodes** : cryptographie à clé publique, **FIDO2/WebAuthn**, biométrie, **YubiKeys** (hardware security keys), TPMs.

**Menaces éliminées** : brute force, dictionary attacks, credential stuffing, phishing de mots de passe.

---

### 3.8.12 Software Provenance

Tracking et vérification de l'origine, de l'historique et de l'intégrité de chaque composant logiciel dans la chaîne d'approvisionnement.

**Mécanismes** : **code signing** avec certificats numériques, **hashing cryptographique** (SHA-256) pour vérifier l'intégrité.

**DevSecOps** : blockchain-based ledgers et transparency logs pour un historique immuable.

**Menaces prévenues** : supply chain attacks, dependency hijacking, injection de code non autorisé.

---

### 3.8.13 Software/Code Integrity

| Mécanisme | Description |
|-----------|-------------|
| **Code Signing** | Windows (Authenticode) et macOS vérifient les signatures des exécutables avant exécution |
| **Secure Boot + TPM** | Firmware et OS vérifiés cryptographiquement au boot |
| **Hash-based checks** | Linux package managers, Tripwire, AIDE vérifient l'intégrité via hashes |
| **Docker Content Trust (DCT)** | Seules les images conteneurs signées sont autorisées |
| **AppLocker / Gatekeeper** | Application whitelisting |
| **GPG-signed Git commits** | Authenticité et identité vérifiable de l'auteur du code |

---

### 3.8.14 Techniques cryptographiques appliquées

#### Tokenization

Remplace les données sensibles par des tokens sans valeur exploitable. Contrairement au chiffrement, il n'y a pas de transformation mathématique réversible : le mapping est conservé dans un **token vault** sécurisé. Conserve le format original des données, permettant une intégration transparente avec les systèmes existants.

#### Code Signing

Signature numérique du code avec un certificat émis par une CA (ex: **Microsoft Authenticode**). Les CAs (DigiCert, Verisign) valident l'identité de l'éditeur avant d'émettre le certificat. Vérification PowerShell : `Get-AuthenticodeSignature "C:\Windows\py.exe"`.

#### Cryptographic Erase et Obfuscation

**Cryptographic Erase (CE)** : suppression de la MEK (Media Encryption Key), rendant les données chiffrées sur le disque définitivement inaccessibles. Pour les SEDs conformes TCG Opal.

**Obfuscation** : rendre le code difficile à comprendre et à reverse-engineer sans altérer sa fonctionnalité.
- Code obfuscation : renommage de variables, insertion de dead code, altération du control flow
- Data obfuscation : chiffrement de strings, modification de constantes
- Binary obfuscation : réordonnancement d'instructions, packing, encryption
- Techniques avancées : **code virtualization** (exécution dans une VM custom), **control flow flattening**
- Outils : ProGuard/DexGuard (Java/Android), Dotfuscator (.NET), UglifyJS (JavaScript), obfuscator-llvm (C/C++)

#### Digital Signatures

Fournissent trois propriétés : **non-repudiation** (le signataire ne peut nier), **authenticité** (confirmation de l'identité) et **intégrité** (le message n'a pas été modifié). S/MIME utilise la clé privée de l'expéditeur pour signer. Standard : **FIPS 186-5**.

#### Serialization

Conversion de données structurées en un format adapté au stockage ou à la transmission. **JWT** (JSON Web Tokens, **RFC 7519**) : claims encodés et signés via HMAC ou RSA. Sécuriser : chiffrer avant transmission, appliquer des signatures numériques, valider rigoureusement l'input lors de la désérialisation. Risque majeur : **insecure deserialization** (OWASP Top 10).

#### Hashing

Transformation one-way d'un input en une string de longueur fixe. Usage principal : vérification d'intégrité.

**SHA-256** (famille SHA-2) est l'algorithme standard, fondamental pour Bitcoin et la blockchain. SHA-1 est interdit depuis 2013.

Standards : **FIPS 180-4** (SHA-2), **FIPS 202** (SHA-3). Commande : `openssl dgst -sha3-256 <filename>`.

#### One-Time Pad (OTP)

Chiffrement théoriquement incassable si trois conditions sont remplies : clé véritablement aléatoire, clé au moins aussi longue que le message, clé utilisée une seule fois et détruite. Utilisé en intelligence et opérations militaires. Inapplicable à grande échelle en raison des contraintes de gestion et de distribution des clés.

---

### 3.8.15 Symmetric Cryptography

| Type | Fonctionnement | Exemples | Usage |
|------|---------------|----------|-------|
| **Block Cipher** | Chiffre des blocs de taille fixe (ex: 128 bits), padding nécessaire si le message ne remplit pas un bloc | **AES** (FIPS 197), Twofish | Fichiers, bases de données, data at rest |
| **Stream Cipher** | Chiffre bit par bit ou byte par byte, pas de padding | **ChaCha20**, Salsa20 | VoIP, streaming, IoT, temps réel |

**Modes de fonctionnement des block ciphers** : ECB (pas recommandé : patterns visibles), CBC, **CTR** (Counter), **GCM** (Galois/Counter Mode, combine chiffrement + authentification = AEAD).

AES = **FIPS 197**.

---

### 3.8.16 Asymmetric Cryptography

Utilise une paire de clés mathématiquement liées : la **clé publique** (distribuée) chiffre, la **clé privée** (secrète) déchiffre.

**Algorithmes** : **RSA** (basé sur la factorisation), **ECC** (Elliptic Curve Cryptography), **Diffie-Hellman** (échange de clés).

**ECC vs RSA** : ECC offre le même niveau de sécurité avec des clés significativement plus petites (256 bits ECC ~ 3072 bits RSA), ce qui le rend plus adapté aux environnements mobiles et embedded.

**Usages** : TLS handshake, PKI, signatures numériques, échange de clés.

**Hybrid cryptosystems** : en pratique, le chiffrement asymétrique est utilisé pour échanger une clé symétrique, puis le chiffrement symétrique est utilisé pour le chiffrement bulk des données (car beaucoup plus rapide).

---

### 3.8.17 Lightweight Cryptography

Algorithmes optimisés pour les environnements à ressources contraintes : IoT, embedded systems, smart cards, wireless sensors.

**Caractéristiques** : clés plus petites, faible complexité computationnelle, usage mémoire minimal.

**Algorithmes** : Present, Speck/Simon (NSA), **Ascon** (sélectionné par le NIST comme standard de lightweight cryptography en février 2023).

---

### 3.8.18 Centralized vs Decentralized Key Management

| Aspect | Centralisé | Décentralisé |
|--------|-----------|--------------|
| **Modèle** | Source unique de vérité (KMS, HSM) | Contrôle distribué entre entités |
| **Avantages** | Administration simplifiée, politiques uniformes, audit centralisé | Résilience, tolérance aux pannes, pas de SPOF |
| **Usage** | Finance, santé, environnements régulés | Blockchain, zero-trust, applications multiparties |
| **Défis** | SPOF si le système central est compromis | Synchronisation, cohérence, conformité réglementaire complexe |

---
---

## MNEMONIQUES ET AIDE-MEMOIRE

**Chaîne de confiance Secure Boot** : PK > KEK > DB (allow) + DBX (deny) = **"PKDD"**

**Détection Anti-Malware** (du plus rapide au plus complet) : Signature > Heuristic > Behavior = **"SHB"**

**SCAP -- 5 composants** : XCCDF, OVAL, CPE, CVE, CVSS = **"XOCCC"**

**Email Security Stack** : SPF (qui peut envoyer) > DKIM (message non altéré) > DMARC (que faire si échec) = **"SDD"**

**SOAR -- 3 piliers** : Orchestration + Automation + Response = **"OAR"**

**Envelope Encryption** : DEK (chiffre les données) + KEK (chiffre le DEK)

**Post-Quantum NIST Standards** : FIPS **203** (KEM), **204** (Digital Sig), **205** (Hash-Based Sig)

**Forward Secrecy** : DHE ou ECDHE > clé de session générée > session terminée > clé **supprimée** > passé indéchiffrable

**TPM vs HSM** : TPM = intégré à un appareil (protection locale) / HSM = appliance partagée en réseau (protection centralisée)

**Secure Boot vs Measured Boot** : Secure Boot **bloque** / Measured Boot **enregistre**

**SED vs BitLocker** : SED = hardware (performance) / BitLocker = software (gestion)

**HIDS vs HIPS** : HIDS **détecte** / HIPS **prévient**

**EAP variants** : EAP-TLS (certificats mutuels, le plus sécurisé) / EAP-PEAP (tunnel TLS + MSCHAPv2) / EAP-TTLS (tunnel TLS, flexible)