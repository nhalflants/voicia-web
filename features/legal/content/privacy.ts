import { COMPANY, CONTACT_EMAIL } from "@/features/legal/constants"
import type { LegalDocument } from "@/features/legal/types"

// Wording taken from the previous voicia.be privacy policy
const en: LegalDocument = {
  title: "Privacy Policy",
  sections: [
    {
      title: "Who we are",
      blocks: [
        {
          type: "p",
          text: "Voicia provides AI-powered voice assistants for businesses. We handle phone calls automatically, help qualify inbound requests and integrate with your business tools.",
        },
        {
          type: "p",
          text: "This privacy policy explains how we collect and use personal information when you:",
        },
        {
          type: "ul",
          items: [
            "Use our services as a business customer",
            "Call a business that uses Voicia",
            "Visit our website",
          ],
        },
        {
          type: "p",
          text: `Voicia is operated by ${COMPANY.name} with its registered office at ${COMPANY.address}, registered with the Crossroads Bank for Enterprises under number ${COMPANY.number}.`,
        },
        {
          type: "p",
          text: "We are committed to protecting your privacy and complying with the EU General Data Protection Regulation (GDPR) and Belgian privacy laws.",
        },
      ],
    },
    {
      title: "What information we collect",
      blocks: [
        { type: "h3", text: "If you're a business customer" },
        {
          type: "ul",
          items: [
            "Your name, email, phone number and company details",
            "Billing and payment information",
            "How you use our platform and services",
          ],
        },
        { type: "h3", text: "If you call a business using Voicia" },
        {
          type: "ul",
          items: [
            "Your voice recording and what you said during the call",
            "Your phone number",
            "Information you provide during the call, such as your name, preferences, or request details",
          ],
        },
        { type: "h3", text: "If you visit our website" },
        {
          type: "ul",
          items: [
            "Basic information about your visit, such as pages viewed, device type and approximate location",
            "Cookies and similar technologies, as described in section 9",
          ],
        },
      ],
    },
    {
      title: "Why we collect this information",
      blocks: [
        { type: "h3", text: "To provide our services" },
        {
          type: "ul",
          items: [
            "Answer phone calls with AI",
            "Qualify inbound requests and route calls",
            "Connect calls to the right person",
            "Sync information with CRM systems and connected tools",
            "Process payments",
          ],
        },
        { type: "h3", text: "To improve our services" },
        {
          type: "ul",
          items: [
            "Make our AI better at understanding and responding in a business context",
            "Fix technical problems",
            "Understand how people use our platform",
          ],
        },
        { type: "h3", text: "To communicate with you" },
        {
          type: "ul",
          items: [
            "Send service updates and important notices",
            "Provide customer support",
            "Send marketing emails only with your permission, and you can unsubscribe at any time",
          ],
        },
        { type: "h3", text: "To protect and comply" },
        {
          type: "ul",
          items: [
            "Prevent fraud and ensure security",
            "Meet our legal obligations",
            "Enforce our terms of use",
          ],
        },
      ],
    },
    {
      title: "Legal basis for processing",
      blocks: [
        { type: "p", text: "We process your personal data based on:" },
        {
          type: "ul",
          items: [
            {
              term: "Contract:",
              text: "we need your information to provide the services you signed up for.",
            },
            {
              term: "Legitimate interest:",
              text: "we have legitimate business reasons to process certain data, such as improving our services or preventing fraud, and we balance this against your privacy rights.",
            },
            {
              term: "Consent:",
              text: "for things like marketing emails and certain cookies, we ask for your permission first. You can withdraw consent at any time.",
            },
            {
              term: "Legal obligation:",
              text: "in some cases we must process data to comply with the law.",
            },
          ],
        },
      ],
    },
    {
      title: "How we share your information",
      blocks: [
        { type: "p", text: "We never sell your personal data." },
        { type: "p", text: "We share information only when necessary:" },
        {
          type: "ul",
          items: [
            {
              term: "Service providers:",
              text: "we work with trusted companies that help us deliver our services, such as cloud hosting, payment processing, AI technology, email services and anti-abuse tools. These companies may only use your data as instructed by us and must protect it properly.",
            },
            {
              term: "Your integrations:",
              text: "when you connect tools such as your CRM, we share information to make those integrations work. You control these connections.",
            },
            {
              term: "Legal requirements:",
              text: "we may disclose information when required by law, court order, or when necessary to protect rights and safety.",
            },
            {
              term: "Business transfers:",
              text: "if our company is sold or merged, your information may be transferred to the new owners.",
            },
          ],
        },
      ],
    },
    {
      title: "Data security and hosting",
      blocks: [
        {
          type: "p",
          text: "We implement appropriate technical and organizational measures to protect personal data against accidental or unlawful destruction, loss, alteration, unauthorized disclosure or access.",
        },
        {
          type: "p",
          text: "Personal data collected and processed by Voicia as part of its services is hosted on secure infrastructure. We work with professional service providers and take steps to ensure that hosted data is handled in accordance with the GDPR and applicable European data protection laws.",
        },
      ],
    },
    {
      title: "How we protect your information",
      blocks: [
        { type: "p", text: "We take security seriously and use:" },
        {
          type: "ul",
          items: [
            "Encryption to protect data in transit and at rest",
            "Access controls so only authorized people can view relevant data",
            "Regular security monitoring and updates",
            "Secure infrastructure with physical and logical protection",
          ],
        },
        {
          type: "p",
          text: "No system is 100% secure, but we work hard to protect your information using industry-standard practices.",
        },
      ],
    },
    {
      title: "How long we keep your information",
      blocks: [
        { type: "p", text: "We keep personal data only as long as necessary:" },
        {
          type: "ul",
          items: [
            {
              term: "Voice recordings:",
              text: "typically 12 months, unless a shorter retention period applies or earlier deletion is requested and legally possible",
            },
            {
              term: "Account information:",
              text: "during your subscription, plus up to 90 days after you close your account",
            },
            {
              term: "Billing records:",
              text: "7 years for tax and accounting compliance",
            },
            { term: "Website analytics:", text: "up to 26 months" },
            { term: "Marketing data:", text: "until you unsubscribe" },
          ],
        },
        {
          type: "p",
          text: "When we no longer need data, we delete it securely.",
        },
      ],
    },
    {
      title: "Cookies",
      blocks: [
        {
          type: "p",
          text: "We use cookies and similar technologies on our website to:",
        },
        {
          type: "ul",
          items: [
            "Remember your preferences",
            "Understand how people use our site",
            "Improve website performance",
          ],
        },
        {
          type: "p",
          text: "Essential cookies are necessary for the website to work. Optional cookies, including analytics and marketing cookies, require your consent where applicable, and you can manage them through your browser settings or any cookie tools we make available on the site.",
        },
      ],
    },
    {
      title: "Your privacy rights",
      blocks: [
        { type: "p", text: "Under the GDPR, you have the right to:" },
        {
          type: "ul",
          items: [
            { term: "Access:", text: "get a copy of your personal data" },
            { term: "Correction:", text: "fix inaccurate information" },
            {
              term: "Deletion:",
              text: "request that we delete your data, subject to legal exceptions",
            },
            {
              term: "Restriction:",
              text: "ask us to limit how we use your data",
            },
            {
              term: "Objection:",
              text: "object to certain types of processing, such as direct marketing",
            },
            {
              term: "Portability:",
              text: "receive your data in a portable format where applicable",
            },
            {
              term: "Withdraw consent:",
              text: "change your mind about things you previously agreed to",
            },
          ],
        },
        {
          type: "p",
          text: `To exercise these rights, email ${CONTACT_EMAIL}. We will respond within the timeframe required by applicable law.`,
        },
      ],
    },
    {
      title: "Special notes",
      blocks: [
        {
          type: "ul",
          items: [
            {
              term: "If you called a business using Voicia:",
              text: "the business you called generally controls your data and acts as the data controller for that relationship. Please contact them first to exercise your privacy rights. We process the data on their behalf.",
            },
            {
              term: "Children:",
              text: "our services are not intended for anyone under 16. If you are under 16, please do not use our services.",
            },
            {
              term: "Marketing:",
              text: "you can unsubscribe from marketing emails at any time by clicking the unsubscribe link in any email or by contacting us.",
            },
          ],
        },
      ],
    },
    {
      title: "Changes to this policy",
      blocks: [
        {
          type: "p",
          text: "We may update this privacy policy from time to time. If we make significant changes, we will notify you by email or through a notice on our website where appropriate.",
        },
        {
          type: "p",
          text: "Continuing to use our services after changes take effect means you accept the updated policy.",
        },
      ],
    },
    {
      title: "Contact us",
      blocks: [
        { type: "h3", text: "Questions or concerns about privacy?" },
        {
          type: "ul",
          items: [
            { term: "Email:", text: CONTACT_EMAIL },
            {
              term: "Mail:",
              text: `${COMPANY.name}, ${COMPANY.address}, Belgium`,
            },
          ],
        },
        {
          type: "h3",
          text: "Want to exercise your rights or make a complaint?",
        },
        {
          type: "p",
          text: `Email us first at ${CONTACT_EMAIL}. We want to help. If we can't resolve your concern, you can contact the Belgian Data Protection Authority:`,
        },
        {
          type: "ul",
          items: [
            "Belgian Data Protection Authority, Rue de la Presse 35, 1000 Brussels, Belgium",
            "Phone: +32 2 274 48 00",
            "Email: contact@apd-gba.be",
            "Website: www.autoriteprotectiondonnees.be",
          ],
        },
      ],
    },
    {
      title: "In plain English",
      blocks: [
        {
          type: "ul",
          items: [
            {
              term: "What we do:",
              text: "we provide AI phone assistants for businesses.",
            },
            {
              term: "What we collect:",
              text: "voice recordings, contact information and usage data.",
            },
            { term: "Why:", text: "to provide and improve our services." },
            {
              term: "Who we share with:",
              text: "only trusted service providers and integrations, never through data sales.",
            },
            {
              term: "Your control:",
              text: "you can access, correct or request deletion of your data.",
            },
            { term: "Questions:", text: `email ${CONTACT_EMAIL}` },
          ],
        },
      ],
    },
  ],
  footnote:
    "This privacy policy complies with the EU General Data Protection Regulation (GDPR) and Belgian data protection laws.",
}

