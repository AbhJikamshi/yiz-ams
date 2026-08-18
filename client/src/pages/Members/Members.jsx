import { useState } from "react";
import toast from "react-hot-toast";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import DashboardLayout from "../../components/layout/DashboardLayout";
import MemberTable from "../../components/members/MemberTable";
import MemberSearch from "../../components/members/MemberSearch";
import MemberModal from "../../components/members/MemberModal";
import MemberForm from "../../components/members/MemberForm";
import DeleteMemberModal from "../../components/members/DeleteMemberModal";

import {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
} from "../../services/memberService";

const Members = () => {
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const queryClient = useQueryClient();

  const {
    data: members = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
  });

  // ===============================
  // Create Member
  // ===============================
  const createMutation = useMutation({
    mutationFn: createMember,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members"],
      });

      setOpenModal(false);
      setSelectedMember(null);

      toast.success("Member created successfully!");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Unable to create member."
      );
    },
  });

  // ===============================
  // Update Member
  // ===============================
  const updateMutation = useMutation({
    mutationFn: ({ id, member }) =>
      updateMember(id, member),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members"],
      });

      setOpenModal(false);
      setSelectedMember(null);

      toast.success("Member updated successfully!");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Unable to update member."
      );
    },
  });

  // ===============================
  // Delete Member
  // ===============================
  const deleteMutation = useMutation({
    mutationFn: deleteMember,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members"],
      });

      setDeleteModal(false);
      setSelectedMember(null);

      toast.success("Member deleted successfully!");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete member."
      );
    },
  });

  // ===============================
  // Search
  // ===============================
  const filteredMembers = members.filter((member) =>
    member.fullName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // ===============================
  // Add Member
  // ===============================
  const handleAddMember = () => {
    setSelectedMember(null);
    setOpenModal(true);
  };

  // ===============================
  // Edit Member
  // ===============================
  const handleEditMember = (member) => {
    setSelectedMember(member);
    setOpenModal(true);
  };

  // ===============================
  // Open Delete Modal
  // ===============================
  const handleDeleteMember = (member) => {
    setSelectedMember(member);
    setDeleteModal(true);
  };

  // ===============================
  // Confirm Delete
  // ===============================
  const confirmDelete = () => {
    if (!selectedMember) return;

    deleteMutation.mutate(selectedMember.id);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold">
          Members Management
        </h1>

        <p className="mt-6">
          Loading members...
        </p>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold">
          Members Management
        </h1>

        <p className="text-red-600 mt-6">
          Unable to load members.
        </p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

<div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">

  <div className="min-w-0">

    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
      Members Management
    </h1>

    <p className="mt-2 text-sm text-gray-500 sm:text-base">
      Manage all registered association members.
    </p>

  </div>

  <button
    type="button"
    onClick={handleAddMember}
    className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto sm:shrink-0"
  >
    + Add Member
  </button>

</div>

  <div className="mb-6">
        <MemberSearch
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      <MemberTable
        members={filteredMembers}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
      />

      {/* Add/Edit Modal */}

      <MemberModal
        open={openModal}
        title={
          selectedMember
            ? "Edit Member"
            : "Add New Member"
        }
        onClose={() => {
          setOpenModal(false);
          setSelectedMember(null);
        }}
      >
        <MemberForm
          member={selectedMember}
          loading={
            createMutation.isPending ||
            updateMutation.isPending
          }
          onSubmit={(data) => {
            if (selectedMember) {
              updateMutation.mutate({
                id: selectedMember.id,
                member: data,
              });
            } else {
              createMutation.mutate(data);
            }
          }}
        />
      </MemberModal>

      {/* Delete Confirmation Modal */}

      <DeleteMemberModal
        open={deleteModal}
        member={selectedMember}
        loading={deleteMutation.isPending}
        onClose={() => {
          setDeleteModal(false);
          setSelectedMember(null);
        }}
        onConfirm={confirmDelete}
      />

    </DashboardLayout>
  );
};

export default Members;
