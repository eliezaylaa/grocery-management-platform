import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2, Shield, User as UserIcon } from 'lucide-react';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        loadUsers();
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      manager: 'bg-blue-100 text-blue-800 border-blue-200',
      employee: 'bg-green-100 text-green-800 border-green-200',
      customer: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return styles[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRoleIcon = (role) => {
    if (role === 'admin' || role === 'manager') return <Shield size={20} />;
    return <UserIcon size={20} />;
  };

  const filteredUsers = filterRole === 'all' 
    ? users 
    : users.filter(u => u.role === filterRole);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all system users (staff & customers)</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Filter by Role */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterRole('all')}
          className={`px-4 py-2 rounded-lg ${filterRole === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          All ({users.length})
        </button>
        <button
          onClick={() => setFilterRole('admin')}
          className={`px-4 py-2 rounded-lg ${filterRole === 'admin' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Admins ({users.filter(u => u.role === 'admin').length})
        </button>
        <button
          onClick={() => setFilterRole('manager')}
          className={`px-4 py-2 rounded-lg ${filterRole === 'manager' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Managers ({users.filter(u => u.role === 'manager').length})
        </button>
        <button
          onClick={() => setFilterRole('employee')}
          className={`px-4 py-2 rounded-lg ${filterRole === 'employee' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Employees ({users.filter(u => u.role === 'employee').length})
        </button>
        <button
          onClick={() => setFilterRole('customer')}
          className={`px-4 py-2 rounded-lg ${filterRole === 'customer' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Customers ({users.filter(u => u.role === 'customer').length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading users...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRoleBadge(user.role)}`}>
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(user.role)}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.phoneNumber || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.city ? `${user.city}, ${user.country}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSave={loadUsers}
        />
      )}
    </div>
  );
};

const UserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    role: user?.role || 'customer',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    zipCode: user?.zipCode || '',
    city: user?.city || '',
    country: user?.country || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        const updateData = { 
          role: formData.role,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          zipCode: formData.zipCode,
          city: formData.city,
          country: formData.country
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await api.put(`/users/${user.id}`, updateData);
      } else {
        // Use /users endpoint for admin to create users with any role
        await api.post('/users', {
          email: formData.email,
          password: formData.password,
          role: formData.role,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          zipCode: formData.zipCode,
          city: formData.city,
          country: formData.country
        });
      }
      onSave();
      onClose();
    } catch (error) {
      alert('Failed to save user: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {user ? 'Edit User' : 'Add New User'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={!!user}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password {user ? '(leave blank to keep current)' : '*'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!user}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="customer">Customer</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save User'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
