/**
 * i18n — lightweight translations for Fix It Please !!
 *
 * Two separate language settings:
 *  1. `uiLang` — controls the app interface language
 *  2. `messageLang` — controls the language of the repair request sent to the landlord
 */

const translations = {
    en: {
        // Layout / Nav
        appTitle: 'Fix it Please !!',
        navHome: 'Home',
        navRepair: 'Repair',
        navVault: 'Vault',
        navNotes: 'Notes',
        navSettings: 'Settings',

        // Home
        homeGreeting: 'What do you need?',
        installTitle: 'Get the App',
        installSubtitle: 'Install Fix it Please !! on your home screen',
        fixSomething: 'Fix Something',
        fixSomethingDesc: 'Report an issue to your landlord via text or email.',
        requestHistory: 'Request History',
        requestHistoryDesc: 'Track the status of your past requests.',
        documentVault: 'Document Vault',
        documentVaultDesc: 'Store your lease, walkthrough photos, and receipts.',
        recordNote: 'Record a Note',
        recordNoteDesc: 'Type or speak to create a quick record of anything.',

        // Repair Request — steps
        whatsTheProblem: "What's the problem?",
        tapToSelect: 'Tap to select',
        whereIsIt: 'Where is it?',
        tapTheLocation: 'Tap the location',
        howUrgent: 'How urgent?',
        addPhoto: 'Add a photo (optional)',
        takePhoto: 'Take Photo',
        remove: 'Remove',
        reviewAndSend: 'Review & Send',

        // Repair — issue types
        issuePlumbing: 'Plumbing',
        issueElectrical: 'Electrical',
        issueAppliance: 'Appliance',
        issueHvac: 'Heat / AC',
        issuePest: 'Pests',
        issueLock: 'Lock / Door',
        issueWindow: 'Window',
        issueWaterDamage: 'Water Damage',
        issueMold: 'Mold',
        issueStructural: 'Structural',
        issueOther: 'Other',

        // Repair — locations
        locKitchen: 'Kitchen',
        locBathroom: 'Bathroom',
        locBedroom: 'Bedroom',
        locLivingRoom: 'Living Room',
        locHallway: 'Hallway',
        locLaundry: 'Laundry',
        locBasement: 'Basement',
        locExterior: 'Outside / Common',

        // Repair — urgency
        urgencyLow: 'Low',
        urgencyNormal: 'Normal',
        urgencyHigh: 'High',
        urgencyEmergency: 'Emergency',

        // Repair — summary & send
        summaryIssue: 'Issue',
        summaryLocation: 'Location',
        summaryUrgency: 'Urgency',
        summaryPhoto: 'Photo',
        summaryAttached: 'Attached',
        yourInfo: 'Your info (for the request)',
        yourName: 'Your name',
        yourAddress: 'Your address',
        yourPhoneOptional: 'Your phone (optional)',
        yourEmailOptional: 'Your email (optional)',
        wellRemember: "We'll remember this for next time.",
        whoShouldThisGoTo: 'Who should this go to?',
        landlordNamePlaceholder: 'Landlord name',
        phonePlaceholder: 'Phone number',
        emailPlaceholder: 'Email address',
        sendText: 'Text',
        sendEmail: 'Email',
        back: 'Back',
        next: 'Next',

        // Records
        history: 'History',
        trackRequests: 'Track the status of your past requests.',
        noRequestsYet: "No requests yet. They'll appear here after you submit one.",
        unknownDate: 'Unknown date',
        statusPending: 'Pending',
        statusInProgress: 'In Progress',
        statusResolved: 'Resolved',

        // Notes
        notes: 'Notes',
        recordAnything: 'Record anything you need to remember.',
        newNote: 'New Note',
        typeOrSpeak: 'Type your note or tap the mic to speak...',
        stop: 'Stop',
        speak: 'Speak',
        saveNote: 'Save Note',
        noNotesYet: 'No notes yet. Tap the button above to create one.',
        speechNotSupported: 'Speech recognition is not supported on this device.',

        // Vault
        documentVaultTitle: 'Document Vault',
        keepFilesOrganized: 'Keep your important files organized and accessible.',
        leaseContract: 'Lease / Contract',
        walkthroughPhotos: 'Walkthrough Photos',
        receipts: 'Receipts',
        lettersEmails: 'Letters / Emails',
        other: 'Other',
        items: 'items',
        backToFolders: '← Back to folders',
        uploadFileOrPhoto: 'Upload File or Photo',
        noFilesYet: 'No files yet. Tap above to add.',

        // Settings
        settings: 'Settings',
        settingsSubtitle: "Set up your info once — it'll be used automatically in your repair requests.",
        yourInfoSection: 'Your Info',
        yourNameLabel: 'Your Name',
        yourAddressLabel: 'Your Address',
        yourPhoneLabel: 'Your Phone',
        yourEmailLabel: 'Your Email',
        landlordSection: 'Landlord / Manager',
        landlordNameLabel: 'Name',
        landlordPhoneLabel: 'Phone Number',
        landlordEmailLabel: 'Email Address',
        saveSettings: 'Save Settings',
        saved: 'Saved!',
        languageSection: 'Language / Idioma',
        appLanguage: 'App Language',
        messageLanguage: 'Repair Message Language',
        messageLanguageHint: 'The language used when sending repair requests to your landlord.',
        langEnglish: 'English',
        langSpanish: 'Español',
    },

    es: {
        // Layout / Nav
        appTitle: 'Fix it Please !!',
        navHome: 'Inicio',
        navRepair: 'Reparar',
        navVault: 'Archivos',
        navNotes: 'Notas',
        navSettings: 'Ajustes',

        // Home
        homeGreeting: '¿Qué necesitas?',
        installTitle: 'Obtener la App',
        installSubtitle: 'Instala Fix it Please !! en tu pantalla de inicio',
        fixSomething: 'Reparar Algo',
        fixSomethingDesc: 'Reporta un problema a tu casero por texto o correo.',
        requestHistory: 'Historial',
        requestHistoryDesc: 'Sigue el estado de tus solicitudes pasadas.',
        documentVault: 'Almacén de Documentos',
        documentVaultDesc: 'Guarda tu contrato, fotos y recibos.',
        recordNote: 'Grabar una Nota',
        recordNoteDesc: 'Escribe o habla para crear un registro rápido.',

        // Repair Request — steps
        whatsTheProblem: '¿Cuál es el problema?',
        tapToSelect: 'Toca para seleccionar',
        whereIsIt: '¿Dónde está?',
        tapTheLocation: 'Toca la ubicación',
        howUrgent: '¿Qué tan urgente?',
        addPhoto: 'Agregar foto (opcional)',
        takePhoto: 'Tomar Foto',
        remove: 'Quitar',
        reviewAndSend: 'Revisar y Enviar',

        // Repair — issue types
        issuePlumbing: 'Plomería',
        issueElectrical: 'Electricidad',
        issueAppliance: 'Electrodoméstico',
        issueHvac: 'Calefacción / AC',
        issuePest: 'Plagas',
        issueLock: 'Cerradura / Puerta',
        issueWindow: 'Ventana',
        issueWaterDamage: 'Daño por Agua',
        issueMold: 'Moho',
        issueStructural: 'Estructural',
        issueOther: 'Otro',

        // Repair — locations
        locKitchen: 'Cocina',
        locBathroom: 'Baño',
        locBedroom: 'Dormitorio',
        locLivingRoom: 'Sala',
        locHallway: 'Pasillo',
        locLaundry: 'Lavandería',
        locBasement: 'Sótano',
        locExterior: 'Exterior / Común',

        // Repair — urgency
        urgencyLow: 'Baja',
        urgencyNormal: 'Normal',
        urgencyHigh: 'Alta',
        urgencyEmergency: 'Emergencia',

        // Repair — summary & send
        summaryIssue: 'Problema',
        summaryLocation: 'Ubicación',
        summaryUrgency: 'Urgencia',
        summaryPhoto: 'Foto',
        summaryAttached: 'Adjunta',
        yourInfo: 'Tu información (para la solicitud)',
        yourName: 'Tu nombre',
        yourAddress: 'Tu dirección',
        yourPhoneOptional: 'Tu teléfono (opcional)',
        yourEmailOptional: 'Tu correo (opcional)',
        wellRemember: 'Lo recordaremos para la próxima vez.',
        whoShouldThisGoTo: '¿A quién va dirigido?',
        landlordNamePlaceholder: 'Nombre del casero',
        phonePlaceholder: 'Número de teléfono',
        emailPlaceholder: 'Correo electrónico',
        sendText: 'Texto',
        sendEmail: 'Correo',
        back: 'Atrás',
        next: 'Siguiente',

        // Records
        history: 'Historial',
        trackRequests: 'Sigue el estado de tus solicitudes pasadas.',
        noRequestsYet: 'Aún no hay solicitudes. Aparecerán aquí después de enviar una.',
        unknownDate: 'Fecha desconocida',
        statusPending: 'Pendiente',
        statusInProgress: 'En Progreso',
        statusResolved: 'Resuelto',

        // Notes
        notes: 'Notas',
        recordAnything: 'Registra cualquier cosa que necesites recordar.',
        newNote: 'Nueva Nota',
        typeOrSpeak: 'Escribe tu nota o toca el micrófono para hablar...',
        stop: 'Parar',
        speak: 'Hablar',
        saveNote: 'Guardar Nota',
        noNotesYet: 'Aún no hay notas. Toca el botón de arriba para crear una.',
        speechNotSupported: 'El reconocimiento de voz no es compatible con este dispositivo.',

        // Vault
        documentVaultTitle: 'Almacén de Documentos',
        keepFilesOrganized: 'Mantén tus archivos importantes organizados y accesibles.',
        leaseContract: 'Contrato de Alquiler',
        walkthroughPhotos: 'Fotos de Inspección',
        receipts: 'Recibos',
        lettersEmails: 'Cartas / Correos',
        other: 'Otro',
        items: 'archivos',
        backToFolders: '← Volver a carpetas',
        uploadFileOrPhoto: 'Subir Archivo o Foto',
        noFilesYet: 'No hay archivos aún. Toca arriba para agregar.',

        // Settings
        settings: 'Ajustes',
        settingsSubtitle: 'Configura tu información una vez — se usará automáticamente en tus solicitudes de reparación.',
        yourInfoSection: 'Tu Información',
        yourNameLabel: 'Tu Nombre',
        yourAddressLabel: 'Tu Dirección',
        yourPhoneLabel: 'Tu Teléfono',
        yourEmailLabel: 'Tu Correo',
        landlordSection: 'Casero / Administrador',
        landlordNameLabel: 'Nombre',
        landlordPhoneLabel: 'Número de Teléfono',
        landlordEmailLabel: 'Correo Electrónico',
        saveSettings: 'Guardar Ajustes',
        saved: '¡Guardado!',
        languageSection: 'Language / Idioma',
        appLanguage: 'Idioma de la App',
        messageLanguage: 'Idioma del Mensaje de Reparación',
        messageLanguageHint: 'El idioma usado al enviar solicitudes de reparación a tu casero.',
        langEnglish: 'English',
        langSpanish: 'Español',
    },
};

