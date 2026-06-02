import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/authStore";
import { useUpdatePatient } from "@/hooks/usePatients";
import { Card, Icon, Button, Input, Badge } from "@/components";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
function ProfilePage() {
  const {
    t
  } = useTranslation();
  const {
    user,
    updateUser
  } = useAuthStore();
  const {
    mutate: updatePatient,
    isLoading
  } = useUpdatePatient();
  const {
    register,
    handleSubmit,
    formState: {
      isDirty
    }
  } = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
      phone: user?.phone || "",
      age: user?.age || "",
      gender: user?.gender || "not-specified"
    }
  });
  const onSubmit = data => {
    if (!user?.id) return;
    updatePatient({
      id: user.id,
      data
    }, {
      onSuccess: updated => {
        updateUser(updated);
        toast.success(t("pages.patient.profilepage.profileUpdatedSuccessfully"));
      }
    });
  };
  return <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <header>
        <span className="hud-chip">{t("pages.patient.profilepage.identityManagement")}</span>
        <h1 className="mt-4 text-4xl font-black text-slate-900 uppercase tracking-tight">{t("pages.patient.profilepage.accountProfile")}</h1>
        <p className="mt-2 text-slate-500 font-medium">{t("pages.patient.profilepage.manageYourPersonalInformationSecuritySettingsAnd")}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center p-8">
            <div className="relative inline-block">
              <div className="h-32 w-32 rounded-[40px] bg-brand-50 text-brand-500 flex items-center justify-center text-4xl font-black border-4 border-white shadow-xl">
                {user?.name?.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg border-2 border-white hover:bg-brand-600 transition-colors">
                <Icon name="faCamera" />
              </button>
            </div>
            <h2 className="mt-6 text-xl font-bold text-slate-900">
              {user?.name}
            </h2>
            <Badge tone="primary" className="mt-2 uppercase tracking-widest text-[9px] font-black">
              {user?.role}{t("pages.patient.profilepage.id")}{user?.id}
            </Badge>

            <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest">{t("pages.patient.profilepage.joined")}</span>
                <span className="font-black text-slate-700">{t("pages.patient.profilepage.oct2023")}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest">{t("pages.patient.profilepage.status")}</span>
                <Badge tone="success" className="text-[9px]">{t("pages.patient.profilepage.verified")}</Badge>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card variant="premium" className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Full Name" {...register("name", {
                required: true
              })} icon="faUser" />
                <Input label="Email Address" type="email" {...register("email", {
                required: true
              })} icon="faEnvelope" />
                <Input label="Phone Number" {...register("phone")} icon="faPhone" />
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t("pages.patient.profilepage.gender")}</label>
                  <select {...register("gender")} className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-brand-500 transition-all appearance-none">
                    <option value="male">{t("pages.patient.profilepage.male")}</option>
                    <option value="female">{t("pages.patient.profilepage.female")}</option>
                    <option value="other">{t("pages.patient.profilepage.other")}</option>
                    <option value="not-specified">{t("pages.patient.profilepage.preferNotToSay")}</option>
                  </select>
                </div>
                <Input label="Age" type="number" {...register("age")} icon="faCalendar" />
              </div>

              <div className="pt-6 border-t border-slate-50 flex justify-end gap-4">
                <Button variant="ghost" type="button" onClick={() => window.location.reload()}>{t("pages.patient.profilepage.discardChanges")}</Button>
                <Button type="submit" disabled={!isDirty || isLoading}>
                  {isLoading ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="mt-8 border-rose-100 bg-rose-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t("pages.patient.profilepage.securityAccess")}</h3>
                <p className="text-sm text-slate-500 font-medium">{t("pages.patient.profilepage.keepYourAccountSecureByUpdatingYour")}</p>
              </div>
              <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50">{t("pages.patient.profilepage.changePassword")}</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>;
}
export default ProfilePage;