const fr: LegalDocument = {
  title: "Politique de confidentialité",
  sections: [
    {
      title: "Qui sommes-nous",
      blocks: [
        {
          type: "p",
          text: "Voicia fournit des assistants vocaux propulsés par l'IA aux entreprises. Nous prenons les appels téléphoniques automatiquement, aidons à qualifier les demandes entrantes et nous connectons à vos outils de travail.",
        },
        {
          type: "p",
          text: "Cette politique de confidentialité explique comment nous collectons et utilisons des données personnelles lorsque vous :",
        },
        {
          type: "ul",
          items: [
            "Utilisez nos services en tant qu'entreprise cliente",
            "Appelez une entreprise qui utilise Voicia",
            "Visitez notre site",
          ],
        },
        {
          type: "p",
          text: `Voicia est exploité par ${COMPANY.name}, dont le siège social est situé ${COMPANY.address}, inscrite à la Banque-Carrefour des Entreprises sous le numéro ${COMPANY.number}.`,
        },
        {
          type: "p",
          text: "Nous nous engageons à protéger votre vie privée et à respecter le Règlement général sur la protection des données (RGPD) ainsi que la législation belge en matière de vie privée.",
        },
      ],
    },
    {
      title: "Les données que nous collectons",
      blocks: [
        { type: "h3", text: "Si vous êtes une entreprise cliente" },
        {
          type: "ul",
          items: [
            "Vos nom, e-mail, numéro de téléphone et coordonnées d'entreprise",
            "Vos informations de facturation et de paiement",
            "La manière dont vous utilisez notre plateforme et nos services",
          ],
        },
        {
          type: "h3",
          text: "Si vous appelez une entreprise qui utilise Voicia",
        },
        {
          type: "ul",
          items: [
            "L'enregistrement de votre voix et ce que vous avez dit pendant l'appel",
            "Votre numéro de téléphone",
            "Les informations données pendant l'appel, comme votre nom, vos préférences ou le détail de votre demande",
          ],
        },
        { type: "h3", text: "Si vous visitez notre site" },
        {
          type: "ul",
          items: [
            "Des informations de base sur votre visite, comme les pages consultées, le type d'appareil et votre localisation approximative",
            "Des cookies et technologies similaires, décrits à la section 9",
          ],
        },
      ],
    },
    {
      title: "Pourquoi nous collectons ces données",
      blocks: [
        { type: "h3", text: "Pour fournir nos services" },
        {
          type: "ul",
          items: [
            "Répondre aux appels grâce à l'IA",
            "Qualifier les demandes entrantes et orienter les appels",
            "Transférer les appels à la bonne personne",
            "Synchroniser les informations avec vos CRM et outils connectés",
            "Traiter les paiements",
          ],
        },
        { type: "h3", text: "Pour améliorer nos services" },
        {
          type: "ul",
          items: [
            "Aider notre IA à mieux comprendre et répondre dans un contexte professionnel",
            "Corriger les problèmes techniques",
            "Comprendre comment notre plateforme est utilisée",
          ],
        },
        { type: "h3", text: "Pour communiquer avec vous" },
        {
          type: "ul",
          items: [
            "Envoyer des mises à jour du service et des avis importants",
            "Assurer le support client",
            "Envoyer des e-mails marketing uniquement avec votre accord, avec désinscription possible à tout moment",
          ],
        },
        { type: "h3", text: "Pour protéger et respecter la loi" },
        {
          type: "ul",
          items: [
            "Prévenir la fraude et assurer la sécurité",
            "Remplir nos obligations légales",
            "Faire respecter nos conditions d'utilisation",
          ],
        },
      ],
    },
    {
      title: "Base légale du traitement",
      blocks: [
        {
          type: "p",
          text: "Nous traitons vos données personnelles sur les bases suivantes :",
        },
        {
          type: "ul",
          items: [
            {
              term: "Contrat :",
              text: "vos informations nous sont nécessaires pour fournir les services auxquels vous avez souscrit.",
            },
            {
              term: "Intérêt légitime :",
              text: "certaines données sont traitées pour des raisons professionnelles légitimes, comme l'amélioration de nos services ou la prévention de la fraude, en tenant compte de vos droits.",
            },
            {
              term: "Consentement :",
              text: "pour les e-mails marketing et certains cookies, nous demandons d'abord votre accord. Vous pouvez le retirer à tout moment.",
            },
            {
              term: "Obligation légale :",
              text: "dans certains cas, la loi nous impose de traiter des données.",
            },
          ],
        },
      ],
    },
    {
      title: "Avec qui nous partageons vos données",
      blocks: [
        { type: "p", text: "Nous ne vendons jamais vos données personnelles." },
        {
          type: "p",
          text: "Nous ne partageons des informations que lorsque c'est nécessaire :",
        },
        {
          type: "ul",
          items: [
            {
              term: "Prestataires :",
              text: "nous travaillons avec des entreprises de confiance qui nous aident à fournir nos services, comme l'hébergement cloud, le traitement des paiements, les technologies d'IA, l'envoi d'e-mails et la lutte contre les abus. Elles ne peuvent utiliser vos données que selon nos instructions et doivent les protéger correctement.",
            },
            {
              term: "Vos intégrations :",
              text: "lorsque vous connectez des outils comme votre CRM, nous partageons les informations nécessaires à leur fonctionnement. Vous gardez la main sur ces connexions.",
            },
            {
              term: "Exigences légales :",
              text: "nous pouvons divulguer des informations lorsque la loi ou une décision de justice l'exige, ou lorsque c'est nécessaire pour protéger des droits et la sécurité.",
            },
            {
              term: "Cession d'entreprise :",
              text: "si notre société est vendue ou fusionnée, vos informations peuvent être transférées aux nouveaux propriétaires.",
            },
          ],
        },
      ],
    },
    {
      title: "Sécurité et hébergement des données",
      blocks: [
        {
          type: "p",
          text: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger les données personnelles contre la destruction accidentelle ou illicite, la perte, l'altération, la divulgation ou l'accès non autorisés.",
        },
        {
          type: "p",
          text: "Les données personnelles collectées et traitées par Voicia dans le cadre de ses services sont hébergées sur une infrastructure sécurisée. Nous travaillons avec des prestataires professionnels et veillons à ce que les données hébergées soient traitées conformément au RGPD et aux lois européennes applicables en matière de protection des données.",
        },
      ],
    },
    {
      title: "Comment nous protégeons vos données",
      blocks: [
        {
          type: "p",
          text: "Nous prenons la sécurité au sérieux et utilisons :",
        },
        {
          type: "ul",
          items: [
            "Le chiffrement des données en transit et au repos",
            "Des contrôles d'accès pour que seules les personnes autorisées voient les données utiles",
            "Une surveillance et des mises à jour de sécurité régulières",
            "Une infrastructure sécurisée, avec protection physique et logique",
          ],
        },
        {
          type: "p",
          text: "Aucun système n'est sûr à 100 %, mais nous mettons tout en œuvre pour protéger vos informations selon les pratiques reconnues du secteur.",
        },
      ],
    },
    {
      title: "Durée de conservation",
      blocks: [
        {
          type: "p",
          text: "Nous ne conservons les données personnelles que le temps nécessaire :",
        },
        {
          type: "ul",
          items: [
            {
              term: "Enregistrements vocaux :",
              text: "en général 12 mois, sauf durée plus courte applicable ou demande de suppression anticipée légalement possible",
            },
            {
              term: "Informations de compte :",
              text: "pendant votre abonnement, puis jusqu'à 90 jours après la fermeture de votre compte",
            },
            {
              term: "Documents de facturation :",
              text: "7 ans, pour nos obligations fiscales et comptables",
            },
            { term: "Statistiques du site :", text: "jusqu'à 26 mois" },
            {
              term: "Données marketing :",
              text: "jusqu'à votre désinscription",
            },
          ],
        },
        {
          type: "p",
          text: "Lorsque nous n'avons plus besoin des données, nous les supprimons de manière sécurisée.",
        },
      ],
    },
    {
      title: "Cookies",
      blocks: [
        {
          type: "p",
          text: "Nous utilisons des cookies et technologies similaires sur notre site pour :",
        },
        {
          type: "ul",
          items: [
            "Mémoriser vos préférences",
            "Comprendre comment notre site est utilisé",
            "Améliorer les performances du site",
          ],
        },
        {
          type: "p",
          text: "Les cookies essentiels sont nécessaires au fonctionnement du site. Les cookies optionnels, dont les cookies de statistiques et de marketing, nécessitent votre consentement lorsque c'est requis. Vous pouvez les gérer depuis les réglages de votre navigateur ou les outils de gestion des cookies proposés sur le site.",
        },
      ],
    },
    {
      title: "Vos droits",
      blocks: [
        { type: "p", text: "Le RGPD vous donne le droit de :" },
        {
          type: "ul",
          items: [
            {
              term: "Accès :",
              text: "obtenir une copie de vos données personnelles",
            },
            {
              term: "Rectification :",
              text: "corriger des informations inexactes",
            },
            {
              term: "Effacement :",
              text: "demander la suppression de vos données, sous réserve des exceptions légales",
            },
            {
              term: "Limitation :",
              text: "nous demander de restreindre l'utilisation de vos données",
            },
            {
              term: "Opposition :",
              text: "vous opposer à certains traitements, comme la prospection",
            },
            {
              term: "Portabilité :",
              text: "recevoir vos données dans un format réutilisable, lorsque c'est applicable",
            },
            {
              term: "Retrait du consentement :",
              text: "revenir sur un accord donné précédemment",
            },
          ],
        },
        {
          type: "p",
          text: `Pour exercer ces droits, écrivez à ${CONTACT_EMAIL}. Nous vous répondrons dans les délais prévus par la loi.`,
        },
      ],
    },
    {
      title: "Cas particuliers",
      blocks: [
        {
          type: "ul",
          items: [
            {
              term: "Si vous avez appelé une entreprise qui utilise Voicia :",
              text: "c'est en général cette entreprise qui contrôle vos données et agit comme responsable du traitement. Contactez-la d'abord pour exercer vos droits. Nous traitons les données pour son compte.",
            },
            {
              term: "Enfants :",
              text: "nos services ne s'adressent pas aux moins de 16 ans. Si vous avez moins de 16 ans, veuillez ne pas les utiliser.",
            },
            {
              term: "Marketing :",
              text: "vous pouvez vous désinscrire des e-mails marketing à tout moment via le lien de désinscription présent dans chaque e-mail, ou en nous contactant.",
            },
          ],
        },
      ],
    },
    {
      title: "Modification de cette politique",
      blocks: [
        {
          type: "p",
          text: "Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. En cas de changement important, nous vous en informerons par e-mail ou par un avis sur notre site, le cas échéant.",
        },
        {
          type: "p",
          text: "En continuant à utiliser nos services après l'entrée en vigueur des changements, vous acceptez la politique mise à jour.",
        },
      ],
    },
    {
      title: "Nous contacter",
      blocks: [
        { type: "h3", text: "Une question sur la vie privée ?" },
        {
          type: "ul",
          items: [
            { term: "E-mail :", text: CONTACT_EMAIL },
            {
              term: "Courrier :",
              text: `${COMPANY.name}, ${COMPANY.address}, Belgique`,
            },
          ],
        },
        {
          type: "h3",
          text: "Vous souhaitez exercer vos droits ou introduire une plainte ?",
        },
        {
          type: "p",
          text: `Écrivez-nous d'abord à ${CONTACT_EMAIL}, nous voulons vous aider. Si nous ne parvenons pas à résoudre votre problème, vous pouvez contacter l'Autorité de protection des données :`,
        },
        {
          type: "ul",
          items: [
            "Autorité de protection des données, Rue de la Presse 35, 1000 Bruxelles, Belgique",
            "Téléphone : +32 2 274 48 00",
            "E-mail : contact@apd-gba.be",
            "Site : www.autoriteprotectiondonnees.be",
          ],
        },
      ],
    },
    {
      title: "En bref",
      blocks: [
        {
          type: "ul",
          items: [
            {
              term: "Ce que nous faisons :",
              text: "nous fournissons des assistants téléphoniques IA aux entreprises.",
            },
            {
              term: "Ce que nous collectons :",
              text: "des enregistrements vocaux, des coordonnées et des données d'utilisation.",
            },
            {
              term: "Pourquoi :",
              text: "pour fournir et améliorer nos services.",
            },
            {
              term: "Avec qui nous partageons :",
              text: "uniquement des prestataires et intégrations de confiance, jamais par la vente de données.",
            },
            {
              term: "Votre contrôle :",
              text: "vous pouvez consulter, corriger ou demander la suppression de vos données.",
            },
            { term: "Questions :", text: `écrivez à ${CONTACT_EMAIL}` },
          ],
        },
      ],
    },
  ],
  footnote:
    "Cette politique de confidentialité est conforme au Règlement général sur la protection des données (RGPD) et à la législation belge en matière de protection des données.",
}

export const PRIVACY = { en, fr }
