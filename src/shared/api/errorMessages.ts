/**
 * The API answers in English; this is the French wording of every message it can send.
 * $1, $2... are the parts captured from the English message. A message missing from the list is
 * shown as the API wrote it, which is better than hiding what went wrong.
 */
const MESSAGES: [RegExp, string][] = [
  // Accounts
  [/^invalid email or password$/, "E-mail ou mot de passe incorrect."],
  [/^an account with this email already exists$/, "Un compte existe déjà avec cette adresse e-mail."],
  [/^this account is deactivated$/, "Ce compte a été désactivé."],
  [/^current password is incorrect$/, "Le mot de passe actuel est incorrect."],
  [/password must be at least 8 characters/, "Le mot de passe doit contenir au moins 8 caractères."],
  [/^this username is already taken$/, "Ce nom d'utilisateur est déjà pris."],
  [/^username must be 3 to 50 characters/, "Le nom d'utilisateur compte 3 à 50 caractères : minuscules, chiffres, points ou tirets bas."],
  [/^birthDate must be in the past$/, "La date de naissance doit être dans le passé."],
  [/^this link has expired or was already used$/, "Ce lien a expiré ou a déjà été utilisé."],
  [/^this email is already verified$/, "Cette adresse e-mail est déjà vérifiée."],
  [/^you cannot deactivate your own account$/, "Vous ne pouvez pas désactiver votre propre compte."],

  // Booking a unit
  [/^(.+) takes at most (\d+) guest\(s\)$/, "$1 accueille au maximum $2 personne(s)."],
  [/^(.+) is already booked for these dates$/, "$1 est déjà réservé(e) sur cette période."],
  [/^(.+) has only (\d+) place\(s\) left$/, "Il ne reste que $2 place(s) pour $1."],
  [/^(.+) is not available for booking$/, "$1 n'est pas ouvert(e) à la réservation."],
  [/^(.+) can only be booked for a future date$/, "Choisissez une date à venir."],
  [/^the end must be after the start$/, "La fin doit être après le début."],
  [/^a stay must last at least one night$/, "Un séjour dure au moins une nuit."],
  [/^a start and an end are required$/, "Indiquez un début et une fin."],
  [/^a start date is required$/, "Indiquez une date de départ."],
  [/^a start time is required$/, "Indiquez une date et une heure."],
  [/^you cannot book a listing of a provider you work for$/, "Vous ne pouvez pas réserver une annonce de votre propre entreprise."],
  [/^this listing is not open for bookings$/, "Cette annonce n'accepte pas de réservations pour le moment."],
  [/^this unit does not belong to the listing$/, "Cette offre n'appartient pas à l'annonce."],

  // Following a booking
  [/^a booking can no longer be cancelled once it has started$/, "Une réservation commencée ne peut plus être annulée."],
  [/^a no-show can only be recorded once the booking has started$/, "L'absence ne peut être signalée qu'après le début de la réservation."],
  [/^a booking can only be completed after it ends$/, "Une réservation ne se termine qu'après sa fin."],
  [/^a (\w+) booking cannot become (\w+)$/, "Cette réservation n'est plus modifiable dans son état actuel."],
  [/^this booking is not yours$/, "Cette réservation n'est pas la vôtre."],
  [/^this booking has already been reviewed$/, "Vous avez déjà laissé un avis pour cette réservation."],
  [/^you can review a booking once it is completed$/, "Vous pourrez laisser un avis une fois la réservation terminée."],
  [/^only the client who booked can review it$/, "Seul le client qui a réservé peut laisser un avis."],

  // Providers and teams
  [/^you are not a member of this provider$/, "Vous ne faites pas partie de cette entreprise."],
  [/^only owners and managers can manage listings$/, "Seuls les propriétaires et les gestionnaires peuvent modifier les annonces."],
  [/^only owners can change the company details$/, "Seul un propriétaire peut modifier les informations de l'entreprise."],
  [/^you cannot manage team members with the role (\w+)$/, "Votre rôle ne permet pas de gérer ce membre."],
  [/^no account uses (.+); ask this person to sign up first$/, "Aucun compte n'utilise $1 : cette personne doit d'abord s'inscrire."],
  [/^(.+) is already in this team$/, "$1 fait déjà partie de l'équipe."],
  [/^this member is already suspended$/, "Ce membre est déjà suspendu."],
  [/^a provider must keep at least one active owner$/, "Une entreprise doit garder au moins un propriétaire actif."],
  [/^only a pending or suspended provider can be approved$/, "Seul un prestataire en attente ou suspendu peut être validé."],
  [/^only a pending provider can be rejected$/, "Seul un prestataire en attente peut être refusé."],
  [/^only an approved provider can be suspended$/, "Seul un prestataire validé peut être suspendu."],

  // Listings and units
  [/^listings go live once the provider is approved$/, "L'annonce pourra être mise en ligne une fois votre entreprise validée."],
  [/^this listing has been deleted$/, "Cette annonce a été supprimée."],
  [/^the currency of a listing cannot change once it is created$/, "La devise d'une annonce ne change plus après sa création."],
  [/^a \w+ listing cannot (offer|get) /, "Cette offre ne correspond pas au type de l'annonce."],
  [/^a \w+ (listing|unit) needs its details object$/, "Les informations propres à ce type sont manquantes."],
  [/units (need|take) /, "Les informations de l'offre ne correspondent pas à son type."],
  [/^the type of a unit cannot change$/, "Le type d'une offre ne change plus après sa création."],
  [/^cannot add units to a deleted listing$/, "Cette annonce a été supprimée."],
  [/^this unit has been deleted$/, "Cette offre a été supprimée."],
  [/^another car already uses the plate (.+)$/, "Une autre voiture porte déjà l'immatriculation $1."],
  [/^tour steps must be numbered/, "Les étapes du circuit doivent se suivre sans trou."],
  [/^tour steps must be in day order$/, "Les étapes du circuit doivent suivre l'ordre des jours."],
  [/^step (\d+) is on day (\d+) but the tour lasts (\d+) days$/, "L'étape $1 est au jour $2, mais le circuit dure $3 jour(s)."],
  [/^latitude and longitude must be given together$/, "La latitude et la longitude vont ensemble."],
  [/^(latitude|longitude) must be between/, "Les coordonnées sont hors limites."],
  [/^unknown timezone: (.+)$/, "Fuseau horaire inconnu : $1."],
  [/^currency must be a 3-letter ISO code/, "La devise est un code à 3 lettres, par exemple EUR."],
  [/must be a 2-letter (ISO )?country code/, "Le pays est un code à 2 lettres, par exemple MA."],
  [/^a photo belongs to a listing or to a unit, not both$/, "Une photo appartient à une annonce ou à une offre, pas aux deux."],

  // Search
  [/^minPrice cannot be above maxPrice$/, "Le prix minimum dépasse le prix maximum."],
  [/^a price cannot be negative$/, "Un prix ne peut pas être négatif."],

  // Generic
  [/^(.+) not found: /, "Élément introuvable."],
  [/^this change conflicts with existing data$/, "Cette modification entre en conflit avec des données existantes."],
  [/^the request body is not valid JSON/, "La demande envoyée est illisible."],
  [/^invalid value for (\w+)$/, "Valeur invalide pour « $1 »."],
  [/^an unexpected error occurred$/, "Une erreur inattendue est survenue. Veuillez réessayer."],
];

