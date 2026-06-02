import { useState } from "react";
import { useServices, useCreateService, useUpdateService, useDeleteService } from "@/hooks/useServices";
import { Table, Button, Badge, Modal, Input, Card, Icon } from "@/components";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { classNames } from "@/utils";
import { useTranslation } from "react-i18next";
function ServicesManagement() {
  const {
    t
  } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const {
    data: servicesData,
    isLoading
  } = useServices({
    search: searchTerm
  });
  const {
    mutate: createService
  } = useCreateService();
  const {
    mutate: updateService
  } = useUpdateService();
  const {
    mutate: deleteService
  } = useDeleteService();
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors
    }
  } = useForm();
  const handleOpenModal = (service = null) => {
    setEditingService(service);
    if (service) {
      reset(service);
    } else {
      reset({
        name: "",
        price: "",
        duration: "",
        category: "General",
        status: "active",
        description: ""
      });
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };
  const onSubmit = data => {
    if (editingService) {
      updateService({
        id: editingService.id,
        data
      }, {
        onSuccess: handleCloseModal
      });
    } else {
      createService(data, {
        onSuccess: handleCloseModal
      });
    }
  };
  const columns = [{
    header: t("pages.admin.servicesmanagement.serviceDetails"),
    render: row => <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-sm border border-brand-100">
             <Icon name="faStethoscope" className="text-lg" />
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-none">{row.name}</p>
            <p className="mt-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{row.category}</p>
          </div>
        </div>
  }, {
    header: t("pages.admin.servicesmanagement.pricing"),
    render: row => <div className="flex items-center gap-2">
           <span className="text-lg font-black text-slate-900">${row.price}</span>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t("pages.admin.servicesmanagement.perSession")}</span>
        </div>
  }, {
    header: t("pages.admin.servicesmanagement.duration"),
    render: row => <div className="flex items-center gap-2 text-slate-500">
           <Icon name="faClock" className="text-xs" />
           <span className="text-sm font-bold">{row.duration}{t("pages.admin.servicesmanagement.min")}</span>
        </div>
  }, {
    header: t("pages.admin.servicesmanagement.status"),
    render: row => <Badge tone={row.status === "active" ? "success" : "secondary"}>
          {row.status}
        </Badge>
  }, {
    header: t("pages.admin.servicesmanagement.actions"),
    render: row => <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(row)} className="h-9 w-9 p-0 rounded-xl hover:bg-brand-50 hover:text-brand-600">
            <Icon name="faPen" className="text-xs" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => {
        if (confirm(t("pages.admin.servicesmanagement.areYouSure"))) deleteService(row.id);
      }} className="h-9 w-9 p-0 rounded-xl hover:bg-rose-50 hover:text-rose-600">
            <Icon name="faTrash" className="text-xs" />
          </Button>
        </div>
  }];
  return <div className="space-y-10 pb-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">{t("pages.admin.servicesmanagement.serviceCatalog")}</h1>
          <p className="mt-2 text-lg font-medium text-slate-500">{t("pages.admin.servicesmanagement.defineTreatmentPricingSessionDurationsAndClinical")}</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="h-12 px-8 rounded-2xl shadow-xl shadow-brand-500/20">
          <Icon name="faPlus" className="mr-3" />{t("pages.admin.servicesmanagement.createNewService")}</Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
         <div className="lg:col-span-3">
            <Card className="p-0 overflow-hidden" variant="premium">
              <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
                <div className="relative flex-1 min-w-[300px]">
                  <Icon name="faSearch" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input type="text" placeholder={t("pages.admin.servicesmanagement.searchByServiceNameOrCategory")} className="h-12 w-full rounded-2xl border-2 border-transparent bg-white pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-brand-500/10 shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>

              <div className="p-4">
                <Table columns={columns} data={servicesData?.data} isLoading={isLoading} />
              </div>
            </Card>
         </div>

         <div className="space-y-8">
            <Card title={t("pages.admin.servicesmanagement.catalogStats")} description="Summary of clinical offerings.">
               <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t("pages.admin.servicesmanagement.totalActive")}</span>
                     <span className="text-xl font-black text-slate-900">{servicesData?.total || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t("pages.admin.servicesmanagement.categories")}</span>
                     <span className="text-xl font-black text-slate-900">4</span>
                  </div>
               </div>
            </Card>

            <Card className="bg-slate-950 text-white border-none shadow-xl shadow-slate-950/20">
               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 mb-4">
                  <Icon name="faLightbulb" className="text-white" />
               </div>
               <h4 className="text-lg font-bold mb-2">{t("pages.admin.servicesmanagement.proTip")}</h4>
               <p className="text-slate-400 text-xs leading-relaxed">{t("pages.admin.servicesmanagement.regularlyUpdateYourServicePricesToStay")}</p>
            </Card>
         </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingService ? "Update Treatment Details" : "Define New Treatment"} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
               <Input label="Service Name" placeholder={t("pages.admin.servicesmanagement.eGCardiologyConsultation")} error={errors.name?.message} {...register("name", {
              required: t("pages.admin.servicesmanagement.serviceNameIsRequired")
            })} />
            </div>
            
            <Input label="Price ($)" type="number" placeholder="0.00" error={errors.price?.message} {...register("price", {
            required: t("pages.admin.servicesmanagement.priceIsRequired")
          })} />
            <Input label="Duration (Min)" type="number" placeholder="30" error={errors.duration?.message} {...register("duration", {
            required: t("pages.admin.servicesmanagement.durationIsRequired")
          })} />

            <div className="space-y-2">
              <label className="text-sm font-bold tracking-tight text-slate-700 ml-1">{t("pages.admin.servicesmanagement.category")}</label>
              <select className="w-full h-12 rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all" {...register("category", {
              required: t("pages.admin.servicesmanagement.categoryIsRequired")
            })}>
                <option value="General">{t("pages.admin.servicesmanagement.generalConsultation")}</option>
                <option value="Cardiology">{t("pages.admin.servicesmanagement.cardiology")}</option>
                <option value="Neurology">{t("pages.admin.servicesmanagement.neurology")}</option>
                <option value="Pediatrics">{t("pages.admin.servicesmanagement.pediatrics")}</option>
                <option value="Radiology">{t("pages.admin.servicesmanagement.radiology")}</option>
                <option value="Laboratory">{t("pages.admin.servicesmanagement.laboratory")}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold tracking-tight text-slate-700 ml-1">{t("pages.admin.servicesmanagement.status2")}</label>
              <select className="w-full h-12 rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all" {...register("status", {
              required: t("pages.admin.servicesmanagement.statusIsRequired")
            })}>
                <option value="active">{t("pages.admin.servicesmanagement.active")}</option>
                <option value="inactive">{t("pages.admin.servicesmanagement.inactive")}</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-bold tracking-tight text-slate-700 ml-1">{t("pages.admin.servicesmanagement.descriptionOptional")}</label>
             <textarea className="w-full h-24 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-medium outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all" placeholder={t("pages.admin.servicesmanagement.detailedDescriptionOfTheService")} {...register("description")} />
          </div>
          
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-50 pt-8">
            <Button variant="ghost" onClick={handleCloseModal} className="h-12 px-8">{t("pages.admin.servicesmanagement.cancel")}</Button>
            <Button type="submit" className="h-12 px-10">
              {editingService ? "Save Changes" : "Create Service"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>;
}
export default ServicesManagement;
