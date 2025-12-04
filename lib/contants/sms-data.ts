import {
  BookCheck,
  Building2,
  Gavel,
  Handshake,
  RefreshCcw,
  SearchCheck,
  ShieldCheck,
  Siren,
  Trophy,
  Users,
} from "lucide-react";

export interface ActionStep {
  title: string;
  role?: string;
  items: string[];
}

export interface CardData {
  imageUrl: string;
  imageAlt: string;
  title: string;
  stepsTitle?: string;
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
      imageUrl:
        "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/fire-extinguisher.png",
      imageAlt: "icono_extintor_de_incedio",
      title: "TARJETA DE ACCION DIRECTOR DE EMERGENCIA",
      stepsTitle:
        "Acciones a seguir durante una emergencia de incendio en las instalaciones de la empresa.",
      description:
        "Garantizar la seguridad y el bienestar de las personas en caso de una emergencia; liderando y organizando el proceso de evacuación en situaciones de riesgo.",
      actionLink: {
        href: "#",
        label: "Ver acción",
      },
    },
    actionSteps: [
      {
        title: "Durante la Emergencia",
        items: [
          "Notificar a los cuerpos de emergencia",
          "Coordinar las actividades de emergencia.",
          "Verificar que no hallan heridos y de haberlos; garantizar que sean trasladados a los centros asistenciales más cercanos.",
          "Supervisar que se cumplan los procedimientos establecidos.",
          "Ordenar la interrupción de la energía eléctrica si es necesario.",
        ],
      },
      {
        title: "Después de la Emergencia",
        items: [
          "Identificará y evaluará los daños materiales e informará como se realizará la fase de vuelta a la normalidad y bajo qué condiciones.",
          "Elaborará el informe correspondiente, una vez sea entregado el informe de evaluación de daños realizado por los bomberos.",
          "Realizar el análisis de evaluación de riesgos",
          "Evaluar las medidas de mitigación existentes.",
          "Sugerir correcciones al plan de emergencia de ser necesarias.",
        ],
      },
    ],
  },
  // SEGUNDA CARTA
  {
    cardData: {
      imageUrl:
        "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/airplane_fire.png",
      imageAlt: "Incendio no controlado en hangar con aeronave en servicio",
      title: "TARJETA DE ACCION PERSONAL DE GUARDIA",
      stepsTitle:
        "Acciones a seguir durante una emergencia de incendio en las instalaciones de la empresa.",
      description:
        "Garantizar la seguridad y el bienestar de las personas en caso de una emergencia; liderando y organizando el proceso de evacuación en situaciones de riesgo.",
      actionLink: {
        href: "#",
        label: "Ver acción",
      },
    },
    actionSteps: [
      {
        title: "Durante la emergencia",
        role: "PERSONAL EMPLEADO",
        items: [
          "Al activarse la alarma de incendio.",
          "Mantener la calma.",
          "Cesar cualquier actividad que esté realizando, si está trabajando con alguna herramienta eléctrica, apagarla y dejarla donde no obstaculice el paso de los demás.",
          "Dirigirse al punto seguro, sin detenerse siguiendo la ruta de evacuación establecida.",
          "No se devuelva a buscar objetos personales.",
          "Al llegar al punto seguro reportarse con su jefe de área para el conteo del personal.",
          "Tratar de controlar el incendio solo si está en su fase inicial (conato) y no ha sido declarado. Utilice los extintores de incendio solo si está capacitado, de no ser así evacue hacia el punto seguro o área de reunión como el resto del personal).",
        ],
      },
      {
        title: "Despues de la emergencia",
        role: "JEFES DE AREA",
        items: [
          "Realizar recuento del personal",
          "Notificar al director de SMS o director de emergencia cualquier novedad.",
          "Esperar indicaciones del director de emergencia para volver o no a las actividades normales.",
        ],
      },
    ],
  },
  //TERCERA CARTA
  {
    cardData: {
      imageUrl:
        "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/fire_controled.png",
      imageAlt: "Conato de incendio en las edificaciones",
      title: "TARJETA DE ACCIÓN SMS",
      stepsTitle:
        "Acciones a seguir durante una emergencia de incendio en las instalaciones de la empresa.",
      description:
        "Garantizar la seguridad y el bienestar de las personas en caso de una emergencia; liderando y organizando el proceso de evacuación en situaciones de riesgo.",
      actionLink: {
        href: "#",
        label: "Ver acción",
      },
    },
    actionSteps: [
      {
        title: "Durante la emergencia",
        items: [
          "Notificar al director de emergencia las condiciones y magnitud del incendio, y si éste puede ser controlado por medios internos.",

          "Colaborar con la labor de extinción desalojando al personal cercano del área en problema.",

          "Si el incendio es posible controlarlo con los recursos internos indicará al personal de extinción empleen los extintores más cercanos al área del problema.",

          "Prestará apoyo al director de emergencia.",

          "Coordinara las actividades de extinción de incendio, hasta la llegada de los bomberos.",

          "Garantizara la seguridad del personal verificando riesgos cercanos",
        ],
      },
      {
        title: "Después de la emergencia.",
        items: [
          "Esperar indicaciones del Director de emergencia para volver o no a las actividades normales.",

          "Evaluar los daños, una vez sea entregado el informe de evaluación de daños realizado por los bomberos.",

          "Realizar el análisis de evaluación de riesgos",

          "Evaluar las medidas de mitigación existentes.",

          "Sugerir correcciones al plan de emergencia de ser necesarias.",
        ],
      },
    ],
  },
];

