//    "use client";
//    
//    import { Button } from "@/components/ui/button";
//    import { useRouter } from "next/navigation";
//    import { Dialog, DialogTrigger, } from "@/components/ui/dialog";
//    import { useState } from "react";
//    
//    export function PurchaseOrdersDialog({ id }: { id?: string }) {
//      const [openActions, setOpenActions] = useState(false);
//      const router = useRouter();
//    
//      const handleViewStatistics = () => {
//        router.push(
//          "/transmandu/compras/ordenes_compra/estadisticas"
//        );
//      };

//      return (
//        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 items-center gap-4">
//          {/*Boton para ver las estadisticas de ordenes de compr*/}
//          <Dialog open={openActions} onOpenChange={setOpenActions}>
//            <DialogTrigger asChild>
//              <Button
//                onClick={handleViewStatistics}
//                variant={"outline"}
//                className="flex items-center justify-center gap-2 h-8 border-dashed"
//              >
//                Estadisticas de Ordenes de Compra
//              </Button>
//            </DialogTrigger>
//          </Dialog>
//        </div>
//      );
//    }
