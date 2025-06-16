import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table';
import AdminHeader from '../components/admin/AdminHeader';
import AdminNavbar from '../components/admin/AdminNavbar';
import { getUsers, updateUserRole, deleteUser, getMyLakesById, removeLake } from '../services/admin.service';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
import { APP_STRINGS } from '../constants/strings';
import { format } from 'date-fns';
import { Dialog } from "@mui/material";
import { User } from 'oidc-client-ts';

interface UsersResponse {
  usersCount: {
    totalUsers: number;
    totalSuperAdmin: number;
    totalLakeAdmin: number;
    totalLakeSubscribers: number;
  };
  users: User[];
  paginationToken: string | null;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState(60);
  const [paginationToken, setPaginationToken] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string, role: string } | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSuperAdmins, setTotalSuperAdmins] = useState(0);
  const [totalLakeAdmins, setTotalLakeAdmins] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [firstLakeMembers, setFirstLakeMembers] = useState<any[]>([]);
  const [showRemoveLakeDialog, setShowRemoveLakeDialog] = useState(false);
  const [userToRemoveLake, setUserToRemoveLake] = useState<any>(null);
  const [sorting, setSorting] = useState([
    {
      id: 'fullname',
      desc: false,
    },
  ]);
  const [counts, setCounts] = useState({
    totalUsers: 0,
    totalSuperAdmin: 0,
    totalLakeAdmin: 0,
    totalLakeSubscribers: 0,
  });

  useEffect(() => {
    const idToken = localStorage.getItem("adminToken");
    if (!idToken) {
      navigate("/admin/login");
      return;
    }

    try {
      const user = JSON.parse(atob(idToken.split(".")[1])); // Decode JWT token
      if (user["custom:role"] !== "Super Admin") {
        navigate("/admin/login");
      } else {
        setAdmin(user);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("currentUserProfile");
      navigate("/admin/login");
    }
  }, [navigate]);

  const fetchUsers = useCallback(async () => {
    if (!admin) return;

    try {
      const idToken = localStorage.getItem("adminToken");
      if (!idToken) {
        navigate("/admin/login");
        return;
      }

      setLoading(true);
      const response = await getUsers(pageSize, '', paginationToken);
      const users = response.users || [];
      
      setUsers(users);
      setPaginationToken(response.paginationToken || '');

      if (response.userCounts) {
        setCounts({
          totalUsers: response.userCounts.totalUsers,
          totalSuperAdmin: response.userCounts.totalSuperAdmin,
          totalLakeAdmin: response.userCounts.totalLakeAdmin,
          totalLakeSubscribers: response.userCounts.totalLakeSubscribers,
        });
      }
    } catch (error) {
      console.error(APP_STRINGS.ERROR_FETCHING_COGNITO_USERS, error);
      if (error.message === APP_STRINGS.NO_ID_TOKEN) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("currentUserProfile");
        navigate("/admin/login");
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [pageSize, paginationToken, navigate, admin]);

  const fetchMyLakesById = useCallback(async () => {
    try {
      const response = await getMyLakesById();
      if (response.lakes && response.lakes.length > 0) {
        setFirstLakeMembers(response.lakes[0].members || []);
      }
    } catch (error) {
      console.error(APP_STRINGS.NO_LAKES_FOUND, error);
    }
  }, []);

  useEffect(() => {
    if (admin) {
      fetchMyLakesById();
    }
  }, [admin, fetchMyLakesById]);

  const handleRoleChange = (userName: string, newRole: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userName ? { ...user, role: newRole } : user
      )
    );
    setSelectedUser({ id: userName, role: newRole });
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      await updateUserRole(selectedUser.id, selectedUser.role);

      // Update the user role in the state immediately
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === selectedUser.id ? { ...user, role: selectedUser.role } : user
        )
      );

      setSelectedUser(null);
      setShowDialog(false);
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete);

      // Remove the user from the state immediately
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete));

      setUserToDelete(null);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error(APP_STRINGS.ERROE_DELETING_USER, error);
    }
  };

  // Initial load
  useEffect(() => {
    if (admin) {
      fetchUsers();
    }
  }, [admin, fetchUsers]);

  const handleCancel = () => {
    setShowRemoveLakeDialog(false);
    navigate('/admin/dashboard');
  };

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'action',
        header: '',
        size: 30,
        class: 'text-center',
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              className='admin-save-btn'
              disabled={!selectedUser || selectedUser.id !== row.original.id}
              onClick={() => setShowDialog(true)}
            >
              <i className='fa-thin fa-save'></i>
            </button>
            <button
              className='admin-delete-btn'
              onClick={() => {
                setUserToDelete(row.original.id);
                setShowDeleteDialog(true);
              }}
            >
              <i className='fa-thin fa-trash'></i>
            </button>
          </div>
        ),
      },
      {
        accessorKey: 'fullname',
        header: APP_STRINGS.NAME_LABEL,
        size: 140
      },
      {
        accessorKey: 'email',
        header: APP_STRINGS.EMAIL_LABEL,
      },
      {
        accessorKey: 'subscription',
        header: APP_STRINGS.SUB_LABEL,
        size: 140,
        Cell: ({ cell }) => {
          const value = cell.getValue();

          // Normalize string 'false' or 'true' to booleans
          let normalizedValue;
          if (typeof value === 'string') {
            normalizedValue = value.toLowerCase() === 'true';
          } else {
            normalizedValue = Boolean(value);
          }

          if (value === undefined || value === null) {
            return <span>N/A</span>;
          }

          return <span>{normalizedValue ? 'Yes' : 'No'}</span>;
        },
      },
      {
        accessorKey: 'role',
        header: 'Role',
        Cell: ({ cell }) => {
          const userId = cell.row.original.id;
          const currentRole = cell.getValue<string>();
          return (
            <select
              value={currentRole}
              onChange={(e) => handleRoleChange(userId, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value="User">{APP_STRINGS.MEMBER}</option>
              <option value="Admin">{APP_STRINGS.LAKEADMIN}</option>
              <option value="Super Admin">{APP_STRINGS.SUPER_ADMIN}</option>
            </select>
          );
        },
      },
      {
        accessorKey: 'lakeName',
        header: APP_STRINGS.LAKE_LABEL,
        size: 40,
      },
      {
        accessorKey: 'removeLake',
        header: 'Remove Lake',
        Cell: ({ row }) => {
          const user = row.original;
          const isEligibleRole = user.role === 'User' || user.role === 'Local Admin';
          const hasLake = !!user.lakeName;

          const canRemoveLake = isEligibleRole && hasLake;

          return canRemoveLake ? (
            <button
              onClick={() => {
                setUserToRemoveLake(user);
                setShowRemoveLakeDialog(true);
              }}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Remove Lake
            </button>
          ) : (
            <span className="text-gray-400">N/A</span>
          );
        },
      },
      {
        accessorKey: 'userLastModifiedDate',
        header: APP_STRINGS.LAST_LOGIN,
        Cell: ({ cell }) => {
          const rawValue = cell.getValue<string>();
          const date = new Date(rawValue);

          if (!rawValue || isNaN(date.getTime())) {
            return 'N/A';
          }

          return format(date, "MMM dd, yyyy, hh:mmaaa 'EST'");
        },
      },
    ],
    [selectedUser, firstLakeMembers]
  );

  return admin ? (
    <>
      <AdminHeader />
      <main className="flex">
        <div className="flex-1 admin-dashboard-content">
          <div>
            {loading ? (
              <div>{APP_STRINGS.LOADING}</div>
            ) : (
              <>
                <div className='flex justify-between items-center'>
                  <h1>{APP_STRINGS.USER_ADMINISTRATION}</h1>
                </div>
                <div className="mb-4 user-stats">
                  <p><strong>{counts.totalUsers}</strong> {APP_STRINGS.TOTAL_MEMBERS} | <strong>{counts.totalSuperAdmin}</strong> {APP_STRINGS.SUPER_ADMINS} | <strong>{counts.totalLakeAdmin}</strong> {APP_STRINGS.LAKE_ADMINS} | <strong>{counts.totalLakeSubscribers}</strong> {APP_STRINGS.SUBSCRIBERS}</p>
                </div>
                <div className="responsive-table">
                  <MaterialReactTable
                    columns={columns}
                    data={users}
                    state={{ sorting }}
                    onSortingChange={setSorting}
                    enableGlobalFilter={true}
                  
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      {showRemoveLakeDialog && userToRemoveLake && (
        <Dialog
          open={showRemoveLakeDialog}
          onClose={handleCancel}
          PaperProps={{
            style: {
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%'
            }
          }}
        >
          <div className="confirmation-dialog checkout-dialog">
            <h2 className="text-xl font-semibold mb-2">Are you sure?</h2>
            <p className="mb-4">
              Removing a user's lake takes immediate effect and requires the user to associate themselves with a new lake.
              This may incur additional costs on the user's end. Please be sure you want to remove this user's lake.
            </p>
            <div className="dialog-buttons">
              <button
                className="proceed-button"
                onClick={async () => {
                  try {
                    await removeLake(userToRemoveLake.id);
                    setShowRemoveLakeDialog(false);
                    setUserToRemoveLake(null);
                    fetchUsers();
                  } catch (err) {
                    console.error('Error removing lake:', err);
                    alert('Failed to remove lake.');
                  }
                }}
              >
                Remove Lake
              </button>
              <button
                onClick={() => {
                  setShowRemoveLakeDialog(false);
                  setUserToRemoveLake(null);
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </Dialog>
      )}
      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>{APP_STRINGS.ARE_YOU_SURE_CHANGE_ROLE}</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDialog(false)}
                className="mr-4 px-4 py-2 bg-gray-300 rounded"
              >
                {APP_STRINGS.CANCEL}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {APP_STRINGS.YES}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>{APP_STRINGS.ARE_YOU_SURE_DELETE_USER}</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="mr-4 px-4 py-2 bg-gray-300 rounded"
              >
                {APP_STRINGS.CANCEL}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                {APP_STRINGS.YES}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  ) : <p>{APP_STRINGS.LOADING}</p>;
};

export default AdminDashboard;