export const policyCardsData = [
  {
    icon: Building2,
    description:
      "Ejecutar la implementación del Sistema De Gestión De Seguridad Operacional (SMS) de manera no punitiva.",
  },
  {
    icon: Handshake,
    description:
      "Mejorar continuamente los niveles de Gestión De Seguridad Operacional.",
  },
  {
    icon: SearchCheck,
    description:
      " Identificar continuamente los peligros y gestionar los riesgos.",
  },
  {
    icon: ShieldCheck,
    description:
      "Corregir las fallas encontradas, en función de mantener la Seguridad Operacional en el nivel acordado.",
  },
  {
    icon: Trophy,
    description:
      "Incentivar a su personal para que reporten los problemas de la Seguridad Operacional.",
  },
  {
    icon: BookCheck,
    description:
      "Comprender los principios en que se base el SMS, apoyando con recursos humanos, materiales y financieros que faciliten el desarrollo del proceso y la puesta en práctica de las políticas de Seguridad Operacional.",
  },

  {
    icon: Siren,
    description:
      "Mantener una cultura de Seguridad Operacional positiva y justa",
  },

  {
    icon: Gavel,
    description:
      "No ejercer acciones punitivas a quien reporte eventos de Seguridad Operacional, o peligros existentes, que den cuenta de condiciones latentes que atenten a la empresa y retroalimentar a quien reporta.",
  },

  {
    icon: RefreshCcw,
    description:
      "Asegurarse que las políticas de Seguridad Operacional sean revisadas constantemente, actualizadas y apoyen el cumplimiento del plan de implementación de SMS",
  },

  {
    icon: Users,
    description:
      " Incentivar la cultura de reportar al personal de la empresa sobre los problemas de Seguridad Operacional brindándoles los mecanismos necesarios para ello y garantizar que no se tomen medidas disciplinarias a aquellos que lo realicen.",
  },
];

export const policyImages = [
  {
    src: "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/politica_1.png",
    alt: "Política 1",
  },
  // {
  //   src: "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/politica_2.png",
  //   alt: "Política 2",
  // },
];

export const SMSresponsibilities = [
  {
    image: "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/LOGO.png",
    title: "Responsabilidades SMS Dueños de Proceso",
    items: [
      "Mitigar los Riesgos",
      "Participar en los Simulacros de Emergencias",
      "Participar en las Actividades de SMS",
      "Contar con los Conocimientos de las Politicas",
    ],
  },
  {
    image: "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/LOGO.png",
    title: "Responsabilidades SMS Resto del Personal",
    items: [
      "Identificar Peligros",
      "Participar en los Simulacros de Emergencias",
      "Participar en las Actividades de SMS",
      "Contar con los Conocimientos de las Politicas",
    ],
  },
];

