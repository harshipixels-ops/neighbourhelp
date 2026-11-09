import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, PlusCircle, RefreshCw, MapPin } from 'lucide-react';
import { api } from '../services/api';
import RequestCard from '../components/RequestCard';
import CategoryIcon, { CATEGORIES } from '../components/CategoryIcon';

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.requests.getRequests();
      setRequests(res.requests || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Extract unique neighbourhoods from loaded requests for dropdown filter
  const neighbourhoods = useMemo(() => {
    const set = new Set();
    requests.forEach(r => {
      if (r.neighbourhood) set.add(r.neighbourhood);
    });
    return Array.from(set).sort();
  }, [requests]);

  // Client-side filtering & sorting for instant responsiveness
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      // Category filter
      if (selectedCategory !== 'All' && r.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'All' && r.status !== selectedStatus) {
        return false;
      }

      // Neighbourhood filter
      if (selectedNeighbourhood !== 'All' && r.neighbourhood !== selectedNeighbourhood) {
        return false;
      }

      // Search term filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const titleMatch = (r.title || '').toLowerCase().includes(query);
        const descMatch = (r.description || '').toLowerCase().includes(query);
        const locMatch = (r.neighbourhood || '').toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !locMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'status') {
        return (a.status || '').localeCompare(b.status || '');
      }
      return 0;
    });
  }, [requests, selectedCategory, selectedStatus, selectedNeighbourhood, search, sortBy]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedNeighbourhood('All');
    setSortBy('newest');
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-main tracking-tight">
            Browse Assistance Requests
          </h1>
          <p className="text-xs sm:text-sm text-muted-custom mt-1">
            Discover community requests near you and volunteer where you can help.
          </p>
        </div>

        <Link
          to="/create-request"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary-brand text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-xs self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ask for Help</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-surface border border-theme rounded-3xl p-4 sm:p-5 shadow-custom space-y-4">
        {/* Search input + dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords or title..."
              className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
            />
          </div>

          {/* Neighbourhood select */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-muted-custom absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedNeighbourhood}
              onChange={(e) => setSelectedNeighbourhood(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand appearance-none"
            >
              <option value="All">All Neighbourhoods</option>
              {neighbourhoods.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Status select */}
          <div className="relative">
            <SlidersHorizontal className="w-4 h-4 text-muted-custom absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="open">Open for Volunteers</option>
              <option value="pending">Pending Offers</option>
              <option value="accepted">Accepted</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="status">Sort: By Status</option>
            </select>

            <button
              type="button"
              onClick={fetchRequests}
              className="p-2.5 rounded-xl border border-theme text-muted-custom hover:text-main hover:bg-surface-hover transition-colors shrink-0"
              title="Refresh requests"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="pt-2 border-t border-theme/60 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => handleCategoryClick('All')}
            className={`px-3 py-1.5 rounded-full font-semibold transition-colors shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-primary-brand text-white'
                : 'bg-surface-hover text-main hover:bg-theme'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-primary-brand text-white'
                  : 'bg-surface-hover text-main hover:bg-theme'
              }`}
            >
              <CategoryIcon category={cat} className="w-3.5 h-3.5" />
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted-custom">
        <span>Showing <strong>{filteredRequests.length}</strong> assistance requests</span>
        {(selectedCategory !== 'All' || selectedStatus !== 'All' || selectedNeighbourhood !== 'All' || search) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-primary-brand font-semibold hover:underline"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Request Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 rounded-3xl bg-surface border border-theme animate-pulse" />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-surface border border-theme rounded-3xl p-12 text-center space-y-4 shadow-custom">
          <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary-brand flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-main">No requests matched your filters</h3>
          <p className="text-xs text-muted-custom max-w-sm mx-auto">
            Try adjusting your category, neighbourhood or search keywords, or reset your filters to see all available requests.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-primary-brand text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <RequestCard key={req._id} request={req} onRefresh={fetchRequests} />
          ))}
        </div>
      )}
    </div>
  );
}

