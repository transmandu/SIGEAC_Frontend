export interface ActionStep {
  title: string;
  role: string;
  items: string[];
}

export interface CardData {
  imageUrl: string;
  imageAlt: string;
  title: string;
  description: string;
  actionLink: {
    href: string;
    label: string;
  };
}

export interface EmergencyPlan {
  cardData: CardData;
  actionSteps: ActionStep[];
}

export const emergencyPlans: EmergencyPlan[] = [
  {
    //PRIMERA CARTA
    cardData: {
      imageUrl: "/plane1.jpg",
      imageAlt: "Conato de incendio en hangar con aeronave en servicio",
      title: "EMERGENCIA",
      description:
        "Incendio controlado con aeronave en servicio, en las instalaciones de la OMA principal de ESTELAR TECHNIK.",
      actionLink: {
        href: "#",
        label: "Ver acción",
      },
    },
    actionSteps: [
      {
        title: "Tarjeta de Acción",
        role: "PRIMER NOTIFICADOR",
        items: [
          "Presione la alarma de incendio.",
          "Notifique a los bomberos aeronáuticos.",
          "Notifique a su Jefe inmediato.",
          "Maneje el extintor de 150lbs asignado a la aeronave en servicio.",
          "Tira del perno de seguridad del mango.",
          "Apunta la boca del extintor hacia la base del fuego.",
          "Aprieta el mango para descargar el agente (Si sueltas el mango se cerrará la descarga).",
          "Barre horizontalmente hasta que el extintor se gaste.",
          "Una vez extinguido el fuego, de manera visual verifique si existen heridos y reporta la situación.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "JEFE INMEDIATO",
        items: [
          "Recibe la información.",
          "Se asegurará de notificar al Coordinador del Plan de Respuesta Ante la Emergencia.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Evaluará la situación.",
          "Si el fuego fue controlado y no hubo heridos no activara el Plan de Respuesta Ante la Emergencia.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "En caso de heridos leves notificará al Grupo de Asistencia para la coordinación de la atención médica a los trabajadores afectados.",
          "Notificara a la Organización de Respuesta Ante la Emergencia (ORE).",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "ORGANIZACIÓN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Recibe la información.",
          "Realiza inspección de las instalaciones en acompañamiento de los bomberos aeronáuticos para evaluar la estructura y los daños.",
          "Notifica al presidente sobre los daños y recursos requeridos para continuar con los servicios.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "PRESIDENTE",
        items: [
          "Recibe la información.",
          "Evaluará la situación.",
          "Autoriza los recursos y el reinicio de las actividades.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Solicitará el Reporte Obligatorio de Incidencias a las personas que presenciaron la incidencia.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "PERSONAL QUE PRESENCIO LA INCIDENCIA",
        items: [
          "Realiza el Reporte Obligatorio de Incidencias a través de las vías establecidas para el reporte de SMS.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Recibe la información y registra en la base de datos de incidencias para la toma de decisión en cuanto a las acciones correctivas de prevención.",
        ],
      },
    ],
  },
  // SEGUNDA CARTA
  {
    cardData: {
      imageUrl: "/plane1.jpg",
      imageAlt: "Incendio no controlado en hangar con aeronave en servicio",
      title: "EMERGENCIA",
      description:
        "Incendio no controlado con aeronave en servicio, en las instalaciones de la OMA principal de ESTELAR TECHNIK.",
      actionLink: {
        href: "#",
        label: "Ver acción",
      },
    },
    actionSteps: [
      {
        title: "Tarjeta de Acción",
        role: "PRIMER NOTIFICADOR",
        items: [
          "Presione la alarma de incendio.",
          "Notifique a los bomberos aeronáuticos.",
          "Notifique a su Jefe inmediato.",
          "Maneje el extintor de 150lbs asignado a la aeronave en servicio.",
          "Tira del perno de seguridad del mango.",
          "Apunta la boca del extintor hacia la base del fuego.",
          "Aprieta el mango para descargar el agente (Si sueltas el mango se cerrará la descarga).",
          "Barre horizontalmente hasta que el extintor se gaste.",
          "Si el fuego no puede ser controlado retírese del lugar, ubique una zona segura, hasta que los bomberos puedan atender la situación.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "JEFE INMEDIATO",
        items: [
          "Recibe la información.",
          "Se asegurará de notificar al Coordinador del Plan de Respuesta Ante la Emergencia.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Si el fuego no fue controlado activara el Plan de Respuesta Ante la Emergencia.",
          "Notificará al Gerente General.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "GERENTE GENERAL",
        items: [
          "Recibe la información",
          "Notifica al Grupo de Asistencia y al Grupo Operativo para iniciar el proceso de desalojo de las instalaciones.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "GRUPO ASISTENCIA / GRUPO OPERATIVO",
        items: [
          "El líder del Grupo de asistencia va a dirigir el desalojo del personal a través de la ruta más segura.",
          "Los brigadistas guiarán a las personas con el apoyo del Grupo Operativo a través de la ruta trazada, asegurándose de que ningún trabajador se separe del grupo.",
          "El líder del Grupo de asistencia se ubicará en el punto de encuentro, donde recibirá a los trabajadores y coordinará la atención médica.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "BOMBEROS",
        items: [
          "Aplican el procedimiento de extinción de incendio.",
          "Luego de tener el control del lugar, proceden a ubicar al gerente general para realizar las inspecciones del área afectada.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "GERENTE GENERAL",
        items: [
          "Comunicará al presidente sobre el desarrollo de la emergencia, los daños y las causas que origino el incidente.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "PRESIDENTE",
        items: [
          "Recibe la información.",
          "Evaluará la situación.",
          "Convocará una reunión con el grupo de la organización de respuesta ante la emergencia.",
          "Autoriza los recursos necesarios y el inicio de las actividades.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Solicitará el Reporte Obligatorio de Incidencias a las personas que presenciaron la incidencia.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "PERSONAL QUE PRESENCIO LA INCIDENCIA",
        items: [
          "Realiza el Reporte Obligatorio de Incidencias a través de las vías establecidas para el reporte de SMS.",
        ],
      },
    ],
  },
  //TERCERA CARTA
  {
    cardData: {
      imageUrl: "/plane1.jpg",
      imageAlt: "Conato de incendio en las edificaciones",
      title: "EMERGENCIA",
      description:
        "Incendio controlado en las edificaciones de ESTELAR TECHNIK.",
      actionLink: {
        href: "#",
        label: "Ver acción",
      },
    },
    actionSteps: [
      {
        title: "Tarjeta de Acción",
        role: "PRIMER NOTIFICADOR",
        items: [
          "Presione la alarma de incendio.",
          "Notifique a los bomberos aeronáuticos.",
          "Notifique a su Jefe inmediato.",
          "Tome el extintor de pared más cercano.",
          "Retire el pasador de seguridad.",
          "Apunta la boca del extintor hacia la base del fuego.",
          "Aprieta la palanca y haga un barrido horizontalmente hasta que el fuego se extinga.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "JEFE INMEDIATO",
        items: [
          "Recibe la información.",
          "Se asegurará de notificar al Coordinador del Plan de Respuesta Ante la Emergencia.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Evaluará la situación.",
          "Si el fuego fue controlado y no hubo heridos no activara el Plan de Respuesta Ante la Emergencia.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "En caso de heridos leves notificará al Grupo de Asistencia para la coordinación de la atención médica a los trabajadores afectados.",
          "Realiza inspección a las edificaciones en acompañamiento de los bomberos aeronáuticos para evaluar la estructura y daños.",
          "Notifica al presidente sobre los daños y recursos requeridos para reiniciar las actividades en el lugar.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "GERENTE RESPONSABLE",
        items: [
          "Recibe la información.",
          "Evaluará la situación.",
          "Autoriza los recursos y el reinicio de las actividades.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Solicitará el Reporte Obligatorio de Incidencias a las personas que presenciaron la incidencia.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "PERSONAL QUE PRESENCIO LA INCIDENCIA",
        items: [
          "Realiza el Reporte Obligatorio de Incidencias a través de las vías establecidas para el reporte de SMS.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Recibe la información y registra en la base de datos de incidencias para la toma de decisión en cuanto a las acciones correctivas de prevención.",
        ],
      },
    ],
  },
  //CUARTA CARTA

  {
    cardData: {
      imageUrl: "/plane1.jpg",
      imageAlt: "Incendio no controlado en las edificaciones",
      title: "EMERGENCIA",
      description:
        "Incendio no controlado en las edificaciones de ESTELAR TECHNIK.",
      actionLink: {
        href: "#",
        label: "Ver acción",
      },
    },
    actionSteps: [
      {
        title: "Tarjeta de Acción",
        role: "PRIMER NOTIFICADOR",
        items: [
          "Presione la alarma de incendio.",
          "Notifique a los bomberos aeronáuticos.",
          "Notifique a su Jefe inmediato.",
          "Tome el extintor más cercano y retire el pasador de seguridad.",
          "Apunta la boca del extintor hacia la base del fuego.",
          "Aprieta la palanca y haga un barrido horizontalmente hasta que se agote.",
          "Si el fuego no puede ser controlado retírese del lugar, ubique una zona segura, hasta que los bomberos puedan atender la situación.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "JEFE INMEDIATO",
        items: [
          "Recibe la información.",
          "Se asegurará de notificar al Coordinador del Plan de Respuesta Ante la Emergencia.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Si el fuego no fue controlado activara el Plan de Respuesta Ante la Emergencia.",
          "Notificará al Gerente General.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "GERENTE GENERAL",
        items: [
          "Recibe la información",
          "Notifica al Grupo de Asistencia y al Grupo Operativo para iniciar el proceso de desalojo de las instalaciones.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "GRUPO ASISTENCIA / GRUPO OPERATIVO",
        items: [
          "El líder del Grupo de asistencia va a dirigir el desalojo del personal a través de la ruta más segura.",
          "Los brigadistas guiarán a las personas con el apoyo del Grupo Operativo a través de la ruta trazada, asegurándose de que ningún trabajador se separe del grupo.",
          "El líder del Grupo de asistencia se ubicará en el punto de encuentro, donde recibirá a los trabajadores y coordinará la atención médica.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "BOMBEROS",
        items: [
          "Aplican el procedimiento de extinción de incendio.",
          "Luego de tener el control del lugar, proceden a ubicar al gerente general para realizar las inspecciones del área afectada.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "GERENTE GENERAL",
        items: [
          "Comunicará al presidente sobre el desarrollo de la emergencia, los daños y las causas que originó el incidente.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "PRESIDENTE",
        items: [
          "Recibe la información.",
          "Evaluará la situación.",
          "Convocará una reunión con el grupo de la organización de respuesta ante la emergencia.",
          "Autoriza los recursos necesarios y el reinicio de las actividades en el lugar.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Solicitará el Reporte Obligatorio de Incidencias a las personas que presenciaron la incidencia.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "PERSONAL QUE PRESENCIO LA INCIDENCIA",
        items: [
          "Realiza el Reporte Obligatorio de Incidencias a través de las vías establecidas para el reporte de SMS.",
        ],
      },
    ],
  },
  //QUINTA CARTA
  {
    cardData: {
      imageUrl: "/plane1.jpg",
      imageAlt:
        "Conato de incendio en servicios de mantenimiento OMA adicionales",
      title: "EMERGENCIA",
      description:
        "Incendio controlado en los servicios de mantenimiento en las OMA foráneas de ESTELAR TECHNIK",
      actionLink: {
        href: "#",
        label: "Ver acción",
      },
    },
    actionSteps: [
      {
        title: "Tarjeta de Acción",
        role: "PERSONA PRESENTE EN LA INCIDENCIA",
        items: [
          "Notifique a los bomberos aeronáuticos.",
          "Notifique a su Jefe inmediato.",
          "Maneje el extintor de 150lbs asignado a la aeronave en servicio.",
          "Tira del perno de seguridad del mango.",
          "Apunta la boca del extintor hacia la base del fuego.",
          "Aprieta el mango para descargar el agente (Si sueltas el mango se cerrará la descarga).",
          "Barre horizontalmente hasta que el extintor se gaste.",
          "Una vez Controlado el fuego, de manera visual verifique si existen heridos y reporta la situación.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "JEFE INMEDIATO",
        items: [
          "Recibe la información.",
          "Se asegurará de notificar al Coordinador del Plan de Respuesta Ante la Emergencia.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Evaluará la situación.",
          "Si el fuego fue controlado y no hubo heridos no activara el Plan de Respuesta Ante la Emergencia.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "En caso de heridos leves notificará al Grupo de Asistencia a Víctimas para la coordinación de la atención médica a los trabajadores afectados.",
          "Notificara a la Organización de Respuesta Ante la Emergencia (ORE).",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "ORGANIZACIÓN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Recibe la información.",
          "Solicitará un informe sobre los daños.",
          "Notifica al presidente sobre los daños y recursos requeridos para continuar con los servicios.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "PRESIDENTE",
        items: [
          "Recibe la información.",
          "Evaluará la situación.",
          "Autoriza los recursos y el reinicio de las actividades.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Solicitará el Reporte Obligatorio de Incidencias a las personas que presenciaron la incidencia.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "PERSONAL QUE PRESENCIO LA INCIDENCIA",
        items: [
          "Realiza el Reporte Obligatorio de Incidencias a través de las vías establecidas para el reporte de SMS.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Recibe la información y registra en la base de datos de incidencias para la toma de decisión en cuanto a las acciones correctivas de prevención.",
        ],
      },
    ],
  },
  //SEXTA CARTA
  {
    cardData: {
      imageUrl: "/plane1.jpg",
      imageAlt:
        "Incendio no controlado en servicios de mantenimiento OMA adicionales",
      title: "EMERGENCIA",
      description:
        "En caso de generarse un incendio no controlado en los servicios de mantenimiento en las OMA adicionales",
      actionLink: {
        href: "#",
        label: "Ver acción",
      },
    },
    actionSteps: [
      {
        title: "Tarjeta de Acción",
        role: "PERSONA PRESENTE EN LA INCIDENCIA",
        items: [
          "Notifique a los bomberos aeronáuticos.",
          "Notifique a su Jefe inmediato.",
          "Maneje el extintor de 150lbs asignado a la aeronave en servicio.",
          "Tira del perno de seguridad del mango.",
          "Apunta la boca del extintor hacia la base del fuego.",
          "Aprieta el mango para descargar el agente (Si sueltas el mango se cerrará la descarga).",
          "Barre horizontalmente hasta que el extintor se gaste.",
          "Si el fuego no puede ser controlado retírese del lugar, ubique una zona segura, hasta que los bomberos puedan atender la situación.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "JEFE INMEDIATO",
        items: [
          "Recibe la información.",
          "Se asegurará de notificar al Coordinador del Plan de Respuesta Ante la Emergencia.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Si el fuego no fue controlado activara el Plan de Respuesta Ante la Emergencia.",
          "Activará el Centro de Gestión de Emergencia",
          "Notificará al Gerente General.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "GERENTE GENERAL",
        items: [
          "Recibe la información",
          "Comunicará al Grupo de Asistencia a Víctimas y al Grupo Operativo asistir al Centro de Gestión de Emergencia para coordinar todo lo referente a la emergencia en curso.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "BOMBEROS",
        items: [
          "Aplican el procedimiento de extinción de incendio.",
          "Luego de tener el control del lugar, proceden a ubicar al gerente general para realizar las inspecciones del área afectada.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "GERENTE GENERAL",
        items: [
          "Comunicará al presidente sobre el desarrollo de la emergencia.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "PRESIDENTE",
        items: [
          "Recibe la información.",
          "Evaluará la situación.",
          "Convocará una reunión con el grupo de la organización de respuesta ante la emergencia.",
          "Envía al Equipo de Respuesta Inicial.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "EQUIPO DE RESPUESTA INICIAL",
        items: [
          "Una vez en el lugar del accidente, ubica al inspector de turno y evalúa la situación de los daños en compañía de las autoridades competentes del aeródromo, bomberos para determinar las causas.",
          "Notifica al Presidente sobre los detalles.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "PRESIDENTE",
        items: [
          "Recibe la información.",
          "Evaluará los daños.",
          "Aprueba los recursos y autoriza el reinicio de las actividades en lugar.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Solicitará el Reporte Obligatorio de Incidencias a las personas que presenciaron la incidencia.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "PERSONAL QUE PRESENCIO LA INCIDENCIA",
        items: [
          "Realiza el Reporte Obligatorio de Incidencias a través de las vías establecidas para el reporte de SMS.",
        ],
      },
      {
        title: "Tarjeta de Acción",
        role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
        items: [
          "Recibe la información y registra en la base de datos de incidencias para la toma de decisión en cuanto a las acciones correctivas de prevención.",
        ],
      },
    ],
  },
];


export const policyImages = [
  { src: "/politica_1.jpg", alt: "Política 1" },
  { src: "/politica_2.jpg", alt: "Política 2" },
  { src: "/politica_3.jpg", alt: "Política 3" },
]

export const SMSresponsibilities = [
  {
    image: "/LOGO.png",
    title: "Responsabilidades SMS Dueños de Proceso",
    items: [
      "Mitigar los Riesgos",
      "Participar en los Simulacros de Emergencias",
      "Participar en las Actividades de SMS",
      "Contar con los Conocimientos de las Politicas",
    ],
  },
  {
    image: "/LOGO.png",
    title: "Responsabilidades SMS Resto del Personal",
    items: [
      "Identificar Peligros",
      "Participar en los Simulacros de Emergencias",
      "Participar en las Actividades de SMS",
      "Contar con los Conocimientos de las Politicas",
    ],
  },
] 

export const smsConcepts = [
  {
    title: "Peligro",
    concept: "Cualquier condición existente o potencial que pueda ocasionar lesiones, enfermedad o muerte a las personas, daño o pérdida de un sistema, equipo o propiedad, así como daño al medio ambiente."
  },
  {
    title: "Seguridad Operacional",
    concept: "Estado en el que los riesgos asociados a las actividades de aviación relativas a la operación de aeronaves, o que apoyan directamente dicha operación, se reducen y controlan a un nivel aceptable! (Doc.9859/4ta.edic)"
  },
  {
    title: "SMS",
    concept: "Es un enfoque sistemático para la gestión de la seguridad operacional, que incluye las estructuras organizacionales necesarias, líneas de rendición de cuentas, políticas y procedimientos!"
  },
  {
    title: "Riesgo",
    concept: "La probabilidad y severidad previstas para las consecuencias o resultados de un peligro!"
  },
  {
    title: "Condición Latente",
    concept: "Condiciones existentes en el sistema que se pueden desencadenar por un acontecimiento o un conjunto de acontecimientos cuyas consecuencias negativas pueden permanecer en estado latente!"
  },
  {
    title: "Estructura del SMS",
    concept: "Posee 4 Componetes y 12 Elementos!"
  },
  {
    title: "Tipos de Reportes SMS",
    concept: "Posee el Reporte Voluntario de Peligro y El Reporte Obligatorio de Incidentes!"
  }
];

// Exportación por defecto para importar todo junto si es necesario
export default {
  emergencyPlans,
  policyImages,
  SMSresponsibilities,
  smsConcepts,
};