export const smsConcepts = [
  {
    title: "Reporte Voluntario",
    concept:
      "Mecanismos que permiten a los empleados y a otros miembros de una organización informar de manera anónima o confidencial sobre condiciones, comportamientos o situaciones que podrían representar un peligro en las operaciones de la organización.",
  },
  {
    title: "Reporte Obligatorio",
    concept:
      "Para el desarrollo de las actividades de gestión a través del sistema de reportes obligatorios, se abordan los procesos resultantes de la captación de información proveniente de los eventos operacionales, fallas o deficiencias técnicas, entre otros.",
  },
  {
    title: "Peligro",
    concept:
      "Cualquier condición existente o potencial que pueda ocasionar lesiones, enfermedad o muerte a las personas, daño o pérdida de un sistema, equipo o propiedad, así como daño al medio ambiente.",
  },
  {
    title: "Seguridad Operacional",
    concept:
      "Estado en el que los riesgos asociados a las actividades de aviación relativas a la operación de aeronaves, o que apoyan directamente dicha operación, se reducen y controlan a un nivel aceptable! (Doc.9859/4ta.edic)",
  },
  {
    title: "SMS",
    concept:
      "Es un enfoque sistemático para la gestión de la seguridad operacional, que incluye las estructuras organizacionales necesarias, líneas de rendición de cuentas, políticas y procedimientos!",
  },
  {
    title: "Riesgo",
    concept:
      "La probabilidad y severidad previstas para las consecuencias o resultados de un peligro!",
  },
  {
    title: "Condición Latente",
    concept:
      "Condiciones existentes en el sistema que se pueden desencadenar por un acontecimiento o un conjunto de acontecimientos cuyas consecuencias negativas pueden permanecer en estado latente!",
  },
  {
    title: "Estructura del SMS",
    concept: "Posee 4 Componetes y 12 Elementos!",
  },
  {
    title: "Tipos de Reportes SMS",
    concept:
      "Posee el Reporte Voluntario de Peligro y El Reporte Obligatorio de Incidentes!",
  },
];

// Exportación por defecto para importar todo junto si es necesario
export const smsConstants = {
  emergencyPlans,
  policyImages,
  SMSresponsibilities,
  smsConcepts,
  policyCardsData,
};

export default smsConstants;

// export const emergencyPlans: EmergencyPlan[] = [
//   {
//     //PRIMERA CARTA
//     cardData: {
//       imageUrl:
//         "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/fire-extinguisher.png",
//   {
//     title: "Estructura del SMS",
//     concept: "Posee 4 Componetes y 12 Elementos!"
//   },
//   {
//     title: "Tipos de Reportes SMS",
//     concept: "Posee el Reporte Voluntario de Peligro y El Reporte Obligatorio de Incidentes!"
//   }
// ];