const FIELDS: Record<string, string> = {
  name: "Le nom",
  firstName: "Le prénom",
  lastName: "Le nom",
  email: "L'e-mail",
  password: "Le mot de passe",
  newPassword: "Le nouveau mot de passe",
  currentPassword: "Le mot de passe actuel",
  username: "Le nom d'utilisateur",
  phone: "Le téléphone",
  companyName: "Le nom commercial",
  legalName: "La raison sociale",
  taxId: "L'identifiant fiscal",
  description: "La description",
  address: "L'adresse",
  city: "La ville",
  countryCode: "Le pays",
  nationality: "La nationalité",
  timezone: "Le fuseau horaire",
  currency: "La devise",
  basePrice: "Le prix",
  capacity: "La capacité",
  guestsCount: "Le nombre de voyageurs",
  rating: "La note",
  comment: "Le commentaire",
  text: "Le texte",
  reason: "Le motif",
  roomNumber: "Le numéro de chambre",
  roomType: "Le type de chambre",
  brand: "La marque",
  model: "Le modèle",
  year: "L'année",
  doors: "Le nombre de portes",
  plateNumber: "L'immatriculation",
  mileageLimitKm: "La limite de kilométrage",
  durationDays: "La durée",
  licenseNumber: "Le numéro de licence",
  minDriverAge: "L'âge minimum du conducteur",
  depositAmount: "La caution",
  stars: "Le nombre d'étoiles",
  yearsExperience: "Les années d'expérience",
  cuisineType: "Le type de cuisine",
  role: "Le rôle",
  url: "L'adresse de la photo",
};

/** The rules that name a field: "<field> is required", or "<field>: must not be blank" from request validation. */
const FIELD_RULES: [RegExp, string][] = [
  [/^:? ?(is required|must not be (blank|null|empty))$/, "est obligatoire"],
  [/^:? ?must be at most (\d+) characters$/, "ne dépasse pas $1 caractères"],
  [/^:? ?size must be between (\d+) and (\d+)$/, "compte entre $1 et $2 caractères"],
  [/^:? ?must be positive$|^:? ?must be greater than 0$/, "doit être supérieur à zéro"],
  [/^:? ?cannot be negative$|^:? ?must be greater than or equal to 0$/, "ne peut pas être négatif"],
  [/^:? ?must be between (-?\d+) and (-?\d+)$/, "doit être entre $1 et $2"],
  [/^:? ?must be (greater|less) than or equal to (\d+)$/, "est hors limites ($2)"],
  [/^:? ?must be a (valid|well-formed) email address$/, "n'est pas une adresse e-mail valide"],
  [/^:? ?must be a past date$/, "doit être dans le passé"],
  [/^:? ?must be a 3-letter currency code$/, "est un code à 3 lettres, par exemple EUR"],
];

function fill(template: string, match: RegExpExecArray): string {
  return template.replace(/\$(\d)/g, (_, group) => match[Number(group)] ?? "");
}

function translateOne(message: string): string {
  for (const [pattern, french] of MESSAGES) {
    const match = pattern.exec(message);
    if (match) return fill(french, match);
  }
  // "tour.steps[0].city: must not be blank" names the field by its last part.
  const named = /^([\w.[\]]+?)(: | )(.+)$/.exec(message);
  if (named) {
    const field = named[1].replace(/\[\d+\]/g, "").split(".").pop()!;
    for (const [pattern, french] of FIELD_RULES) {
      const match = pattern.exec(named[3]);
      if (match) return `${FIELDS[field] ?? `Le champ « ${field} »`} ${fill(french, match)}.`;
    }
  }
  return message;
}

export function translate(message: string): string {
  const whole = translateOne(message);
  if (whole !== message) return whole;
  // Request validation reports several fields at once, separated by "; ".
  return message.split("; ").map(translateOne).join(" ");
}