// Message-only translations (for the repair request body sent to landlord)
const messageTranslations = {
    en: {
        maintenanceRequest: 'Maintenance Request',
        to: 'To',
        from: 'From',
        address: 'Address',
        contactPhone: 'Contact Phone',
        contactEmail: 'Contact Email',
        issue: 'Issue',
        location: 'Location',
        urgency: 'Urgency',
        footer: 'This request was made via Fix It Please !! — https://fix.rent',
        emailSubject: 'Maintenance Request',

        // Issue types for message
        issuePlumbing: 'Plumbing',
        issueElectrical: 'Electrical',
        issueAppliance: 'Appliance',
        issueHvac: 'Heat / AC',
        issuePest: 'Pests',
        issueLock: 'Lock / Door',
        issueWindow: 'Window',
        issueWaterDamage: 'Water Damage',
        issueMold: 'Mold',
        issueStructural: 'Structural',
        issueOther: 'Other',

        // Locations for message
        locKitchen: 'Kitchen',
        locBathroom: 'Bathroom',
        locBedroom: 'Bedroom',
        locLivingRoom: 'Living Room',
        locHallway: 'Hallway',
        locLaundry: 'Laundry',
        locBasement: 'Basement',
        locExterior: 'Outside / Common',

        // Urgency for message
        urgencyLow: 'LOW',
        urgencyNormal: 'NORMAL',
        urgencyHigh: 'HIGH',
        urgencyEmergency: 'EMERGENCY',
    },
    es: {
        maintenanceRequest: 'Solicitud de Reparación',
        to: 'Para',
        from: 'De',
        address: 'Dirección',
        contactPhone: 'Teléfono de Contacto',
        contactEmail: 'Correo de Contacto',
        issue: 'Problema',
        location: 'Ubicación',
        urgency: 'Urgencia',
        footer: 'Esta solicitud fue hecha con Fix It Please !! — https://fix.rent',
        emailSubject: 'Solicitud de Reparación',

        // Issue types for message
        issuePlumbing: 'Plomería',
        issueElectrical: 'Electricidad',
        issueAppliance: 'Electrodoméstico',
        issueHvac: 'Calefacción / AC',
        issuePest: 'Plagas',
        issueLock: 'Cerradura / Puerta',
        issueWindow: 'Ventana',
        issueWaterDamage: 'Daño por Agua',
        issueMold: 'Moho',
        issueStructural: 'Estructural',
        issueOther: 'Otro',

        // Locations for message
        locKitchen: 'Cocina',
        locBathroom: 'Baño',
        locBedroom: 'Dormitorio',
        locLivingRoom: 'Sala',
        locHallway: 'Pasillo',
        locLaundry: 'Lavandería',
        locBasement: 'Sótano',
        locExterior: 'Exterior / Común',

        // Urgency for message
        urgencyLow: 'BAJA',
        urgencyNormal: 'NORMAL',
        urgencyHigh: 'ALTA',
        urgencyEmergency: 'EMERGENCIA',
    },
};