// export const emergencyPlans: EmergencyPlan[] = [
//   {
//     //PRIMERA CARTA
//     cardData: {
//       imageUrl:
//         "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/fire-extinguisher.png",
//       imageAlt: "Conato de incendio en hangar con aeronave en servicio",
//       title: "EMERGENCIA",
//       description:
//         "Incendio controlado con aeronave en servicio, en las instalaciones de la OMA principal de ESTELAR TECHNIK.",
//       actionLink: {
//         href: "#",
//         label: "Ver acción",
//       },
//     },
//     actionSteps: [
//       {
//         title: "Tarjeta de Acción",
//         role: "PRIMER NOTIFICADOR",
//         items: [
//           "Presione la alarma de incendio.",
//           "Notifique a los bomberos aeronáuticos.",
//           "Notifique a su Jefe inmediato.",
//           "Maneje el extintor de 150lbs asignado a la aeronave en servicio.",
//           "Tira del perno de seguridad del mango.",
//           "Apunta la boca del extintor hacia la base del fuego.",
//           "Aprieta el mango para descargar el agente (Si sueltas el mango se cerrará la descarga).",
//           "Barre horizontalmente hasta que el extintor se gaste.",
//           "Una vez extinguido el fuego, de manera visual verifique si existen heridos y reporta la situación.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "JEFE INMEDIATO",
//         items: [
//           "Recibe la información.",
//           "Se asegurará de notificar al Coordinador del Plan de Respuesta Ante la Emergencia.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Evaluará la situación.",
//           "Si el fuego fue controlado y no hubo heridos no activara el Plan de Respuesta Ante la Emergencia.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "En caso de heridos leves notificará al Grupo de Asistencia para la coordinación de la atención médica a los trabajadores afectados.",
//           "Notificara a la Organización de Respuesta Ante la Emergencia (ORE).",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "ORGANIZACIÓN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Recibe la información.",
//           "Realiza inspección de las instalaciones en acompañamiento de los bomberos aeronáuticos para evaluar la estructura y los daños.",
//           "Notifica al presidente sobre los daños y recursos requeridos para continuar con los servicios.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "PRESIDENTE",
//         items: [
//           "Recibe la información.",
//           "Evaluará la situación.",
//           "Autoriza los recursos y el reinicio de las actividades.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Solicitará el Reporte Obligatorio de Incidencias a las personas que presenciaron la incidencia.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "PERSONAL QUE PRESENCIO LA INCIDENCIA",
//         items: [
//           "Realiza el Reporte Obligatorio de Incidencias a través de las vías establecidas para el reporte de SMS.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Recibe la información y registra en la base de datos de incidencias para la toma de decisión en cuanto a las acciones correctivas de prevención.",
//         ],
//       },
//     ],
//   },
//   // SEGUNDA CARTA
//   {
//     cardData: {
//       imageUrl:
//         "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/airplane_fire.png",
//       imageAlt: "Incendio no controlado en hangar con aeronave en servicio",
//       title: "EMERGENCIA",
//       description:
//         "Incendio no controlado con aeronave en servicio, en las instalaciones de la OMA principal de ESTELAR TECHNIK.",
//       actionLink: {
//         href: "#",
//         label: "Ver acción",
//       },
//     },
//     actionSteps: [
//       {
//         title: "Tarjeta de Acción",
//         role: "PRIMER NOTIFICADOR",
//         items: [
//           "Presione la alarma de incendio.",
//           "Notifique a los bomberos aeronáuticos.",
//           "Notifique a su Jefe inmediato.",
//           "Maneje el extintor de 150lbs asignado a la aeronave en servicio.",
//           "Tira del perno de seguridad del mango.",
//           "Apunta la boca del extintor hacia la base del fuego.",
//           "Aprieta el mango para descargar el agente (Si sueltas el mango se cerrará la descarga).",
//           "Barre horizontalmente hasta que el extintor se gaste.",
//           "Si el fuego no puede ser controlado retírese del lugar, ubique una zona segura, hasta que los bomberos puedan atender la situación.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "JEFE INMEDIATO",
//         items: [
//           "Recibe la información.",
//           "Se asegurará de notificar al Coordinador del Plan de Respuesta Ante la Emergencia.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Si el fuego no fue controlado activara el Plan de Respuesta Ante la Emergencia.",
//           "Notificará al Gerente General.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "GERENTE GENERAL",
//         items: [
//           "Recibe la información",
//           "Notifica al Grupo de Asistencia y al Grupo Operativo para iniciar el proceso de desalojo de las instalaciones.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "GRUPO ASISTENCIA / GRUPO OPERATIVO",
//         items: [
//           "El líder del Grupo de asistencia va a dirigir el desalojo del personal a través de la ruta más segura.",
//           "Los brigadistas guiarán a las personas con el apoyo del Grupo Operativo a través de la ruta trazada, asegurándose de que ningún trabajador se separe del grupo.",
//           "El líder del Grupo de asistencia se ubicará en el punto de encuentro, donde recibirá a los trabajadores y coordinará la atención médica.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "BOMBEROS",
//         items: [
//           "Aplican el procedimiento de extinción de incendio.",
//           "Luego de tener el control del lugar, proceden a ubicar al gerente general para realizar las inspecciones del área afectada.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "GERENTE GENERAL",
//         items: [
//           "Comunicará al presidente sobre el desarrollo de la emergencia, los daños y las causas que origino el incidente.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "PRESIDENTE",
//         items: [
//           "Recibe la información.",
//           "Evaluará la situación.",
//           "Convocará una reunión con el grupo de la organización de respuesta ante la emergencia.",
//           "Autoriza los recursos necesarios y el inicio de las actividades.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Solicitará el Reporte Obligatorio de Incidencias a las personas que presenciaron la incidencia.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "PERSONAL QUE PRESENCIO LA INCIDENCIA",
//         items: [
//           "Realiza el Reporte Obligatorio de Incidencias a través de las vías establecidas para el reporte de SMS.",
//         ],
//       },
//     ],
//   },
//   //TERCERA CARTA
//   {
//     cardData: {
//       imageUrl:
//         "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/fire_controled.png",
//       imageAlt: "Conato de incendio en las edificaciones",
//       title: "EMERGENCIA",
//       description:
//         "Incendio controlado en las edificaciones de ESTELAR TECHNIK.",
//       actionLink: {
//         href: "#",
//         label: "Ver acción",
//       },
//     },
//     actionSteps: [
//       {
//         title: "Tarjeta de Acción",
//         role: "PRIMER NOTIFICADOR",
//         items: [
//           "Presione la alarma de incendio.",
//           "Notifique a los bomberos aeronáuticos.",
//           "Notifique a su Jefe inmediato.",
//           "Tome el extintor de pared más cercano.",
//           "Retire el pasador de seguridad.",
//           "Apunta la boca del extintor hacia la base del fuego.",
//           "Aprieta la palanca y haga un barrido horizontalmente hasta que el fuego se extinga.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "JEFE INMEDIATO",
//         items: [
//           "Recibe la información.",
//           "Se asegurará de notificar al Coordinador del Plan de Respuesta Ante la Emergencia.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Evaluará la situación.",
//           "Si el fuego fue controlado y no hubo heridos no activara el Plan de Respuesta Ante la Emergencia.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "En caso de heridos leves notificará al Grupo de Asistencia para la coordinación de la atención médica a los trabajadores afectados.",
//           "Realiza inspección a las edificaciones en acompañamiento de los bomberos aeronáuticos para evaluar la estructura y daños.",
//           "Notifica al presidente sobre los daños y recursos requeridos para reiniciar las actividades en el lugar.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "GERENTE RESPONSABLE",
//         items: [
//           "Recibe la información.",
//           "Evaluará la situación.",
//           "Autoriza los recursos y el reinicio de las actividades.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Solicitará el Reporte Obligatorio de Incidencias a las personas que presenciaron la incidencia.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "PERSONAL QUE PRESENCIO LA INCIDENCIA",
//         items: [
//           "Realiza el Reporte Obligatorio de Incidencias a través de las vías establecidas para el reporte de SMS.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Recibe la información y registra en la base de datos de incidencias para la toma de decisión en cuanto a las acciones correctivas de prevención.",
//         ],
//       },
//     ],
//   },
//   //CUARTA CARTA

