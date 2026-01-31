import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../components/layout/Layout/Layout'
import Card from '../../../components/ui/Card/Card'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Modal from '../../../components/ui/Modal/Modal'
import Loader from '../../../components/ui/Loader/Loader'
import Pagination from '../../../components/ui/Pagination/Pagination'
import { useAuth } from '../../../contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../../../api/usersApi'
import {
  FaUsers,
  FaSearch,
  FaEdit,
  FaTrash,
  FaUserShield,
  FaUserCheck,
  FaUserTimes,
  FaDownload
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import styles from './UsersList.module.css'

export default function UsersList() {
  const { user: currentUser, isAdmin } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const limit = 20

  // Admin Redirect Logic
  useEffect(() => {
    if (isAdmin === false) {
      toast.error('Access denied. Admin privileges required.')
      navigate('/dashboard')
    }
  }, [isAdmin, navigate])

  // Fetch Users Query
  const { data: usersData, isLoading, isError, error } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter, statusFilter],
    queryFn: () => usersApi.getAll({
      page,
      limit,
      search,
      role: roleFilter || undefined,
      isActive: statusFilter ? statusFilter === 'active' : undefined
    }),
    enabled: !!isAdmin
  })

  // --- DATA EXTRACTION FIX ---
  // This ensures we catch the users regardless of your API's response structure
  const users = Array.isArray(usersData) 
    ? usersData 
    : (usersData?.data || usersData?.users || []);

  const totalUsers = usersData?.pagination?.total || usersData?.total || users.length;
  const totalPages = usersData?.pagination?.pages || usersData?.pages || 1;

  // Debug helper: Check your browser console to see what the API actually sends!
  useEffect(() => {
    if (usersData) {
      console.log('API Response Structure:', usersData);
      console.log('Extracted Users Array:', users);
    }
  }, [usersData, users]);

  // Mutations (Logic Preserved)
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => usersApi.update(userId, data),
    onSuccess: () => {
      toast.success('User updated successfully')
      queryClient.invalidateQueries(['admin-users'])
      setShowEditModal(false)
      setSelectedUser(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed')
  })

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => usersApi.delete(userId),
    onSuccess: () => {
      toast.success('User deleted')
      queryClient.invalidateQueries(['admin-users'])
      setShowDeleteModal(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed')
  })

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }) => 
      isActive ? usersApi.activate(userId) : usersApi.deactivate(userId),
    onSuccess: () => queryClient.invalidateQueries(['admin-users']),
    onError: (err) => toast.error('Status update failed')
  })

  const handleEdit = (user) => { setSelectedUser(user); setShowEditModal(true); }
  const handleDelete = (user) => { setSelectedUser(user); setShowDeleteModal(true); }
  const handleUpdateUser = (formData) => {
    updateUserMutation.mutate({ userId: selectedUser._id, data: formData })
  }
  const handleToggleStatus = (user) => {
    toggleUserStatusMutation.mutate({ userId: user._id, isActive: !user.isActive })
  }

  if (!isAdmin && isAdmin !== undefined) {
    return <Layout><div className={styles.unauthorized}><h2>Restricted Access</h2></div></Layout>
  }

  return (
    <Layout>
      <div className={styles.usersList}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <FaUsers className={styles.titleIcon} />
              User Management
            </h1>
            <p className={styles.subtitle}>
              Showing {users.length} of {totalUsers} total users
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="outline" leftIcon={<FaDownload />}>Export CSV</Button>
          </div>
        </header>

        <Card className={styles.filtersCard}>
          <div className={styles.filters}>
            <div className={styles.searchGroup}>
              <Input
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                leftIcon={<FaSearch />}
                fullWidth
              />
            </div>
            <div className={styles.filterGroup}>
              <select className={styles.filterSelect} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className={styles.loadingContainer}><Loader text="Loading User Database..." /></div>
        ) : isError ? (
          <div className={styles.errorState}>
            <p>Error loading users: {error.message}</p>
            <Button onClick={() => queryClient.invalidateQueries(['admin-users'])}>Retry</Button>
          </div>
        ) : (
          <>
            <Card className={styles.tableCard}>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>User Info</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="6" className={styles.emptyState}>
                          <p>No users found in the database.</p>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user._id || user.id}>
                          <td>
                            <div className={styles.userCell}>
                              <div className={styles.avatar}>{user.name?.[0] || 'U'}</div>
                              <div className={styles.userInfo}>
                                <div className={styles.userName}>{user.name}</div>
                                <div className={styles.userId}>ID: {user._id?.slice(-6)}</div>
                              </div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`${styles.roleBadge} ${user.role === 'ADMIN' ? styles.adminBadge : styles.userBadge}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`${styles.statusButton} ${user.isActive ? styles.active : styles.inactive}`}
                              onClick={() => handleToggleStatus(user)}
                              disabled={toggleUserStatusMutation.isLoading}
                            >
                              {user.isActive ? <FaUserCheck /> : <FaUserTimes />}
                              {user.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <div className={styles.actions}>
                              <Button size="small" variant="outline" onClick={() => handleEdit(user)} disabled={user._id === currentUser?._id}>
                                <FaEdit />
                              </Button>
                              <Button size="small" variant="danger" onClick={() => handleDelete(user)} disabled={user._id === currentUser?._id || user.role === 'ADMIN'}>
                                <FaTrash />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {totalPages > 1 && (
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </>
        )}

        {/* Edit Modal */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User">
          {selectedUser && (
            <EditUserForm 
              user={selectedUser} 
              onSubmit={handleUpdateUser} 
              onCancel={() => setShowEditModal(false)} 
              loading={updateUserMutation.isLoading} 
            />
          )}
        </Modal>

        {/* Delete Modal */}
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account">
          <div className={styles.deleteModal}>
            <p>Delete <strong>{selectedUser?.name}</strong>? This cannot be undone.</p>
            <div className={styles.deleteActions}>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => deleteUserMutation.mutate(selectedUser._id)} loading={deleteUserMutation.isLoading}>Confirm</Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

// Edit Form (Kept identical logic, just ensured name matches)
function EditUserForm({ user, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'USER',
    isActive: user.isActive ?? true
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className={styles.editForm}>
      <div className={styles.formGroup}>
        <label>Full Name</label>
        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required fullWidth />
      </div>
      <div className={styles.formGroup}><label>Email</label><Input value={formData.email} disabled fullWidth /></div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Role</label>
          <select className={styles.select} value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
            <option value="USER">User</option><option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Status</label>
          <select className={styles.select} value={formData.isActive ? 'active' : 'inactive'} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}>
            <option value="active">Active</option><option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className={styles.formActions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading}>Save</Button>
      </div>
    </form>
  )
}