// Map issue IDs to translation keys
export const ISSUE_KEY_MAP = {
    plumbing: 'issuePlumbing',
    electrical: 'issueElectrical',
    appliance: 'issueAppliance',
    hvac: 'issueHvac',
    pest: 'issuePest',
    lock: 'issueLock',
    window: 'issueWindow',
    water_damage: 'issueWaterDamage',
    mold: 'issueMold',
    structural: 'issueStructural',
    other: 'issueOther',
};

export const LOCATION_KEY_MAP = {
    kitchen: 'locKitchen',
    bathroom: 'locBathroom',
    bedroom: 'locBedroom',
    living_room: 'locLivingRoom',
    hallway: 'locHallway',
    laundry: 'locLaundry',
    basement: 'locBasement',
    exterior: 'locExterior',
};

export const URGENCY_KEY_MAP = {
    low: 'urgencyLow',
    normal: 'urgencyNormal',
    high: 'urgencyHigh',
    emergency: 'urgencyEmergency',
};

/**
 * Get a translation string for the UI language
 */
export function t(key, lang = 'en') {
    return translations[lang]?.[key] || translations.en[key] || key;
}

/**
 * Get a translation string for the message language (repair request body)
 */
export function tm(key, lang = 'en') {
    return messageTranslations[lang]?.[key] || messageTranslations.en[key] || key;
}

export default translations;
