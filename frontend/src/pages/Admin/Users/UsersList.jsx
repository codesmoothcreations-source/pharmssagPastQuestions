// src/pages/Admin/Users/UsersList.jsx
import React, { useState } from 'react'
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
  FaDownload,
  FaFilter
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

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.')
      navigate('/dashboard')
    }
  }, [isAdmin, navigate])

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter, statusFilter],
    queryFn: () => usersApi.getAll({
      page,
      limit,
      search,
      role: roleFilter || undefined,
      isActive: statusFilter ? statusFilter === 'active' : undefined
    }),
    enabled: isAdmin
  })

  const users = usersData?.data || []
  const totalUsers = usersData?.pagination?.total || 0
  const totalPages = usersData?.pagination?.pages || 1

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => usersApi.update(userId, data),
    onSuccess: () => {
      toast.success('User updated successfully')
      queryClient.invalidateQueries(['admin-users'])
      setShowEditModal(false)
      setSelectedUser(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user')
    }
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId) => usersApi.delete(userId),
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries(['admin-users'])
      setShowDeleteModal(false)
      setSelectedUser(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  })

  // Activate/Deactivate user mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }) => 
      isActive ? usersApi.activate(userId) : usersApi.deactivate(userId),
    onSuccess: (_, variables) => {
      toast.success(`User ${variables.isActive ? 'activated' : 'deactivated'} successfully`)
      queryClient.invalidateQueries(['admin-users'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user status')
    }
  })

  const handleEdit = (user) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleDelete = (user) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const handleUpdateUser = (formData) => {
    if (!selectedUser) return
    updateUserMutation.mutate({
      userId: selectedUser._id,
      data: formData
    })
  }

  const handleConfirmDelete = () => {
    if (!selectedUser) return
    deleteUserMutation.mutate(selectedUser._id)
  }

  const handleToggleStatus = (user) => {
    toggleUserStatusMutation.mutate({
      userId: user._id,
      isActive: !user.isActive
    })
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className={styles.unauthorized}>
          <Card>
            <div className={styles.unauthorizedContent}>
              <FaUserShield className={styles.unauthorizedIcon} />
              <h2>Admin Access Required</h2>
              <p>You need administrator privileges to access this page.</p>
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className={styles.usersList}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <FaUsers className={styles.titleIcon} />
              User Management
            </h1>
            <p className={styles.subtitle}>
              Manage all platform users ({totalUsers} total)
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="outline"
              leftIcon={<FaDownload />}
              onClick={() => toast('Export feature coming soon', { icon: 'ℹ️' })}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className={styles.filtersCard}>
          <div className={styles.filters}>
            <div className={styles.searchGroup}>
              <Input
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                leftIcon={<FaSearch />}
                fullWidth
              />
            </div>
            <div className={styles.filterGroup}>
              <select
                className={styles.filterSelect}
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              <select
                className={styles.filterSelect}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Loader text="Loading users..." />
          </div>
        ) : (
          <>
            <Card className={styles.tableCard}>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="7" className={styles.emptyState}>
                          <FaUsers className={styles.emptyIcon} />
                          <p>No users found</p>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <div className={styles.userCell}>
                              <div className={styles.avatar}>
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div className={styles.userInfo}>
                                <div className={styles.userName}>{user.name || 'N/A'}</div>
                                <div className={styles.userId}>ID: {user._id?.slice(-8)}</div>
                              </div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`${styles.roleBadge} ${user.role === 'ADMIN' ? styles.adminBadge : styles.userBadge}`}>
                              {user.role || 'USER'}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`${styles.statusButton} ${user.isActive ? styles.active : styles.inactive}`}
                              onClick={() => handleToggleStatus(user)}
                              disabled={toggleUserStatusMutation.isLoading}
                            >
                              {user.isActive ? (
                                <>
                                  <FaUserCheck /> Active
                                </>
                              ) : (
                                <>
                                  <FaUserTimes /> Inactive
                                </>
                              )}
                            </button>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : 'Never'}
                          </td>
                          <td>
                            <div className={styles.actions}>
                              <Button
                                size="small"
                                variant="outline"
                                onClick={() => handleEdit(user)}
                                disabled={user._id === currentUser?._id}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                size="small"
                                variant="danger"
                                onClick={() => handleDelete(user)}
                                disabled={user._id === currentUser?._id || user.role === 'ADMIN'}
                              >
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

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalUsers}
                itemsPerPage={limit}
                onPageChange={setPage}
              />
            )}
          </>
        )}

        {/* Edit User Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedUser(null)
          }}
          title="Edit User"
          size="medium"
        >
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              onSubmit={handleUpdateUser}
              onCancel={() => {
                setShowEditModal(false)
                setSelectedUser(null)
              }}
              loading={updateUserMutation.isLoading}
            />
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedUser(null)
          }}
          title="Delete User"
          size="small"
        >
          <div className={styles.deleteModal}>
            <p>Are you sure you want to delete this user?</p>
            {selectedUser && (
              <div className={styles.deleteUserInfo}>
                <div className={styles.deleteAvatar}>
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className={styles.deleteName}>{selectedUser.name}</div>
                  <div className={styles.deleteEmail}>{selectedUser.email}</div>
                </div>
              </div>
            )}
            <p className={styles.deleteWarning}>
              This action cannot be undone. All user data will be permanently removed.
            </p>
            <div className={styles.deleteActions}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedUser(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                loading={deleteUserMutation.isLoading}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

// Edit User Form Component
function EditUserForm({ user, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'USER',
    isActive: user.isActive !== undefined ? user.isActive : true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.editForm}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Full Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          fullWidth
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Email</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          fullWidth
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Role</label>
          <select
            className={styles.select}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Status</label>
          <select
            className={styles.select}
            value={formData.isActive ? 'active' : 'inactive'}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className={styles.formActions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}

