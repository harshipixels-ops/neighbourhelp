import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  ClipboardList,
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Ban,
  RotateCcw,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadAdminData();
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [dash, usersData, reqsData, reportsData] = await Promise.all([
        api.admin.getDashboard(),
        api.admin.getUsers(),
        api.admin.getRequests(),
        api.admin.getReports()
      ]);
      setStats(dash.stats);
      setRecentActivity(dash.recentActivity || []);
      setUsersList(usersData.users || []);
      setRequestsList(reqsData.requests || []);
      setReportsList(reportsData.reports || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      setActionLoading(true);
      await api.admin.updateUserStatus(userId, newStatus);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleModerateRequest = async (requestId, action) => {
    const promptMsg = action === 'delete'
      ? 'Are you sure you want to PERMANENTLY DELETE this request?'
      : 'Cancel this request for policy compliance?';
    if (!window.confirm(promptMsg)) return;

    try {
      setActionLoading(true);
      if (action === 'delete') {
        await api.admin.deleteRequest(requestId);
      } else {
        await api.admin.moderateRequest(requestId, 'cancel');
      }
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to moderate request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateReport = async (reportId, newStatus) => {
    try {
      setActionLoading(true);
      await api.admin.updateReport(reportId, newStatus);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update report.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = usersList.filter(u => {
    if (!searchUser.trim()) return true;
    const q = searchUser.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.neighbourhood || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-rose-500/10 border border-rose-300 dark:border-rose-900/60 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-main">
            Platform Moderation & Safety
          </h1>
          <p className="text-xs text-muted-custom">
            Review user activities, moderate reported posts, and maintain a safe community environment.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAdminData}
          className="px-4 py-2 rounded-xl bg-surface border border-theme text-main text-xs font-semibold hover:bg-surface-hover flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-theme">
        {[
          { id: 'overview', label: 'Platform Overview', icon: ShieldCheck, count: null },
          { id: 'users', label: 'User Accounts', icon: Users, count: usersList.length },
          { id: 'requests', label: 'All Requests', icon: ClipboardList, count: requestsList.length },
          { id: 'reports', label: 'Reported Content', icon: Flag, count: reportsList.filter(r => r.status === 'pending').length }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 font-bold rounded-t-xl transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary-brand text-primary-brand bg-primary-light/40'
                  : 'text-muted-custom hover:text-main hover:bg-surface-hover'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  tab.id === 'reports' && tab.count > 0 ? 'bg-rose-500 text-white' : 'bg-theme text-main'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface border border-theme rounded-3xl p-5 shadow-custom space-y-1">
              <span className="text-xs font-medium text-muted-custom">Total Users</span>
              <p className="text-2xl font-black text-main">{stats?.users?.total || 0}</p>
              <span className="text-[11px] text-emerald-600 block">{stats?.users?.active || 0} active</span>
            </div>

            <div className="bg-surface border border-theme rounded-3xl p-5 shadow-custom space-y-1">
              <span className="text-xs font-medium text-muted-custom">Total Requests</span>
              <p className="text-2xl font-black text-main">{stats?.requests?.total || 0}</p>
              <span className="text-[11px] text-primary-brand block">{stats?.requests?.open || 0} open right now</span>
            </div>

            <div className="bg-surface border border-theme rounded-3xl p-5 shadow-custom space-y-1">
              <span className="text-xs font-medium text-muted-custom">Completed Tasks</span>
              <p className="text-2xl font-black text-teal-600">{stats?.requests?.completed || 0}</p>
              <span className="text-[11px] text-muted-custom block">Successfully resolved</span>
            </div>

            <div className="bg-surface border border-theme rounded-3xl p-5 shadow-custom space-y-1">
              <span className="text-xs font-medium text-muted-custom">Pending Reports</span>
              <p className={`text-2xl font-black ${stats?.reports?.pending > 0 ? 'text-rose-600' : 'text-main'}`}>
                {stats?.reports?.pending || 0}
              </p>
              <span className="text-[11px] text-muted-custom block">Requires moderation review</span>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-surface border border-theme rounded-3xl p-6 shadow-custom space-y-4">
            <h3 className="text-base font-bold text-main">Recent Platform Activity</h3>
            {recentActivity.length === 0 ? (
              <p className="text-xs text-muted-custom">No recent activity logged.</p>
            ) : (
              <div className="divide-y divide-theme">
                {recentActivity.map((act, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${act.type === 'report' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <span className="font-semibold text-main">
                        {act.type === 'report' ? `Reported: ${act.reason}` : `Request: ${act.title}`}
                      </span>
                    </div>
                    <span className="text-muted-custom text-[11px]">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-surface border border-theme rounded-3xl p-6 shadow-custom space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-theme">
            <h3 className="text-base font-bold text-main">Registered Community Users ({usersList.length})</h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-muted-custom absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-1 focus:ring-primary-brand"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-theme text-muted-custom font-semibold">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Neighbourhood</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Activity</th>
                  <th className="pb-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-surface-hover/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={u.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover border border-theme"
                        />
                        <div>
                          <p className="font-bold text-main">{u.name}</p>
                          <p className="text-[10px] text-muted-custom">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-muted-custom">{u.neighbourhood}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        u.status === 'suspended' ? 'bg-rose-100 text-rose-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-muted-custom">
                      {u.requestsCount || 0} reqs • {u.offersCount || 0} offers
                    </td>
                    <td className="py-3 text-right">
                      {u.role !== 'admin' && (
                        <div className="inline-flex items-center gap-1.5">
                          {u.status === 'active' ? (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleUpdateUserStatus(u._id, 'suspended')}
                              className="px-2.5 py-1 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleUpdateUserStatus(u._id, 'active')}
                              className="px-2.5 py-1 rounded-lg border border-emerald-300 text-emerald-600 hover:bg-emerald-50 text-[11px] font-semibold"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REQUEST MODERATION */}
      {activeTab === 'requests' && (
        <div className="bg-surface border border-theme rounded-3xl p-6 shadow-custom space-y-4">
          <h3 className="text-base font-bold text-main pb-2 border-b border-theme">
            All Assistance Requests ({requestsList.length})
          </h3>

          <div className="space-y-3">
            {requestsList.map(req => (
              <div
                key={req._id}
                className="p-4 rounded-2xl bg-surface-hover/60 border border-theme/70 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-main truncate">{req.title}</span>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-muted-custom line-clamp-1">{req.description}</p>
                  <p className="text-[11px] text-muted-custom">
                    Posted by: <strong>{req.requesterId?.name || 'User'}</strong> ({req.requesterId?.email}) • 📍 {req.neighbourhood}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/requests/${req._id}`)}
                    className="px-3 py-1.5 rounded-xl bg-surface border border-theme text-xs font-semibold hover:bg-surface-hover"
                  >
                    View
                  </button>

                  {req.status !== 'cancelled' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleModerateRequest(req._id, 'cancel')}
                      className="px-3 py-1.5 rounded-xl border border-amber-300 text-amber-700 hover:bg-amber-50 text-xs font-semibold"
                    >
                      Cancel Post
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleModerateRequest(req._id, 'delete')}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REPORTED CONTENT */}
      {activeTab === 'reports' && (
        <div className="bg-surface border border-theme rounded-3xl p-6 shadow-custom space-y-4">
          <h3 className="text-base font-bold text-main pb-2 border-b border-theme">
            Reported Content & Safety Queue ({reportsList.length})
          </h3>

          {reportsList.length === 0 ? (
            <p className="text-xs text-muted-custom py-6 text-center">
              No reports in queue. The community is clean and safe!
            </p>
          ) : (
            <div className="space-y-4">
              {reportsList.map(rep => (
                <div
                  key={rep._id}
                  className="p-5 rounded-2xl bg-surface-hover/70 border border-theme space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                        <Flag className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-main">Reason: {rep.reason}</h4>
                        <p className="text-[10px] text-muted-custom">
                          Reported by: {rep.reporter?.name || 'Member'} ({rep.reporter?.email}) • {new Date(rep.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      rep.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {rep.status.toUpperCase()}
                    </span>
                  </div>

                  {rep.details && (
                    <p className="text-xs text-main bg-surface p-3 rounded-xl border border-theme leading-relaxed">
                      Details provided by reporter: "{rep.details}"
                    </p>
                  )}

                  {rep.targetRequest && (
                    <div className="p-3 rounded-xl bg-surface border border-theme text-xs space-y-1">
                      <span className="text-[10px] font-bold text-muted-custom uppercase">Reported Post:</span>
                      <p className="font-bold text-main">{rep.targetRequest.title}</p>
                      <p className="text-muted-custom line-clamp-1">{rep.targetRequest.description}</p>
                    </div>
                  )}

                  {/* Moderation Controls */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-theme/60">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdateReport(rep._id, 'dismissed')}
                      className="px-3 py-1.5 rounded-xl border border-theme text-xs font-medium text-muted-custom hover:bg-surface-hover"
                    >
                      Dismiss Report
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdateReport(rep._id, 'resolved')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