//   {
//     cardData: {
//       imageUrl:
//         "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/burning-building.png",
//       imageAlt: "Incendio no controlado en las edificaciones",
//       title: "EMERGENCIA",
//       description:
//         "Incendio no controlado en las edificaciones de ESTELAR TECHNIK.",
//       actionLink: {
//         href: "#",
//         label: "Ver acción",
//       },
//     },
//     actionSteps: [
//       {
//         title: "Tarjeta de Acción",
//         role: "PRIMER NOTIFICADOR",
//         items: [
//           "Presione la alarma de incendio.",
//           "Notifique a los bomberos aeronáuticos.",
//           "Notifique a su Jefe inmediato.",
//           "Tome el extintor más cercano y retire el pasador de seguridad.",
//           "Apunta la boca del extintor hacia la base del fuego.",
//           "Aprieta la palanca y haga un barrido horizontalmente hasta que se agote.",
//           "Si el fuego no puede ser controlado retírese del lugar, ubique una zona segura, hasta que los bomberos puedan atender la situación.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "JEFE INMEDIATO",
//         items: [
//           "Recibe la información.",
//           "Se asegurará de notificar al Coordinador del Plan de Respuesta Ante la Emergencia.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Si el fuego no fue controlado activara el Plan de Respuesta Ante la Emergencia.",
//           "Notificará al Gerente General.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "GERENTE GENERAL",
//         items: [
//           "Recibe la información",
//           "Notifica al Grupo de Asistencia y al Grupo Operativo para iniciar el proceso de desalojo de las instalaciones.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "GRUPO ASISTENCIA / GRUPO OPERATIVO",
//         items: [
//           "El líder del Grupo de asistencia va a dirigir el desalojo del personal a través de la ruta más segura.",
//           "Los brigadistas guiarán a las personas con el apoyo del Grupo Operativo a través de la ruta trazada, asegurándose de que ningún trabajador se separe del grupo.",
//           "El líder del Grupo de asistencia se ubicará en el punto de encuentro, donde recibirá a los trabajadores y coordinará la atención médica.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "BOMBEROS",
//         items: [
//           "Aplican el procedimiento de extinción de incendio.",
//           "Luego de tener el control del lugar, proceden a ubicar al gerente general para realizar las inspecciones del área afectada.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "GERENTE GENERAL",
//         items: [
//           "Comunicará al presidente sobre el desarrollo de la emergencia, los daños y las causas que originó el incidente.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "PRESIDENTE",
//         items: [
//           "Recibe la información.",
//           "Evaluará la situación.",
//           "Convocará una reunión con el grupo de la organización de respuesta ante la emergencia.",
//           "Autoriza los recursos necesarios y el reinicio de las actividades en el lugar.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Solicitará el Reporte Obligatorio de Incidencias a las personas que presenciaron la incidencia.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "PERSONAL QUE PRESENCIO LA INCIDENCIA",
//         items: [
//           "Realiza el Reporte Obligatorio de Incidencias a través de las vías establecidas para el reporte de SMS.",
//         ],
//       },
//     ],
//   },
//   //QUINTA CARTA
//   {
//     cardData: {
//       imageUrl:
//         "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/fire_tools.png",
//       imageAlt:
//         "Conato de incendio en servicios de mantenimiento OMA adicionales",
//       title: "EMERGENCIA",
//       description:
//         "Incendio controlado en los servicios de mantenimiento en las OMA foráneas de ESTELAR TECHNIK",
//       actionLink: {
//         href: "#",
//         label: "Ver acción",
//       },
//     },
//     actionSteps: [
//       {
//         title: "Tarjeta de Acción",
//         role: "PERSONA PRESENTE EN LA INCIDENCIA",
//         items: [
//           "Notifique a los bomberos aeronáuticos.",
//           "Notifique a su Jefe inmediato.",
//           "Maneje el extintor de 150lbs asignado a la aeronave en servicio.",
//           "Tira del perno de seguridad del mango.",
//           "Apunta la boca del extintor hacia la base del fuego.",
//           "Aprieta el mango para descargar el agente (Si sueltas el mango se cerrará la descarga).",
//           "Barre horizontalmente hasta que el extintor se gaste.",
//           "Una vez Controlado el fuego, de manera visual verifique si existen heridos y reporta la situación.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "JEFE INMEDIATO",
//         items: [
//           "Recibe la información.",
//           "Se asegurará de notificar al Coordinador del Plan de Respuesta Ante la Emergencia.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Evaluará la situación.",
//           "Si el fuego fue controlado y no hubo heridos no activara el Plan de Respuesta Ante la Emergencia.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "En caso de heridos leves notificará al Grupo de Asistencia a Víctimas para la coordinación de la atención médica a los trabajadores afectados.",
//           "Notificara a la Organización de Respuesta Ante la Emergencia (ORE).",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "ORGANIZACIÓN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Recibe la información.",
//           "Solicitará un informe sobre los daños.",
//           "Notifica al presidente sobre los daños y recursos requeridos para continuar con los servicios.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "PRESIDENTE",
//         items: [
//           "Recibe la información.",
//           "Evaluará la situación.",
//           "Autoriza los recursos y el reinicio de las actividades.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Solicitará el Reporte Obligatorio de Incidencias a las personas que presenciaron la incidencia.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "PERSONAL QUE PRESENCIO LA INCIDENCIA",
//         items: [
//           "Realiza el Reporte Obligatorio de Incidencias a través de las vías establecidas para el reporte de SMS.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Recibe la información y registra en la base de datos de incidencias para la toma de decisión en cuanto a las acciones correctivas de prevención.",
//         ],
//       },
//     ],
//   },
//   //SEXTA CARTA
//   {
//     cardData: {
//       imageUrl:
//         "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/collapse_by_fire.png",
//       imageAlt:
//         "Incendio no controlado en servicios de mantenimiento OMA adicionales",
//       title: "EMERGENCIA",
//       description:
//         "En caso de generarse un incendio no controlado en los servicios de mantenimiento en las OMA adicionales",
//       actionLink: {
//         href: "#",
//         label: "Ver acción",
//       },
//     },
//     actionSteps: [
//       {
//         title: "Tarjeta de Acción",
//         role: "PERSONA PRESENTE EN LA INCIDENCIA",
//         items: [
//           "Notifique a los bomberos aeronáuticos.",
//           "Notifique a su Jefe inmediato.",
//           "Maneje el extintor de 150lbs asignado a la aeronave en servicio.",
//           "Tira del perno de seguridad del mango.",
//           "Apunta la boca del extintor hacia la base del fuego.",
//           "Aprieta el mango para descargar el agente (Si sueltas el mango se cerrará la descarga).",
//           "Barre horizontalmente hasta que el extintor se gaste.",
//           "Si el fuego no puede ser controlado retírese del lugar, ubique una zona segura, hasta que los bomberos puedan atender la situación.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "JEFE INMEDIATO",
//         items: [
//           "Recibe la información.",
//           "Se asegurará de notificar al Coordinador del Plan de Respuesta Ante la Emergencia.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Si el fuego no fue controlado activara el Plan de Respuesta Ante la Emergencia.",
//           "Activará el Centro de Gestión de Emergencia",
//           "Notificará al Gerente General.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "GERENTE GENERAL",
//         items: [
//           "Recibe la información",
//           "Comunicará al Grupo de Asistencia a Víctimas y al Grupo Operativo asistir al Centro de Gestión de Emergencia para coordinar todo lo referente a la emergencia en curso.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "BOMBEROS",
//         items: [
//           "Aplican el procedimiento de extinción de incendio.",
//           "Luego de tener el control del lugar, proceden a ubicar al gerente general para realizar las inspecciones del área afectada.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "GERENTE GENERAL",
//         items: [
//           "Comunicará al presidente sobre el desarrollo de la emergencia.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "PRESIDENTE",
//         items: [
//           "Recibe la información.",
//           "Evaluará la situación.",
//           "Convocará una reunión con el grupo de la organización de respuesta ante la emergencia.",
//           "Envía al Equipo de Respuesta Inicial.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "EQUIPO DE RESPUESTA INICIAL",
//         items: [
//           "Una vez en el lugar del accidente, ubica al inspector de turno y evalúa la situación de los daños en compañía de las autoridades competentes del aeródromo, bomberos para determinar las causas.",
//           "Notifica al Presidente sobre los detalles.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "PRESIDENTE",
//         items: [
//           "Recibe la información.",
//           "Evaluará los daños.",
//           "Aprueba los recursos y autoriza el reinicio de las actividades en lugar.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Solicitará el Reporte Obligatorio de Incidencias a las personas que presenciaron la incidencia.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "PERSONAL QUE PRESENCIO LA INCIDENCIA",
//         items: [
//           "Realiza el Reporte Obligatorio de Incidencias a través de las vías establecidas para el reporte de SMS.",
//         ],
//       },
//       {
//         title: "Tarjeta de Acción",
//         role: "COORDINADOR DEL PLAN DE RESPUESTA ANTE LA EMERGENCIA",
//         items: [
//           "Recibe la información y registra en la base de datos de incidencias para la toma de decisión en cuanto a las acciones correctivas de prevención.",
//         ],
//       },
//     ],
//   },
// ];

