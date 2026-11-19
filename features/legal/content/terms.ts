import { COMPANY, CONTACT_EMAIL } from "@/features/legal/constants"
import type { LegalDocument } from "@/features/legal/types"

// Wording taken from the previous voicia.be terms page
const en: LegalDocument = {
  title: "Terms of Use",
  intro:
    "Welcome to the Voicia website. By accessing or using this site, you agree to these Terms of Use. If you do not agree, please do not use the site.",
  sections: [
    {
      title: "Who we are",
      blocks: [
        {
          type: "p",
          text: `This website is operated by ${COMPANY.name}, a company based in Belgium, with its registered office at ${COMPANY.address}, Belgium, and registered with the Crossroads Bank for Enterprises under number ${COMPANY.number}. For questions, contact us at ${CONTACT_EMAIL}.`,
        },
      ],
    },
    {
      title: "Use of the website",
      blocks: [
        {
          type: "p",
          text: "You agree to use this website lawfully and respectfully. You may not attempt to interfere with the site's functioning, misuse its content, or access it in unauthorized ways.",
        },
      ],
    },
    {
      title: "Intellectual property",
      blocks: [
        {
          type: "p",
          text: `All content on this website, including text, visuals, logos, branding, layout, product descriptions and other materials, belongs to ${COMPANY.name} or its licensors unless stated otherwise. You may not copy, reproduce, distribute, modify or reuse this content without our prior written permission, except where permitted by law.`,
        },
      ],
    },
    {
      title: "Personal data",
      blocks: [
        {
          type: "p",
          text: "If you choose to share your email address or other personal information, we will only use it to communicate with you about Voicia and our services, unless another lawful basis applies. For details on how we handle your data, please see our Privacy Policy.",
        },
      ],
    },
    {
      title: "No warranty",
      blocks: [
        {
          type: "p",
          text: 'This website is provided "as is" without warranties of any kind. We do not guarantee that the site will be error-free, uninterrupted, continuously available, secure, or suitable for your specific needs.',
        },
      ],
    },
    {
      title: "Limitation of liability",
      blocks: [
        {
          type: "p",
          text: `To the maximum extent permitted by applicable law, ${COMPANY.name} is not liable for any direct or indirect damages resulting from using, or being unable to use, this website.`,
        },
      ],
    },
    {
      title: "External links",
      blocks: [
        {
          type: "p",
          text: "We may include links to other websites. We are not responsible for their content, availability, security, privacy practices, or terms.",
        },
      ],
    },
    {
      title: "Changes to these terms",
      blocks: [
        {
          type: "p",
          text: "We may update these terms from time to time. The latest version will always be available on this page, with the updated date shown at the top.",
        },
      ],
    },
    {
      title: "Governing law",
      blocks: [
        {
          type: "p",
          text: "These terms are governed by Belgian law. Any disputes will be resolved by the competent courts in Belgium.",
        },
      ],
    },
  ],
}

const fr: LegalDocument = {
  title: "Conditions d'utilisation",
  intro:
    "Bienvenue sur le site de Voicia. En accédant à ce site ou en l'utilisant, vous acceptez les présentes conditions d'utilisation. Si vous ne les acceptez pas, veuillez ne pas utiliser le site.",
  sections: [
    {
      title: "Qui sommes-nous",
      blocks: [
        {
          type: "p",
          text: `Ce site est exploité par ${COMPANY.name}, société établie en Belgique, dont le siège social est situé ${COMPANY.address}, Belgique, et inscrite à la Banque-Carrefour des Entreprises sous le numéro ${COMPANY.number}. Pour toute question, contactez-nous à ${CONTACT_EMAIL}.`,
        },
      ],
    },
    {
      title: "Utilisation du site",
      blocks: [
        {
          type: "p",
          text: "Vous vous engagez à utiliser ce site de manière licite et respectueuse. Vous ne pouvez pas tenter de perturber son fonctionnement, faire un usage abusif de son contenu ou y accéder de manière non autorisée.",
        },
      ],
    },
    {
      title: "Propriété intellectuelle",
      blocks: [
        {
          type: "p",
          text: `Tout le contenu de ce site, y compris les textes, visuels, logos, éléments de marque, mises en page, descriptions de produits et autres éléments, appartient à ${COMPANY.name} ou à ses concédants de licence, sauf mention contraire. Vous ne pouvez pas copier, reproduire, distribuer, modifier ou réutiliser ce contenu sans notre autorisation écrite préalable, sauf dans les cas permis par la loi.`,
        },
      ],
    },
    {
      title: "Données personnelles",
      blocks: [
        {
          type: "p",
          text: "Si vous choisissez de nous communiquer votre adresse e-mail ou d'autres informations personnelles, nous ne les utiliserons que pour vous contacter au sujet de Voicia et de nos services, sauf autre base légale applicable. Pour savoir comment nous traitons vos données, consultez notre politique de confidentialité.",
        },
      ],
    },
    {
      title: "Absence de garantie",
      blocks: [
        {
          type: "p",
          text: "Ce site est fourni « en l'état », sans garantie d'aucune sorte. Nous ne garantissons pas qu'il sera exempt d'erreurs, ininterrompu, disponible en permanence, sécurisé ou adapté à vos besoins particuliers.",
        },
      ],
    },
    {
      title: "Limitation de responsabilité",
      blocks: [
        {
          type: "p",
          text: `Dans toute la mesure permise par la loi applicable, ${COMPANY.name} ne peut être tenue responsable d'aucun dommage direct ou indirect résultant de l'utilisation de ce site ou de l'impossibilité de l'utiliser.`,
        },
      ],
    },
    {
      title: "Liens externes",
      blocks: [
        {
          type: "p",
          text: "Ce site peut contenir des liens vers d'autres sites. Nous ne sommes pas responsables de leur contenu, de leur disponibilité, de leur sécurité, de leurs pratiques en matière de vie privée ni de leurs conditions.",
        },
      ],
    },
    {
      title: "Modification des conditions",
      blocks: [
        {
          type: "p",
          text: "Nous pouvons mettre à jour ces conditions de temps à autre. La dernière version est toujours disponible sur cette page, avec sa date de mise à jour indiquée en haut.",
        },
      ],
    },
    {
      title: "Droit applicable",
      blocks: [
        {
          type: "p",
          text: "Ces conditions sont régies par le droit belge. Tout litige sera soumis aux tribunaux compétents de Belgique.",
        },
      ],
    },
  ],
}

export const TERMS = { en, fr }
