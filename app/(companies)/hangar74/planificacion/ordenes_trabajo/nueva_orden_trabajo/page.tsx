import { ContentLayout } from '@/components/layout/ContentLayout';
import ServiceWorkOrderForm from './_components/ServiceWorkOrderForm';
import NonServiceWorkOrderForm from './_components/NonServiceWorkOrderForm';
export default function WorkOrderPage() {
  const { data: aircrafts, isLoading: isAircraftsLoading, isError: isAircraftsError } = useGetMaintenanceAircrafts();
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);
  const { selectedStation } = useCompanyStore()
  const { data: services, isLoading: isServicesLoading, isError: isServicesError } = useGetServicesByManufacturer(selectedAircraft);

  // Inicializar React Hook Form con Zod
  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      elaborated_by: 'Ing. Francisco Montilla',
      reviewed_by: 'José Flores',
      approved_by: "Fátima Dos Ramos",
      order_number: '',
      description: '',
      aircraft_id: '',
      tasks: services?.flatMap((service) =>
        service.tasks.map((task) => ({
          id: task.id,
          description: task.description,
          selected: false,
          technician_responsable: "",
          inspector_responsable: "",
        }))
      ),
    },
  });

  // Obtener las tareas del formulario
  const { fields: tasks, replace } = useFieldArray({
    control: form.control,
    name: 'tasks',
  });

  useEffect(() => {
    if (selectedStation) {
      form.setValue('location_id', selectedStation)
    }
  }, [selectedStation, form])

  useEffect(() => {
    if (services) {
      const tasks = services.flatMap((service) =>
        service.tasks.map((task) => ({
          id: task.id,
          description: task.description,
          selected: false,
          technician_responsable: '',
          inspector_responsable: '',
        }))
      );
      replace(tasks);
    }
  }, [services, replace]);
  const selectedTasks = form.getValues("tasks")?.filter((task) => task.selected);
  const onSubmit = (data: WorkOrderFormValues) => {
    const selectedTasks = data.tasks.filter((task) => task.selected);
    console.log('Orden de trabajo guardada:', {
      ...data,
      tasks: selectedTasks,
    });
  };

  return (
    <ContentLayout title='Creacion de WO'>
      {/* <ServiceWorkOrderForm /> */}
      <NonServiceWorkOrderForm />
    </ContentLayout>
  );
}