// export const policyCardsData = [
//   {
//     icon: Building2,
//     description:
//       "Ejecutar la implementación del Sistema De Gestión De Seguridad Operacional (SMS) de manera no punitiva.",
//   },
//   {
//     icon: Handshake,
//     description:
//       "Mejorar continuamente los niveles de Gestión De Seguridad Operacional.",
//   },
//   {
//     icon: SearchCheck,
//     description:
//       " Identificar continuamente los peligros y gestionar los riesgos.",
//   },
//   {
//     icon: ShieldCheck,
//     description:
//       "Corregir las fallas encontradas, en función de mantener la Seguridad Operacional en el nivel acordado.",
//   },
//   {
//     icon: Trophy,
//     description:
//       "Incentivar a su personal para que reporten los problemas de la Seguridad Operacional.",
//   },
//   {
//     icon: BookCheck,
//     description:
//       "Comprender los principios en que se base el SMS, apoyando con recursos humanos, materiales y financieros que faciliten el desarrollo del proceso y la puesta en práctica de las políticas de Seguridad Operacional.",
//   },

//   {
//     icon: Siren,
//     description:
//       "Mantener una cultura de Seguridad Operacional positiva y justa",
//   },

//   {
//     icon: Gavel,
//     description:
//       "No ejercer acciones punitivas a quien reporte eventos de Seguridad Operacional, o peligros existentes, que den cuenta de condiciones latentes que atenten a la empresa y retroalimentar a quien reporta.",
//   },

