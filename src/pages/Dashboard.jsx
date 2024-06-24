import React, { useMemo, useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import EditDataForm from '../components/EditDataForm';
import AddDataForm from '../components/AddDataForm';
import DeleteConfirmation from '../components/DeleteConfirmation';

import { useTasks, useAddTask, useUpdateTask, useDeleteTask, useAddProject } from '../integrations/supabase/index.js';

const Dashboard = () => {
  const { data: tasks, refetch } = useTasks();
  const addTaskMutation = useAddTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const addProjectMutation = useAddProject();

  const [selectedData, setSelectedData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = useMemo(
    () => [
      {
        Header: 'Task',
        accessor: 'task',
      },
      {
        Header: 'Meeting',
        accessor: 'meeting',
      },
      {
        Header: 'Project',
        accessor: 'project',
      },
      {
        Header: 'Actions',
        Cell: ({ row }) => (
          <div className="space-x-2">
            <button
              onClick={() => handleEdit(row.original)}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(row.original)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const handleEdit = (data) => {
    setSelectedData(data);
    setIsEditing(true);
  };

  const handleDelete = (data) => {
    setSelectedData(data);
    setIsDeleting(true);
  };

  const handleSave = async (updatedData) => {
    if (isAdding) {
      await addTaskMutation.mutateAsync(updatedData);
    } else if (isEditing) {
      await updateTaskMutation.mutateAsync(updatedData);
    }
    refetch();
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleSaveProject = async (newProjectData) => {
    await addProjectMutation.mutateAsync(newProjectData);
    refetch();
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setIsDeleting(false);
  };

  const handleConfirmDelete = async () => {
    await deleteTaskMutation.mutateAsync(selectedData.task_id);
    refetch();
    setIsDeleting(false);
  };

  useEffect(() => {
    refetch();
  }, [addTaskMutation.isSuccess, updateTaskMutation.isSuccess, deleteTaskMutation.isSuccess]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>Welcome back, John! Here's a quick overview of your projects and tasks.</p>
      <div className="mt-8">
        <button
          onClick={() => setIsAdding(true)}
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        >
          Add New
        </button>
        <DataTable columns={columns} data={tasks || []} />
      </div>
      {isEditing && (
        <EditDataForm
          selectedData={selectedData}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      {isAdding && (
        <AddDataForm
          onSave={handleSaveProject}
          onCancel={handleCancel}
        />
      )}
      {isDeleting && (
        <DeleteConfirmation
          onConfirm={handleConfirmDelete}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default Dashboard;