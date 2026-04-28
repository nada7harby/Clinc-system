import { useState, useEffect } from "react";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/useUsers";
import { useAuthStore } from "@/store/authStore";
import { Table, Button, Badge, Modal, Input, Card, Icon } from "@/components";
import { ROLES } from "@/constants/appConstants";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { classNames } from "@/utils";

function UsersManagement() {
  const { user: currentUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 8;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearchTerm(searchTerm), 350);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, roleFilter, statusFilter]);

  const { data: usersData, isLoading } = useUsers({
    search: debouncedSearchTerm,
    role: roleFilter === "all" ? "" : roleFilter,
    status: statusFilter === "all" ? "" : statusFilter,
    page,
    limit,
  });
  const { mutate: createUser } = useCreateUser();
  const { mutate: updateUser } = useUpdateUser();
  const { mutate: deleteUser } = useDeleteUser();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();
  const selectedRole = watch("role");

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      reset(user);
    } else {
      reset({
        name: "",
        email: "",
        role: ROLES.DOCTOR,
        specialization: "",
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const onSubmit = (data) => {
    if (editingUser) {
      updateUser({ id: editingUser.id, data }, { onSuccess: handleCloseModal });
    } else {
      createUser(data, { onSuccess: handleCloseModal });
    }
  };

  const toggleStatus = (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    updateUser({ id: user.id, data: { status: newStatus } });
  };

  const columns = [
    {
      header: "Professional",
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 shadow-sm border border-slate-200 group-hover:border-brand-500/20 transition-all">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-none">{row.name}</p>
            <p className="mt-1.5 text-xs font-medium text-slate-400">
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Access Level",
      render: (row) => (
        <Badge
          tone={
            row.role === ROLES.ADMIN
              ? "danger"
              : row.role === ROLES.DOCTOR
              ? "primary"
              : "secondary"
          }
        >
          {row.role}
        </Badge>
      ),
    },
    {
      header: "Specialization",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
          <span className="text-sm font-bold text-slate-500">
            {row.specialization || "General Operations"}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <button
          onClick={() => toggleStatus(row)}
          className={classNames(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all",
            row.status === "active"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100 text-slate-400",
          )}
        >
          <div
            className={classNames(
              "h-2 w-2 rounded-full",
              row.status === "active"
                ? "bg-emerald-500 animate-pulse"
                : "bg-slate-400",
            )}
          ></div>
          <span className="text-[10px] font-black uppercase tracking-widest">
            {row.status}
          </span>
        </button>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(row)}
            className="h-9 w-9 p-0 rounded-xl hover:bg-brand-50 hover:text-brand-600"
          >
            <Icon name="faPen" className="text-xs" />
          </Button>
          {row.id !== currentUser.id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure?")) deleteUser(row.id);
              }}
              className="h-9 w-9 p-0 rounded-xl hover:bg-rose-50 hover:text-rose-600"
            >
              <Icon name="faTrash" className="text-xs" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            Staff Directory
          </h1>
          <p className="mt-2 text-lg font-medium text-slate-500">
            Manage clinical credentials, roles, and system permissions.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="h-12 px-8 rounded-2xl shadow-xl shadow-brand-500/20"
        >
          <Icon name="faUserPlus" className="mr-3" />
          Register New Member
        </Button>
      </div>

      <Card className="p-0 overflow-hidden" variant="premium">
        <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[300px]">
            <Icon
              name="faSearch"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
            />
            <input
              type="text"
              placeholder="Search by name, email or specialty..."
              className="h-12 w-full rounded-2xl border-2 border-transparent bg-white pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-brand-500/10 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">
                Role
              </span>
              {["all", ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.ADMIN].map(
                (role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={classNames(
                      "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all",
                      roleFilter === role
                        ? "bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-900/20"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300",
                    )}
                  >
                    {role}
                  </button>
                ),
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">
                Status
              </span>
              {["all", "active", "inactive"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={classNames(
                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all",
                    statusFilter === status
                      ? "bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300",
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4">
          <Table
            columns={columns}
            data={usersData?.data}
            isLoading={isLoading}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-white/70 px-6 py-4 text-xs font-bold text-slate-500">
          <span className="uppercase tracking-widest">
            Page {usersData?.meta?.page || 1} of {usersData?.meta?.totalPages || 1}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={usersData?.meta?.page <= 1}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((prev) =>
                  Math.min(prev + 1, usersData?.meta?.totalPages || 1),
                )
              }
              disabled={usersData?.meta?.page >= (usersData?.meta?.totalPages || 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingUser ? "Update Staff Credentials" : "Register Staff Member"
        }
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              placeholder="Dr. John Doe"
              error={errors.name?.message}
              {...register("name", { required: "Legal name is required" })}
            />
            <Input
              label="Professional Email"
              placeholder="john@medicore.com"
              error={errors.email?.message}
              {...register("email", {
                required: "Professional email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email format",
                },
              })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-tight text-slate-700 ml-1">
                Access Level (Role)
              </label>
              <select
                className="w-full h-12 rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all"
                {...register("role", { required: "Role is required" })}
              >
                <option value={ROLES.DOCTOR}>Doctor</option>
                <option value={ROLES.RECEPTIONIST}>Receptionist</option>
                <option value={ROLES.ADMIN}>Administrator</option>
              </select>
            </div>

            <AnimatePresence>
              {selectedRole === ROLES.DOCTOR && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Input
                    label="Clinical Specialization"
                    placeholder="e.g. Cardiology"
                    {...register("specialization")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!editingUser && (
            <Input
              label="Temporary Password"
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Initial password is required",
              })}
            />
          )}

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-50 pt-8">
            <Button
              variant="ghost"
              onClick={handleCloseModal}
              className="h-12 px-8"
            >
              Cancel
            </Button>
            <Button type="submit" className="h-12 px-10">
              {editingUser ? "Save Changes" : "Confirm Registration"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default UsersManagement;