//   {
//     icon: RefreshCcw,
//     description:
//       "Asegurarse que las políticas de Seguridad Operacional sean revisadas constantemente, actualizadas y apoyen el cumplimiento del plan de implementación de SMS",
//   },

//   {
//     icon: Users,
//     description:
//       " Incentivar la cultura de reportar al personal de la empresa sobre los problemas de Seguridad Operacional brindándoles los mecanismos necesarios para ello y garantizar que no se tomen medidas disciplinarias a aquellos que lo realicen.",
//   },
// ];

// export const policyImages = [
//   {
//     src: "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/politica_1.png",
//     alt: "Política 1",
//   },
//   {
//     src: "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/politica_2.png",
//     alt: "Política 2",
//   },
// ];

// export const SMSresponsibilities = [
//   {
//     image: "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/LOGO.png",
//     title: "Responsabilidades SMS Dueños de Proceso",
//     items: [
//       "Mitigar los Riesgos",
//       "Participar en los Simulacros de Emergencias",
//       "Participar en las Actividades de SMS",
//       "Contar con los Conocimientos de las Politicas",
//     ],
//   },
//   {
//     image: "https://ccvnd3lo965z.share.zrok.io/storage/images/sms/LOGO.png",
//     title: "Responsabilidades SMS Resto del Personal",
//     items: [
//       "Identificar Peligros",
//       "Participar en los Simulacros de Emergencias",
//       "Participar en las Actividades de SMS",
//       "Contar con los Conocimientos de las Politicas",
//     ],
//   },
// ];

// export const smsConcepts = [
//   {
//     title: "Peligro",
//     concept: "Cualquier condición existente o potencial que pueda ocasionar lesiones, enfermedad o muerte a las personas, daño o pérdida de un sistema, equipo o propiedad, así como daño al medio ambiente."
//   },
//   {
//     title: "Seguridad Operacional",
//     concept: "Estado en el que los riesgos asociados a las actividades de aviación relativas a la operación de aeronaves, o que apoyan directamente dicha operación, se reducen y controlan a un nivel aceptable! (Doc.9859/4ta.edic)"
//   },
//   {
//     title: "SMS",
//     concept: "Es un enfoque sistemático para la gestión de la seguridad operacional, que incluye las estructuras organizacionales necesarias, líneas de rendición de cuentas, políticas y procedimientos!"
//   },
//   {
//     title: "Riesgo",
//     concept: "La probabilidad y severidad previstas para las consecuencias o resultados de un peligro!"
//   },
//   {
//     title: "Condición Latente",
//     concept: "Condiciones existentes en el sistema que se pueden desencadenar por un acontecimiento o un conjunto de acontecimientos cuyas consecuencias negativas pueden permanecer en estado latente!"
//   },
//   {
//     title: "Estructura del SMS",
//     concept: "Posee 4 Componetes y 12 Elementos!"
//   },
//   {
//     title: "Tipos de Reportes SMS",
//     concept: "Posee el Reporte Voluntario de Peligro y El Reporte Obligatorio de Incidentes!"
//   }
// ];
